import { CookieOptions, Request, Response } from 'express';
import env from '../config/env';

export const REFRESH_COOKIE_NAME = 'refreshToken';

export const buildCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.IS_PRODUCTION,
  sameSite: env.IS_PRODUCTION ? 'none' : 'lax',
  maxAge: env.COOKIE_MAX_AGE_MS,
  path: '/',
});

export const setRefreshTokenCookie = (
  res: Response,
  token: string,
  _expiresAt?: Date
): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, buildCookieOptions());
};

export const clearRefreshTokenCookie = (res: Response): void => {
  const { maxAge: _ignored, ...clearOpts } = buildCookieOptions();
  res.clearCookie(REFRESH_COOKIE_NAME, clearOpts);
};
