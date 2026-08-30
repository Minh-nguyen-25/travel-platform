"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthConfigured = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const db_1 = __importDefault(require("./db"));
const configuredValue = (value) => Boolean(value?.trim()) && !value.startsWith('your_');
exports.googleOAuthConfigured = configuredValue(process.env.GOOGLE_CLIENT_ID) &&
    configuredValue(process.env.GOOGLE_CLIENT_SECRET) &&
    configuredValue(process.env.GOOGLE_CALLBACK_URL);
if (exports.googleOAuthConfigured) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value?.trim().toLowerCase();
            if (!email)
                return done(new Error('Không lấy được email từ Google'));
            let user = await db_1.default.user.findFirst({
                where: { OR: [{ providerId: profile.id }, { email }] },
            });
            if (!user) {
                user = await db_1.default.user.create({
                    data: {
                        email,
                        fullName: profile.displayName?.trim() || email,
                        authProvider: 'GOOGLE',
                        providerId: profile.id,
                        avatarUrl: profile.photos?.[0]?.value ?? null,
                    },
                });
            }
            else if (!user.providerId) {
                user = await db_1.default.user.update({
                    where: { id: user.id },
                    data: {
                        providerId: profile.id,
                        avatarUrl: user.avatarUrl ?? profile.photos?.[0]?.value ?? null,
                    },
                });
            }
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }));
}
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map