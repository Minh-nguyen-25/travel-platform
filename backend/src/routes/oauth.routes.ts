import { Router, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middlewares/auth.middleware';
import * as oauthController from '../controllers/oauth.controller';

const router = Router();

// ─── Rate Limiters ────────────────────────────────────────────────────────────

// Init endpoints: prevent redirect-flood abuse
const oauthInitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút' },
});

// Callback endpoints: prevent code-stuffing / replay attempts.
// Higher limit than init because browsers may retry redirects on transient errors.
const oauthCallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút' },
});

// ─── Google ───────────────────────────────────────────────────────────────────

// GET /api/v1/auth/google
// Generates CSRF state → stores returnPath in Redis → sets HttpOnly state cookie
// → redirects to Google. If not configured → CONFIG_ERROR (503).
router.get('/google', oauthInitLimiter, oauthController.googleInit as RequestHandler);

// GET /api/v1/auth/google/callback
// Validates state (cookie + Redis GETDEL) BEFORE passport → issues session → redirects
router.get('/google/callback', oauthCallbackLimiter, oauthController.googleCallback as RequestHandler);

// ─── Facebook ─────────────────────────────────────────────────────────────────

// GET /api/v1/auth/facebook
// Generates CSRF state → stores returnPath in Redis → sets HttpOnly state cookie
// → redirects to Facebook. If not configured → CONFIG_ERROR (503).
router.get('/facebook', oauthInitLimiter, oauthController.facebookInit as RequestHandler);

// GET /api/v1/auth/facebook/callback
// Validates state → GETDEL → exchanges code → find/create user → issues session
router.get('/facebook/callback', oauthCallbackLimiter, oauthController.facebookCallback as RequestHandler);

// ─── Consume Return Ticket ────────────────────────────────────────────────────

// POST /api/v1/auth/oauth/consume-ticket
// Protected by access-token authentication middleware.
// Consumes a single-use Redis return-path ticket bound to the authenticated user.
router.post('/oauth/consume-ticket', authenticate, oauthController.consumeReturnTicket as RequestHandler);

export default router;

