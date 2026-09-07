import { Request, Response, CookieOptions } from 'express';
import { AppError } from '../utils/app-error';
import { sendSuccess } from '../utils/response.utils';
import { HTTP_STATUS } from '../constants';
import env from '../config/env';
import * as authService from '../services/auth.service';
import * as userRepo from '../repositories/user.repository';

// ─── Cookie name ──────────────────────────────────────────────────────────────
const REFRESH_COOKIE = 'refreshToken';

// ─── Cookie helpers ───────────────────────────────────────────────────────────

/**
 * Build cookie options from the validated env config.
 * maxAge is derived from REFRESH_TTL_SECONDS — the single source of truth.
 * secure and sameSite are environment-aware.
 */
function buildCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure:   env.IS_PRODUCTION,
    sameSite: env.IS_PRODUCTION ? 'none' : 'lax',
    maxAge:   env.COOKIE_MAX_AGE_MS,
    path:     '/',
  };
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, buildCookieOptions());
}

function clearRefreshCookie(res: Response): void {
  // clearCookie must use identical path, secure, and sameSite to the set call.
  // maxAge is intentionally omitted — the browser removes the cookie.
  const { maxAge: _ignored, ...clearOpts } = buildCookieOptions();
  res.clearCookie(REFRESH_COOKIE, clearOpts);
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * POST /auth/register
 * Creates a new local user, issues tokens, stores Redis session.
 * Body: { user, accessToken } — refreshToken goes into the HTTP-only cookie only.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { user, accessToken }, 'Đăng ký thành công', HTTP_STATUS.CREATED);
};

/**
 * POST /auth/login
 * Authenticates a local user, issues tokens, stores Redis session.
 * Body: { user, accessToken } — refreshToken in cookie only.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { user, accessToken }, 'Đăng nhập thành công');
};

/**
 * POST /auth/refresh
 * Rotates the refresh session atomically.
 * Body: { accessToken } — new refreshToken replaces the cookie.
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies[REFRESH_COOKIE] as string | undefined;
  if (!token) {
    throw new AppError('Không có refresh token', HTTP_STATUS.UNAUTHORIZED);
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(token);

  setRefreshCookie(res, newRefreshToken);
  sendSuccess(res, { accessToken }, 'Làm mới token thành công');
};

/**
 * POST /auth/logout
 * Revokes the Redis session and clears the cookie.
 * Always returns 200 — the session may already be gone.
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies[REFRESH_COOKIE] as string | undefined;
  await authService.logout(token);
  clearRefreshCookie(res);
  sendSuccess(res, null, 'Đăng xuất thành công');
};

/**
 * GET /auth/me
 * Returns the authenticated user's safe public information.
 * Requires: Authorization: Bearer <accessToken>
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const user = await userRepo.findById(userId);

  if (!user || !user.isActive) {
    throw new AppError('Tài khoản không tồn tại hoặc đã bị khóa', HTTP_STATUS.UNAUTHORIZED);
  }

  sendSuccess(res, { user }, 'Lấy thông tin người dùng thành công');
};
