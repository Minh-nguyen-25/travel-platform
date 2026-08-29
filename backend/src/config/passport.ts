import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import prisma from './db';

const configuredValue = (value?: string): value is string =>
  Boolean(value?.trim()) && !value!.startsWith('your_');

export const googleOAuthConfigured =
  configuredValue(process.env.GOOGLE_CLIENT_ID) &&
  configuredValue(process.env.GOOGLE_CLIENT_SECRET) &&
  configuredValue(process.env.GOOGLE_CALLBACK_URL);

if (googleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          const email = profile.emails?.[0]?.value?.trim().toLowerCase();
          if (!email) return done(new Error('Không lấy được email từ Google'));

          let user = await prisma.user.findFirst({
            where: { OR: [{ providerId: profile.id }, { email }] },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                fullName: profile.displayName?.trim() || email,
                authProvider: 'GOOGLE',
                providerId: profile.id,
                avatarUrl: profile.photos?.[0]?.value ?? null,
              },
            });
          } else if (!user.providerId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                providerId: profile.id,
                avatarUrl: user.avatarUrl ?? profile.photos?.[0]?.value ?? null,
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
}

export default passport;
