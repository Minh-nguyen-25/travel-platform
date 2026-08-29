import { CookieOptions, Request, Response } from 'express';

export const REFRESH_COOKIE_NAME =
  process.env.REFRESH_COOKIE_NAME?.trim() || 'travel_refresh_token';
export const GOOGLE_OAUTH_STATE_COOKIE_NAME = 'travel_google_oauth_state';

const cookieOptions = (path: string): CookieOptions => ({
  httpOnly: true,
  secure:
    process.env.COOKIE_SECURE === 'true' ||
    (process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production'),
  sameSite: 'lax',
  path,
  ...(process.env.COOKIE_DOMAIN?.trim() && { domain: process.env.COOKIE_DOMAIN.trim() }),
});

const parseCookies = (header?: string): Record<string, string> => {
  if (!header) return {};

  return header.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return cookies;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) {
      try {
        cookies[key] = decodeURIComponent(value);
      } catch {
        cookies[key] = value;
      }
    }
    return cookies;
  }, {});
};

export const getRefreshTokenFromRequest = (req: Request): string | null =>
  parseCookies(req.headers.cookie)[REFRESH_COOKIE_NAME] ?? null;

export const getGoogleOAuthStateFromRequest = (req: Request): string | null =>
  parseCookies(req.headers.cookie)[GOOGLE_OAUTH_STATE_COOKIE_NAME] ?? null;

export const setRefreshTokenCookie = (
  res: Response,
  token: string,
  expiresAt: Date
): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...cookieOptions('/api/v1/auth'),
    expires: expiresAt,
    maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions('/api/v1/auth'));
};

const googleStateCookieOptions = (): CookieOptions =>
  cookieOptions('/api/v1/auth/google/callback');

export const setGoogleOAuthStateCookie = (res: Response, state: string): void => {
  res.cookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, state, {
    ...googleStateCookieOptions(),
    maxAge: 10 * 60 * 1000,
  });
};

export const clearGoogleOAuthStateCookie = (res: Response): void => {
  res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, googleStateCookieOptions());
};
