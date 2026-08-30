"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearGoogleOAuthStateCookie = exports.setGoogleOAuthStateCookie = exports.clearRefreshTokenCookie = exports.setRefreshTokenCookie = exports.getGoogleOAuthStateFromRequest = exports.getRefreshTokenFromRequest = exports.GOOGLE_OAUTH_STATE_COOKIE_NAME = exports.REFRESH_COOKIE_NAME = void 0;
exports.REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME?.trim() || 'travel_refresh_token';
exports.GOOGLE_OAUTH_STATE_COOKIE_NAME = 'travel_google_oauth_state';
const cookieOptions = (path) => ({
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' ||
        (process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production'),
    sameSite: 'lax',
    path,
    ...(process.env.COOKIE_DOMAIN?.trim() && { domain: process.env.COOKIE_DOMAIN.trim() }),
});
const parseCookies = (header) => {
    if (!header)
        return {};
    return header.split(';').reduce((cookies, part) => {
        const separator = part.indexOf('=');
        if (separator < 0)
            return cookies;
        const key = part.slice(0, separator).trim();
        const value = part.slice(separator + 1).trim();
        if (key) {
            try {
                cookies[key] = decodeURIComponent(value);
            }
            catch {
                cookies[key] = value;
            }
        }
        return cookies;
    }, {});
};
const getRefreshTokenFromRequest = (req) => parseCookies(req.headers.cookie)[exports.REFRESH_COOKIE_NAME] ?? null;
exports.getRefreshTokenFromRequest = getRefreshTokenFromRequest;
const getGoogleOAuthStateFromRequest = (req) => parseCookies(req.headers.cookie)[exports.GOOGLE_OAUTH_STATE_COOKIE_NAME] ?? null;
exports.getGoogleOAuthStateFromRequest = getGoogleOAuthStateFromRequest;
const setRefreshTokenCookie = (res, token, expiresAt) => {
    res.cookie(exports.REFRESH_COOKIE_NAME, token, {
        ...cookieOptions('/api/v1/auth'),
        expires: expiresAt,
        maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
    });
};
exports.setRefreshTokenCookie = setRefreshTokenCookie;
const clearRefreshTokenCookie = (res) => {
    res.clearCookie(exports.REFRESH_COOKIE_NAME, cookieOptions('/api/v1/auth'));
};
exports.clearRefreshTokenCookie = clearRefreshTokenCookie;
const googleStateCookieOptions = () => cookieOptions('/api/v1/auth/google/callback');
const setGoogleOAuthStateCookie = (res, state) => {
    res.cookie(exports.GOOGLE_OAUTH_STATE_COOKIE_NAME, state, {
        ...googleStateCookieOptions(),
        maxAge: 10 * 60 * 1000,
    });
};
exports.setGoogleOAuthStateCookie = setGoogleOAuthStateCookie;
const clearGoogleOAuthStateCookie = (res) => {
    res.clearCookie(exports.GOOGLE_OAUTH_STATE_COOKIE_NAME, googleStateCookieOptions());
};
exports.clearGoogleOAuthStateCookie = clearGoogleOAuthStateCookie;
//# sourceMappingURL=auth-cookie.utils.js.map