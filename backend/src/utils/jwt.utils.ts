import jwt from 'jsonwebtoken';
import { AppError } from './app-error';
import { HTTP_STATUS } from '../constants';
import env from '../config/env';

// ─── Payload Types ────────────────────────────────────────────────────────────

/** Payload embedded in every access token. */
export interface AccessTokenPayload {
  type: 'access';
  /** userId serialised as string (JWT `sub` standard field). */
  sub: string;
  userId: number;
  email: string;
  role: string;
  exp?: number;
}

/** Payload embedded in every refresh token. */
export interface RefreshTokenPayload {
  type: 'refresh';
  /** userId serialised as string. */
  sub: string;
  /** Unique session identifier stored in Redis. */
  jti: string;
  /** Absolute session deadline; rotation must never extend it. */
  exp?: number;
}

// ─── Token generators ─────────────────────────────────────────────────────────

export const generateAccessToken = (user: {
  id: number;
  email: string;
  role: string;
}, absoluteExpiresAtSeconds?: number): string => {
  const payload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
    type: 'access',
    sub: String(user.id),
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  if (absoluteExpiresAtSeconds !== undefined) {
    if (!Number.isInteger(absoluteExpiresAtSeconds) || absoluteExpiresAtSeconds <= Math.floor(Date.now() / 1000)) {
      throw new AppError('Phiên đã hết hạn', HTTP_STATUS.UNAUTHORIZED);
    }
    const accessDeadline = Math.min(absoluteExpiresAtSeconds, Math.floor(Date.now() / 1000) + env.ACCESS_TTL_SECONDS);
    return jwt.sign({ ...payload, exp: accessDeadline }, env.JWT_ACCESS_SECRET, { algorithm: 'HS256' });
  }
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.ACCESS_TTL_SECONDS,
  });
};

export const generateRefreshToken = (userId: number, jti: string, absoluteExpiresAtSeconds?: number): string => {
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    type: 'refresh',
    sub: String(userId),
    jti,
  };
  if (absoluteExpiresAtSeconds !== undefined) {
    if (!Number.isInteger(absoluteExpiresAtSeconds) || absoluteExpiresAtSeconds <= Math.floor(Date.now() / 1000)) {
      throw new AppError('Phiên đã hết hạn', HTTP_STATUS.UNAUTHORIZED);
    }
    return jwt.sign({ ...payload, exp: absoluteExpiresAtSeconds }, env.JWT_REFRESH_SECRET, { algorithm: 'HS256' });
  }
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.REFRESH_TTL_SECONDS,
  });
};

// ─── Token verifiers ──────────────────────────────────────────────────────────

/** Verifies an access token. Throws AppError 401 on any failure. */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    }) as AccessTokenPayload;

    if (payload.type !== 'access') {
      throw new AppError('Token không hợp lệ', HTTP_STATUS.UNAUTHORIZED);
    }
    return payload;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Token không hợp lệ hoặc đã hết hạn', HTTP_STATUS.UNAUTHORIZED);
  }
};

/** Verifies a refresh token. Throws AppError 401 on any failure. */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
    }) as RefreshTokenPayload;

    if (payload.type !== 'refresh') {
      throw new AppError('Token không hợp lệ', HTTP_STATUS.UNAUTHORIZED);
    }
    return payload;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Token không hợp lệ hoặc đã hết hạn', HTTP_STATUS.UNAUTHORIZED);
  }
};
