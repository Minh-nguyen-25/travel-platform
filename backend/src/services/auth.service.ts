import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS, ROLE, AUTH_PROVIDER } from '../constants';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { setSession, consumeSession, deleteSession, revokeAllUserSessions } from '../utils/token-session';
import * as userRepo from '../repositories/user.repository';
import type { RegisterDto, LoginDto } from '../validators/auth.validator';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export interface SafeUser extends Omit<User, 'passwordHash'> {
  provider: string;
  hasPassword: boolean;
}

/** Returns a sanitised user object with passwordHash stripped and safe auth metadata. */
const sanitise = (
  user: Omit<User, 'passwordHash'> & { passwordHash?: string | null; hasPassword?: boolean }
): SafeUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _omitted, ...safe } = user;
  return {
    ...safe,
    provider: user.authProvider.toLowerCase(),
    hasPassword: typeof user.hasPassword === 'boolean' ? user.hasPassword : Boolean(user.passwordHash),
  };
};

/**
 * Factory function — creates a fresh AppError on every call.
 * Reusing a single instance can leak stack traces across requests.
 */
const invalidCredentials = () =>
  new AppError('Email hoặc mật khẩu không đúng', HTTP_STATUS.UNAUTHORIZED);

// ─── Register ─────────────────────────────────────────────────────────────────

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export const register = async (dto: RegisterDto): Promise<AuthResult> => {
  // Normalise — schema already trims/lowercases, this is belt-and-suspenders
  const email    = dto.email.trim().toLowerCase();
  const fullName = dto.fullName.trim();

  // Duplicate check before hashing (fast path)
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new AppError('Email đã được sử dụng', HTTP_STATUS.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(dto.password, 12);

  let user: Omit<User, 'passwordHash'>;
  try {
    user = await userRepo.createUser({
      fullName,
      email,
      passwordHash,
      role:         ROLE.USER,
      authProvider: AUTH_PROVIDER.LOCAL,
    });
  } catch (err) {
    // Handle unique-constraint race between findByEmail and createUser
    if (
      err instanceof PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new AppError('Email đã được sử dụng', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }

  const jti          = randomUUID();
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id, jti);
  await setSession(jti, user.id);

  return { user: sanitise({ ...user, hasPassword: true }), accessToken, refreshToken };
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (dto: LoginDto): Promise<AuthResult> => {
  const email = dto.email.trim().toLowerCase();

  // Load full record (includes passwordHash for comparison)
  const record = await userRepo.findByEmail(email);

  // Step 1: unknown email → generic 401
  if (!record) throw invalidCredentials();

  // Step 2: wrong auth provider → generic 401 (same message)
  if (record.authProvider !== AUTH_PROVIDER.LOCAL) throw invalidCredentials();

  // Step 3: wrong password → generic 401 (same message)
  // bcrypt.compare is inherently constant-time
  const passwordMatch = await bcrypt.compare(dto.password, record.passwordHash ?? '');
  if (!passwordMatch) throw invalidCredentials();

  // Step 4: password is correct but account is inactive → 403 (distinct)
  // Only revealed after credentials are verified to limit enumeration
  if (!record.isActive) {
    throw new AppError('Tài khoản đã bị vô hiệu hóa', HTTP_STATUS.FORBIDDEN);
  }

  const jti          = randomUUID();
  const accessToken  = generateAccessToken(record);
  const refreshToken = generateRefreshToken(record.id, jti);
  await setSession(jti, record.id);

  return { user: sanitise(record), accessToken, refreshToken };
};

// ─── Refresh ──────────────────────────────────────────────────────────────────

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export const refreshAccessToken = async (
  rawRefreshToken: string
): Promise<RefreshResult> => {
  // Verify JWT signature, expiry, and type claim
  const payload = verifyRefreshToken(rawRefreshToken);

  // Atomically consume the session — only one concurrent caller succeeds
  const storedUserId = await consumeSession(payload.jti);
  if (storedUserId === null) {
    throw new AppError('Phiên đã hết hạn hoặc đã được sử dụng', HTTP_STATUS.UNAUTHORIZED);
  }

  // Cross-check: Redis userId must match JWT sub to detect tampering
  if (storedUserId !== payload.sub) {
    throw new AppError('Phiên không hợp lệ', HTTP_STATUS.UNAUTHORIZED);
  }

  const userId = Number(payload.sub);

  // Verify user still exists and is active
  const user = await userRepo.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError('Tài khoản không hợp lệ', HTTP_STATUS.UNAUTHORIZED);
  }

  // Rotate — new JTI for next cycle
  const newJti         = randomUUID();
  const accessToken    = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(userId, newJti);
  await setSession(newJti, userId);

  return { accessToken, refreshToken: newRefreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = async (rawRefreshToken: string | undefined): Promise<void> => {
  if (!rawRefreshToken) return; // No cookie — nothing to revoke

  try {
    const payload = verifyRefreshToken(rawRefreshToken);
    await deleteSession(payload.jti, Number(payload.sub));
    // deleteSession re-throws Redis failures — they will propagate here
  } catch (err) {
    if (err instanceof AppError && err.statusCode === HTTP_STATUS.UNAUTHORIZED) {
      // Token is missing, expired, or invalid — no session to revoke; silent ignore
      return;
    }
    // JWT library errors (TokenExpiredError, JsonWebTokenError) — also ignore
    const name = (err as Error).name;
    if (name === 'TokenExpiredError' || name === 'JsonWebTokenError' || name === 'NotBeforeError') {
      return;
    }
    // Anything else (Redis connection error, unexpected) — re-throw
    throw err;
  }
};

export const replaceAllSessionsForUser = async (user: User): Promise<AuthResult> => {
  await revokeAllUserSessions(user.id);
  const jti = randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id, jti);
  await setSession(jti, user.id);
  return { user: sanitise(user), accessToken, refreshToken };
};

export const authService = {
  register,
  login,
  refreshAccessToken,
  logout,
  replaceAllSessionsForUser,
  revokeAllUserSessions,
};
