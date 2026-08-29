import jwt from 'jsonwebtoken';
import { JwtPayload, RefreshTokenPayload } from '../types/common.types';

const accessSecret = (): string => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error('JWT_SECRET chưa được cấu hình');
  return secret;
};

const refreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET?.trim() || process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error('JWT_REFRESH_SECRET chưa được cấu hình');
  return secret;
};

const accessExpiresIn = (): jwt.SignOptions['expiresIn'] =>
  (process.env.JWT_EXPIRES_IN?.trim() || '15m') as jwt.SignOptions['expiresIn'];

const refreshExpiresIn = (): jwt.SignOptions['expiresIn'] =>
  (process.env.JWT_REFRESH_EXPIRES_IN?.trim() || '30d') as jwt.SignOptions['expiresIn'];

export const generateAccessToken = (
  payload: Omit<JwtPayload, 'type'>
): string => {
  return jwt.sign({ ...payload, type: 'access' }, accessSecret(), {
    expiresIn: accessExpiresIn(),
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const payload = jwt.verify(token, accessSecret()) as JwtPayload;
  if (payload.type !== 'access') throw new Error('Sai loại access token');
  return payload;
};

export const generateRefreshToken = (
  payload: Omit<RefreshTokenPayload, 'type'>
): { token: string; expiresAt: Date } => {
  const token = jwt.sign({ ...payload, type: 'refresh' }, refreshSecret(), {
    expiresIn: refreshExpiresIn(),
  });
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string' || typeof decoded.exp !== 'number') {
    throw new Error('Không thể xác định hạn refresh token');
  }

  return { token, expiresAt: new Date(decoded.exp * 1000) };
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const payload = jwt.verify(token, refreshSecret()) as RefreshTokenPayload;
  if (payload.type !== 'refresh' || !payload.tokenId) {
    throw new Error('Sai loại refresh token');
  }
  return payload;
};
