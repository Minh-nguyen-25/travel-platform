import { NextFunction, Request, Response, Router } from 'express';
import { randomBytes, timingSafeEqual } from 'crypto';
import passport, { googleOAuthConfigured } from '../config/passport';
import { HTTP_STATUS } from '../constants';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { sendError } from '../utils/response.utils';
import {
  clearGoogleOAuthStateCookie,
  getGoogleOAuthStateFromRequest,
  setGoogleOAuthStateCookie,
} from '../utils/auth-cookie.utils';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const router = Router();

const requireGoogleConfig = (_req: Request, res: Response, next: NextFunction): void => {
  if (!googleOAuthConfigured) {
    sendError(res, 'Google OAuth chưa được cấu hình', HTTP_STATUS.SERVICE_UNAVAILABLE);
    return;
  }
  next();
};

const googleFailureRedirect =
  process.env.GOOGLE_OAUTH_FAILURE_REDIRECT?.trim() ||
  `${process.env.FRONTEND_URL?.trim() || 'http://localhost:5173'}/login?oauth=failed`;

const beginGoogleOAuth = (req: Request, res: Response, next: NextFunction): void => {
  const state = randomBytes(32).toString('hex');
  setGoogleOAuthStateCookie(res, state);
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state,
  })(req, res, next);
};

const verifyGoogleOAuthState = (req: Request, res: Response, next: NextFunction): void => {
  const expectedState = getGoogleOAuthStateFromRequest(req);
  const returnedState = typeof req.query.state === 'string' ? req.query.state : null;
  clearGoogleOAuthStateCookie(res);

  if (!expectedState || !returnedState) {
    res.redirect(googleFailureRedirect);
    return;
  }

  const expected = Buffer.from(expectedState);
  const returned = Buffer.from(returnedState);
  if (expected.length !== returned.length || !timingSafeEqual(expected, returned)) {
    res.redirect(googleFailureRedirect);
    return;
  }

  next();
};

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get(
  '/google',
  requireGoogleConfig,
  beginGoogleOAuth
);
router.get(
  '/google/callback',
  requireGoogleConfig,
  verifyGoogleOAuthState,
  passport.authenticate('google', { session: false, failureRedirect: googleFailureRedirect }),
  authController.googleCallback
);

export default router;
