import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { requestOriginGuard } from '../middlewares/origin.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import * as authController from '../controllers/auth.controller';

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

export default router;
