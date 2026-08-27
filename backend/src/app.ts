import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import env from './config/env';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler.middleware';

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

// CORS — credential-safe origin allowlist.
// Split on comma to support multiple origins (e.g. staging + production).
// credentials: true is required for the browser to send/receive cookies.
// Note: CORS alone is NOT CSRF protection — requestOriginGuard in auth.routes
// provides the server-side exact-match check for cookie-authenticated endpoints.
app.use(cors({
  origin: env.FRONTEND_URL.split(',').map((o) => o.trim()),
  credentials: true,
}));

// ─── Body & Cookie Parsers ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── OAuth (Passport) ─────────────────────────────────────────────────────────
app.use(passport.initialize());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại',
  });
});

// ─── Global Error Handler (phải đặt cuối cùng) ────────────────────────────────
app.use(errorHandler);

export default app;
