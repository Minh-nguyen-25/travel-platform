import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import env from './env';
import { AUTH_PROVIDER, OAUTH_ERROR_CODES } from '../constants';
import { findOrCreateOAuthUser } from '../services/oauth.service';

// ─── Google OAuth Strategy ────────────────────────────────────────────────────
//
// State validation (CSRF) is intentionally NOT done in this verify callback.
// It is performed in the controller BEFORE passport.authenticate() is called,
// via consumeOAuthState() (Redis GETDEL — atomic, single-use).
// The verify callback only extracts the profile and delegates to the service.

if (env.GOOGLE_OAUTH_CONFIGURED) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL:  env.GOOGLE_CALLBACK_URL,
        // Do NOT set passReqToCallback — state is already consumed by the controller
        // before this verify callback runs.
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          // ── Email extraction ─────────────────────────────────────────────────
          const emailEntry = profile.emails?.[0];
          const email = emailEntry?.value?.trim().toLowerCase();

          if (!email) {
            return done(null, false, { message: OAUTH_ERROR_CODES.EMAIL_NOT_VERIFIED });
          }

          // ── Email verification — strict boolean check ─────────────────────────
          // Source: passport-google-oauth20/lib/profile/openid.js line 33:
          //   profile.emails = [{ value: json.email, verified: json.email_verified }]
          // json.email_verified is a boolean from Google's OpenID Connect userinfo endpoint.
          // We require it to be exactly true — undefined and false both fail.
          // 'verified !== false' is INSUFFICIENT because it accepts undefined.
          const verified = (emailEntry as { verified?: boolean }).verified;
          if (verified !== true) {
            return done(null, false, { message: OAUTH_ERROR_CODES.EMAIL_NOT_VERIFIED });
          }

          // ── Find or create user (no state check here — done in controller) ───
          const user = await findOrCreateOAuthUser({
            provider:   AUTH_PROVIDER.GOOGLE,
            providerId: profile.id,
            email,
            fullName:   profile.displayName?.trim() || email,
            avatarUrl:  profile.photos?.[0]?.value ?? null,
          });

          return done(null, user);
        } catch (error) {
          // Convert AppError (which already carries a fixed OAUTH_ERROR_CODE) to
          // a passport failure so the controller can redirect cleanly.
          // AppErrors are NOT hard errors — passport calls done(null, false, info).
          const err = error as { message?: string; statusCode?: number };
          // Only expose the message if it is a known fixed error code
          const message = Object.values(OAUTH_ERROR_CODES).includes(
            err.message as (typeof OAUTH_ERROR_CODES)[keyof typeof OAUTH_ERROR_CODES]
          )
            ? err.message!
            : OAUTH_ERROR_CODES.PROVIDER_ERROR;

          return done(null, false, { message });
        }
      }
    )
  );

  console.log('✅ [Passport] Google OAuth strategy registered');
} else {
  console.warn(
    '⚠️  [Passport] Google OAuth not configured — ' +
    'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing or placeholder. ' +
    'Email/password auth is unaffected.'
  );
}

export default passport;
