import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requestOriginGuard } from '../middlewares/origin.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, validateResetTokenSchema } from '../validators/auth.validator';
import * as authController from '../controllers/auth.controller';
import oauthRouter from './oauth.routes';

const router = Router();

// ─── Rate limiters ────────────────────────────────────────────────────────────
// Applied only to register and login — refresh/logout are protected by
// the refresh-token cookie rather than by IP-rate-limiting.

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
  },
});

// Dedicated strict rate limiter for forgot-password requests (anti-abuse)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu đặt lại mật khẩu, vui lòng thử lại sau 15 phút',
  },
});

// Rate limiter for reset-password attempts
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
  },
});

// Rate limiter for validating reset-password tokens (supports page refresh without blocking legitimate users)
const resetPasswordValidateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút',
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/v1/auth/me — returns the authenticated user's safe public profile
router.get('/me', authenticate, authController.getMe);

// POST /api/v1/auth/register
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

// POST /api/v1/auth/forgot-password
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

// POST /api/v1/auth/reset-password/validate
router.post(
  '/reset-password/validate',
  resetPasswordValidateLimiter,
  validate(validateResetTokenSchema),
  authController.validateResetToken
);

// POST /api/v1/auth/reset-password
router.post(
  '/reset-password',
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);

// POST /api/v1/auth/refresh
// requestOriginGuard: exact-match CSRF protection for cookie-authenticated route
router.post(
  '/refresh',
  requestOriginGuard,
  authController.refresh
);

// POST /api/v1/auth/logout
// requestOriginGuard: exact-match CSRF protection for cookie-authenticated route
router.post(
  '/logout',
  requestOriginGuard,
  authController.logout
);

// ─── OAuth routes (Google + Facebook) ────────────────────────────────────────
// All OAuth endpoints live under /api/v1/auth/google and /api/v1/auth/facebook
router.use('/', oauthRouter);

export default router;
