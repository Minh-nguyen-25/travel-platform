import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS, AUTH_PROVIDER, ROLE, OAUTH_ERROR_CODES } from '../constants';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';
import { setSession } from '../utils/token-session';
import prisma from '../config/db';
import env from '../config/env';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OAuthProvider = 'GOOGLE' | 'FACEBOOK';

export interface OAuthProfile {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface SafeOAuthUser extends Omit<User, 'passwordHash'> {
  provider: string;
  hasPassword: boolean;
}

export interface OAuthAuthResult {
  user: SafeOAuthUser;
  accessToken: string;
  refreshToken: string;
}

// ─── Return-path safe omission ────────────────────────────────────────────────

const omitPassword = (
  user: Omit<User, 'passwordHash'> & { passwordHash?: string | null; hasPassword?: boolean }
): SafeOAuthUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _omitted, ...safe } = user;
  return {
    ...safe,
    provider: user.authProvider.toLowerCase(),
    hasPassword: typeof user.hasPassword === 'boolean' ? user.hasPassword : Boolean(user.passwordHash),
  };
};

// ─── AppError factories using fixed error codes ───────────────────────────────

const lockedError = (): AppError =>
  new AppError(OAUTH_ERROR_CODES.ACCOUNT_LOCKED, HTTP_STATUS.FORBIDDEN);

const conflictLocalError = (): AppError =>
  new AppError(OAUTH_ERROR_CODES.EMAIL_CONFLICT_LOCAL, HTTP_STATUS.CONFLICT);

const conflictProviderError = (): AppError =>
  new AppError(OAUTH_ERROR_CODES.EMAIL_CONFLICT_PROVIDER, HTTP_STATUS.CONFLICT);

// ─── findOrCreateOAuthUser ────────────────────────────────────────────────────

/**
 * Finds an existing user by (authProvider, providerId), or creates a new one.
 *
 * Security guarantees:
 * 1. Lookup by providerId first — exact provider match.
 * 2. If email belongs to a different provider → reject with CONFLICT code (no auto-link).
 * 3. Locked accounts (isActive=false) → FORBIDDEN.
 * 4. New accounts: role=USER, isActive=true, passwordHash omitted.
 * 5. Existing account fields (role, isActive, passwordHash, authProvider, providerId) NEVER mutated.
 * 6. P2002 race: caught and resolved to the correct conflict type without double-mutation.
 */
export const findOrCreateOAuthUser = async (
  profile: OAuthProfile
): Promise<SafeOAuthUser> => {
  const { provider, providerId, email, fullName, avatarUrl } = profile;

  // ── 1. Lookup by (authProvider, providerId) — unique constraint ─────────────
  const byProvider = await prisma.user.findUnique({
    where: { authProvider_providerId: { authProvider: provider, providerId } },
  });

  if (byProvider) {
    if (!byProvider.isActive) throw lockedError();
    return omitPassword(byProvider);
  }

  // ── 2. Lookup by email ───────────────────────────────────────────────────────
  const byEmail = await prisma.user.findUnique({ where: { email } });

  if (byEmail) {
    // Email belongs to an existing account — do NOT auto-link.
    // Use error code based on the conflicting account's provider type.
    if (byEmail.authProvider === AUTH_PROVIDER.LOCAL) throw conflictLocalError();
    throw conflictProviderError();
  }

  // ── 3. Create new OAuth account ──────────────────────────────────────────────
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        fullName: fullName.trim() || email,
        authProvider: provider,
        providerId,
        avatarUrl: avatarUrl ?? null,
        role: ROLE.USER,
        isActive: true,
        // passwordHash intentionally omitted — OAuth accounts have no password
      },
      omit: { passwordHash: true },
    });
    return omitPassword(newUser);
  } catch (err) {
    // ── P2002 race: another concurrent request created the user first ──────────
    // Use duck-type check on .code rather than instanceof to remain resilient
    // across Prisma version differences and to allow test mocking without importing
    // the full Prisma runtime.
    const prismaErr = err as { code?: string };
    if (prismaErr.code === 'P2002') {
      // Re-query to determine the exact state — retry is safe because we only READ
      const raceUser =
        (await prisma.user.findUnique({
          where: { authProvider_providerId: { authProvider: provider, providerId } },
        })) ?? (await prisma.user.findUnique({ where: { email } }));

      if (!raceUser) throw err; // Should never happen after P2002, but re-throw to be safe

      // If the race winner is the same provider+id → treat as a normal login
      if (raceUser.authProvider === provider && raceUser.providerId === providerId) {
        if (!raceUser.isActive) throw lockedError();
        return omitPassword(raceUser);
      }

      // Different provider or email — genuine conflict
      if (raceUser.authProvider === AUTH_PROVIDER.LOCAL) throw conflictLocalError();
      throw conflictProviderError();
    }
    throw err;
  }
};

// ─── issueOAuthTokens ─────────────────────────────────────────────────────────

/**
 * Creates a new JTI-based refresh session in Redis and issues both tokens.
 * Called after a successful OAuth callback — identical session semantics to local login.
 */
export const issueOAuthTokens = async (
  user: SafeOAuthUser | Omit<User, 'passwordHash'>
): Promise<OAuthAuthResult> => {
  const jti = randomUUID();
  const accessToken = generateAccessToken(user as User);
  const refreshToken = generateRefreshToken(user.id, jti);
  await setSession(jti, user.id);
  return { user: omitPassword(user as User), accessToken, refreshToken };
};

// ─── exchangeFacebookCode ─────────────────────────────────────────────────────
//
// Manual OAuth code exchange — no passport-facebook package needed.
// Uses Node 18+ native fetch (already available in this project's Node version).

interface FacebookTokenResponse {
  access_token?: string;
  error?: { message?: string; type?: string; code?: number };
}

interface FacebookUserProfile {
  id?: string;
  name?: string;
  email?: string;
  picture?: { data?: { url?: string } };
  error?: { message?: string };
}

/**
 * Exchanges a Facebook authorization code for an OAuthProfile.
 *
 * Step 1: POST to Facebook token endpoint → access_token
 * Step 2: GET /me?fields=id,name,email,picture → profile
 * Step 3: Validate email presence (Facebook may not provide one)
 *
 * Throws AppError with fixed OAUTH_ERROR_CODES — raw provider error details
 * are logged server-side only, never surfaced to the client.
 */
export const exchangeFacebookCode = async (
  code: string,
  redirectUri: string
): Promise<OAuthProfile> => {
  // ── Step 1: Token exchange ─────────────────────────────────────────────────
  const tokenUrl = new URL('https://graph.facebook.com/v20.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', env.FACEBOOK_APP_ID);
  tokenUrl.searchParams.set('client_secret', env.FACEBOOK_APP_SECRET);
  tokenUrl.searchParams.set('redirect_uri', redirectUri);
  tokenUrl.searchParams.set('code', code);

  let tokenData: FacebookTokenResponse;
  try {
    const tokenRes = await fetch(tokenUrl.toString(), { method: 'GET' });
    tokenData = await tokenRes.json() as FacebookTokenResponse;
  } catch {
    throw new AppError(OAUTH_ERROR_CODES.PROVIDER_ERROR, HTTP_STATUS.BAD_GATEWAY);
  }

  if (!tokenData.access_token) {
    // Safe static log without raw provider error details
    console.error('[OAuth/Facebook] Token exchange failed');
    throw new AppError(OAUTH_ERROR_CODES.PROVIDER_ERROR, HTTP_STATUS.BAD_GATEWAY);
  }

  // ── Step 2: Fetch user profile ─────────────────────────────────────────────
  const profileUrl = new URL('https://graph.facebook.com/me');
  profileUrl.searchParams.set('fields', 'id,name,email,picture.type(large)');
  profileUrl.searchParams.set('access_token', tokenData.access_token);

  let profile: FacebookUserProfile;
  try {
    const profileRes = await fetch(profileUrl.toString());
    profile = await profileRes.json() as FacebookUserProfile;
  } catch {
    throw new AppError(OAUTH_ERROR_CODES.PROVIDER_ERROR, HTTP_STATUS.BAD_GATEWAY);
  }

  if (!profile.id) {
    console.error('[OAuth/Facebook] Profile fetch failed');
    throw new AppError(OAUTH_ERROR_CODES.PROVIDER_ERROR, HTTP_STATUS.BAD_GATEWAY);
  }

  // ── Step 3: Email validation ───────────────────────────────────────────────
  // Facebook may not include email if: the user's Facebook account has no email,
  // the email is unconfirmed, or the user denied the email permission.
  if (!profile.email || !profile.email.trim()) {
    throw new AppError(OAUTH_ERROR_CODES.FACEBOOK_EMAIL_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }

  return {
    provider: AUTH_PROVIDER.FACEBOOK,
    providerId: profile.id,
    email: profile.email.trim().toLowerCase(),
    fullName: profile.name?.trim() ?? profile.email,
    avatarUrl: profile.picture?.data?.url ?? null,
  };
};
