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
}

/** Payload embedded in every refresh token. */
export interface RefreshTokenPayload {
  type: 'refresh';
  /** userId serialised as string. */
  sub: string;
  /** Unique session identifier stored in Redis. */
  jti: string;
}

// ─── Token generators ─────────────────────────────────────────────────────────

export const generateAccessToken = (user: {
  id: number;
  email: string;
  role: string;
}): string => {
  const payload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
    type: 'access',
    sub: String(user.id),
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (userId: number, jti: string): string => {
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    type: 'refresh',
    sub: String(userId),
    jti,
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
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
