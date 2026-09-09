import { CookieOptions, Request, Response } from 'express';
import env from '../config/env';

// ─── Refresh Token Cookie ─────────────────────────────────────────────────────

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

export const getRefreshTokenFromRequest = (req: Request): string | undefined =>
  req.cookies[REFRESH_COOKIE_NAME] as string | undefined;

export const clearRefreshTokenCookie = (res: Response): void => {
  const { maxAge: _ignored, ...clearOpts } = buildCookieOptions();
  res.clearCookie(REFRESH_COOKIE_NAME, clearOpts);
};

// ─── OAuth State Cookies (CSRF protection) ────────────────────────────────────
//
// State cookies are short-lived (10 min), HttpOnly (JS cannot read them),
// and scoped to the OAuth callback path only. sameSite=lax (NOT strict) is
// required so the browser sends the cookie on the cross-site redirect-back
// from the provider — strict would drop the cookie and break CSRF validation.
//
// The state value stored in the cookie is a random hex string that is ALSO
// stored as a Redis key with the same TTL (see oauth-state.utils.ts).
// Validation requires both the cookie AND the Redis key to match — double-lock.

const buildOAuthStateCookieOptions = (path: string): CookieOptions => ({
  httpOnly: true,
  secure: env.IS_PRODUCTION,
  sameSite: 'lax',
  maxAge: 10 * 60 * 1000, // 10 minutes — matches Redis TTL in oauth-state.utils.ts
  path,
});

export const GOOGLE_OAUTH_STATE_COOKIE_NAME = 'google_oauth_state';
export const FACEBOOK_OAUTH_STATE_COOKIE_NAME = 'facebook_oauth_state';

export const setGoogleOAuthStateCookie = (res: Response, state: string): void => {
  res.cookie(
    GOOGLE_OAUTH_STATE_COOKIE_NAME,
    state,
    buildOAuthStateCookieOptions('/api/v1/auth/google')
  );
};

export const setFacebookOAuthStateCookie = (res: Response, state: string): void => {
  res.cookie(
    FACEBOOK_OAUTH_STATE_COOKIE_NAME,
    state,
    buildOAuthStateCookieOptions('/api/v1/auth/facebook')
  );
};

export const getGoogleOAuthStateFromRequest = (req: Request): string | undefined =>
  req.cookies[GOOGLE_OAUTH_STATE_COOKIE_NAME] as string | undefined;

export const getFacebookOAuthStateFromRequest = (req: Request): string | undefined =>
  req.cookies[FACEBOOK_OAUTH_STATE_COOKIE_NAME] as string | undefined;

export const clearOAuthStateCookie = (
  res: Response,
  name: string,
  path: string
): void => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: 'lax',
    path,
  });
};
