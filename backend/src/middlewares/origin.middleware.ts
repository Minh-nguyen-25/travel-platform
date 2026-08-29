import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS } from '../constants';
import env from '../config/env';

/**
 * Exact-match Origin allowlist middleware.
 *
 * Applied to cookie-authenticated endpoints (POST /auth/refresh and POST /auth/logout)
 * as server-side CSRF mitigation in production.
 *
 * Note: CORS with credentials prevents a browser from attaching cookies on
 * cross-origin requests, but it is NOT a sufficient CSRF defence on its own because
 * it relies on browser enforcement. This middleware provides an explicit,
 * server-enforced check using an exact Origin allowlist — no substring matching.
 *
 * In development (NODE_ENV !== 'production') the check is bypassed so local
 * tools (Postman, REST Client, curl) can work without Origin headers.
 */

const allowedOrigins: Set<string> = new Set(
  env.FRONTEND_URL
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
);

export const requestOriginGuard = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Bypass in non-production environments
  if (!env.IS_PRODUCTION) {
    next();
    return;
  }

  const origin = req.headers['origin'];

  if (!origin || !allowedOrigins.has(origin)) {
    throw new AppError('Origin không được phép', HTTP_STATUS.FORBIDDEN);
  }

  next();
};
