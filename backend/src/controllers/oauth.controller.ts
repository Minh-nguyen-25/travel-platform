import { Request, Response } from 'express';
import passport from 'passport';
import env from '../config/env';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS, AUTH_PROVIDER, OAUTH_ERROR_CODES } from '../constants';
import {
  setGoogleOAuthStateCookie,
  setFacebookOAuthStateCookie,
  getFacebookOAuthStateFromRequest,
  getGoogleOAuthStateFromRequest,
  clearOAuthStateCookie,
  GOOGLE_OAUTH_STATE_COOKIE_NAME,
  FACEBOOK_OAUTH_STATE_COOKIE_NAME,
  setRefreshTokenCookie,
} from '../utils/auth-cookie.utils';
import {
  createOAuthState,
  consumeOAuthState,
  validateReturnPath,
  createOAuthTicket,
  consumeOAuthTicket,
} from '../utils/oauth-state.utils';
import { findOrCreateOAuthUser, exchangeFacebookCode, issueOAuthTokens } from '../services/oauth.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Redirects to the configured failure URL appending a single fixed error code.
 * Raw provider messages, tokens, and stack traces NEVER appear in the URL.
 */
const redirectFailure = (res: Response, code: string): void => {
  const url = new URL(env.OAUTH_FAILURE_REDIRECT);
  url.searchParams.set('error', code);
  res.redirect(url.toString());
};

// ─── Google ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/google
 * Validates the optional `?from=` query param, stores returnPath server-side,
 * generates a random CSRF state, sets an HttpOnly state cookie, then redirects
 * to Google's authorization endpoint.
 *
 * The returnPath is stored in Redis tied to the state key — never in the URL.
 */
export const googleInit = async (req: Request, res: Response): Promise<void> => {
  if (!env.GOOGLE_OAUTH_CONFIGURED) {
    throw new AppError(OAUTH_ERROR_CODES.CONFIG_ERROR, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  const rawFrom = req.query['from'] as string | undefined;
  const returnPath = validateReturnPath(rawFrom);

  const state = await createOAuthState(returnPath);
  setGoogleOAuthStateCookie(res, state);

  // passport.authenticate builds the Google auth URL with scope and state,
  // then calls res.redirect() — no need to call res.redirect ourselves.
  passport.authenticate('google', {
    scope: ['openid', 'email', 'profile'],
    state,
    session: false,
  })(req, res);
};

/**
 * GET /api/v1/auth/google/callback
 *
 * Order of operations (CRITICAL — state validated before ANY provider call):
 * 1. Clear state cookie immediately (prevents reuse even on error)
 * 2. Validate state cookie === query.state (CSRF check)
 * 3. consumeOAuthState() GETDEL — atomic, rejects replayed states
 * 4. Only after all state checks pass → invoke passport.authenticate()
 * 5. On success → issue refresh session, issue 60s return ticket, redirect to frontend with ticket
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  // ── 1. Clear state cookie immediately (both success and failure paths) ──────
  clearOAuthStateCookie(res, GOOGLE_OAUTH_STATE_COOKIE_NAME, '/api/v1/auth/google');

  // ── 2. CSRF cookie vs query state comparison ──────────────────────────────
  const cookieState  = getGoogleOAuthStateFromRequest(req);
  const queryState   = req.query['state'] as string | undefined;

  if (!cookieState || !queryState || cookieState !== queryState) {
    redirectFailure(res, OAUTH_ERROR_CODES.STATE_INVALID);
    return;
  }

  // ── 3. Consume state from Redis (GETDEL — single-use, atomic) ────────────
  const stateData = await consumeOAuthState(cookieState);
  if (!stateData) {
    // Key was missing (expired) or already consumed (replayed)
    redirectFailure(res, OAUTH_ERROR_CODES.STATE_EXPIRED);
    return;
  }

  // ── 4. State valid — now invoke passport (triggers Google userinfo call) ──
  passport.authenticate(
    'google',
    { session: false, failWithError: false },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (err: unknown, user: any, info: { message?: string } | undefined) => {
      if (err || !user) {
        const code =
          (info as { message?: string } | undefined)?.message ??
          OAUTH_ERROR_CODES.PROVIDER_ERROR;
        redirectFailure(res, code);
        return;
      }

      // ── 5. Issue session, create ticket, redirect ─────────────────────────
      try {
        const oauthUser = user as Awaited<ReturnType<typeof findOrCreateOAuthUser>>;
        const { refreshToken } = await issueOAuthTokens(oauthUser);
        setRefreshTokenCookie(res, refreshToken);

        const ticket = await createOAuthTicket(oauthUser.id, stateData.returnPath);
        const successUrl = new URL(env.OAUTH_SUCCESS_REDIRECT);
        successUrl.searchParams.set('ticket', ticket);
        res.redirect(successUrl.toString());
      } catch {
        redirectFailure(res, OAUTH_ERROR_CODES.PROVIDER_ERROR);
      }
    }
  )(req, res);
};

// ─── Facebook ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/facebook
 * Same pattern as googleInit — stores returnPath in Redis, sets state cookie,
 * redirects to Facebook's OAuth dialog.
 */
export const facebookInit = async (req: Request, res: Response): Promise<void> => {
  if (!env.FACEBOOK_OAUTH_CONFIGURED) {
    throw new AppError(OAUTH_ERROR_CODES.CONFIG_ERROR, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  const rawFrom = req.query['from'] as string | undefined;
  const returnPath = validateReturnPath(rawFrom);

  const state = await createOAuthState(returnPath);
  setFacebookOAuthStateCookie(res, state);

  const authUrl = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  authUrl.searchParams.set('client_id', env.FACEBOOK_APP_ID);
  authUrl.searchParams.set('redirect_uri', env.FACEBOOK_CALLBACK_URL);
  authUrl.searchParams.set('scope', 'public_profile,email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('response_type', 'code');

  res.redirect(authUrl.toString());
};

/**
 * GET /api/v1/auth/facebook/callback
 *
 * Same security order as googleCallback:
 * 1. Clear state cookie immediately
 * 2. Validate CSRF state (cookie vs query)
 * 3. consumeOAuthState GETDEL (single-use, atomic)
 * 4. Only then: exchange code → find/create user → issue session → issue ticket → redirect
 */
export const facebookCallback = async (req: Request, res: Response): Promise<void> => {
  // ── 1. Clear state cookie immediately ────────────────────────────────────
  clearOAuthStateCookie(res, FACEBOOK_OAUTH_STATE_COOKIE_NAME, '/api/v1/auth/facebook');

  // ── 2. CSRF cookie vs query state comparison ──────────────────────────────
  const cookieState  = getFacebookOAuthStateFromRequest(req);
  const queryState   = req.query['state'] as string | undefined;

  if (!cookieState || !queryState || cookieState !== queryState) {
    redirectFailure(res, OAUTH_ERROR_CODES.STATE_INVALID);
    return;
  }

  // ── 3. Consume state from Redis (GETDEL — single-use, atomic) ────────────
  const stateData = await consumeOAuthState(cookieState);
  if (!stateData) {
    redirectFailure(res, OAUTH_ERROR_CODES.STATE_EXPIRED);
    return;
  }

  // ── Provider error from Facebook (user denied, app error, etc.) ──────────
  const providerError = req.query['error'] as string | undefined;
  if (providerError) {
    // Do not surface provider error_description — use fixed code
    redirectFailure(res, OAUTH_ERROR_CODES.PROVIDER_ERROR);
    return;
  }

  const code = req.query['code'] as string | undefined;
  if (!code) {
    redirectFailure(res, OAUTH_ERROR_CODES.PROVIDER_ERROR);
    return;
  }

  // ── 4. Exchange code → profile → find/create → issue session ─────────────
  try {
    const profile = await exchangeFacebookCode(code, env.FACEBOOK_CALLBACK_URL);
    const user = await findOrCreateOAuthUser({
      provider:   AUTH_PROVIDER.FACEBOOK,
      providerId: profile.providerId,
      email:      profile.email,
      fullName:   profile.fullName,
      avatarUrl:  profile.avatarUrl,
    });

    const { refreshToken } = await issueOAuthTokens(user);
    setRefreshTokenCookie(res, refreshToken);

    const ticket = await createOAuthTicket(user.id, stateData.returnPath);
    const successUrl = new URL(env.OAUTH_SUCCESS_REDIRECT);
    successUrl.searchParams.set('ticket', ticket);
    res.redirect(successUrl.toString());
  } catch (err) {
    const code = (err as { message?: string }).message;
    // Only forward if it is a known fixed error code
    const safeCode = Object.values(OAUTH_ERROR_CODES).includes(
      code as (typeof OAUTH_ERROR_CODES)[keyof typeof OAUTH_ERROR_CODES]
    )
      ? code!
      : OAUTH_ERROR_CODES.PROVIDER_ERROR;
    redirectFailure(res, safeCode);
  }
};

// ─── Consume Return Ticket ────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/oauth/consume-ticket
 * Authenticated endpoint (requires access token).
 * Atomically consumes a single-use return-path ticket bound to the authenticated user.
 * Missing, expired, replayed or mismatched tickets safely fall back to "/".
 */
export const consumeReturnTicket = async (req: Request, res: Response): Promise<void> => {
  const ticket = req.body?.ticket as string | undefined;
  const userId = req.user?.id;
  if (!userId) {
    res.status(HTTP_STATUS.OK).json({ success: true, data: { returnPath: '/' } });
    return;
  }
  const returnPath = ticket ? await consumeOAuthTicket(ticket, userId) : '/';
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { returnPath },
  });
};

