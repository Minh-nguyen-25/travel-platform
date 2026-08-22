import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import prisma from './db';

// Chỉ xử lý OAuth — JWT authentication được xử lý riêng trong auth.middleware.ts
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Không lấy được email từ Google'));
        }

        // Tìm hoặc tạo user
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { providerId: profile.id, authProvider: 'GOOGLE' },
            ],
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              fullName: profile.displayName || email,
              authProvider: 'GOOGLE',
              providerId: profile.id,
              avatarUrl: profile.photos?.[0]?.value ?? null,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;
