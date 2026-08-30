"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.hashRefreshToken = void 0;
const crypto_1 = require("crypto");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db"));
const constants_1 = require("../constants");
const app_error_1 = require("../utils/app-error");
const jwt_utils_1 = require("../utils/jwt.utils");
const user_utils_1 = require("../utils/user.utils");
const INVALID_CREDENTIALS = 'Email hoặc mật khẩu không chính xác';
const INVALID_REFRESH_TOKEN = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn';
const BCRYPT_ROUNDS = Math.min(14, Math.max(10, Number(process.env.BCRYPT_ROUNDS) || 12));
const isPrismaError = (error, code) => error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === code;
const hashRefreshToken = (token) => (0, crypto_1.createHash)('sha256').update(token).digest('hex');
exports.hashRefreshToken = hashRefreshToken;
const buildSession = (user) => {
    const tokenId = (0, crypto_1.randomUUID)();
    const accessToken = (0, jwt_utils_1.generateAccessToken)({
        userId: user.id,
        email: user.email,
        role: user.role,
    });
    const refresh = (0, jwt_utils_1.generateRefreshToken)({ userId: user.id, tokenId });
    return {
        accessToken,
        refreshToken: refresh.token,
        refreshTokenExpiresAt: refresh.expiresAt,
        user: (0, user_utils_1.serializeUser)(user),
    };
};
const persistSessionWithClient = async (client, user) => {
    const session = buildSession(user);
    const payload = (0, jwt_utils_1.verifyRefreshToken)(session.refreshToken);
    await client.refreshToken.deleteMany({ where: { expiresAt: { lte: new Date() } } });
    await client.refreshToken.create({
        data: {
            id: payload.tokenId,
            userId: user.id,
            tokenHash: (0, exports.hashRefreshToken)(session.refreshToken),
            expiresAt: session.refreshTokenExpiresAt,
        },
    });
    return session;
};
const persistSession = (user) => db_1.default.$transaction((tx) => persistSessionWithClient(tx, user));
exports.authService = {
    async register(input) {
        const email = input.email.trim().toLowerCase();
        const passwordHash = await bcryptjs_1.default.hash(input.password, BCRYPT_ROUNDS);
        try {
            return await db_1.default.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        fullName: input.fullName.trim(),
                        email,
                        passwordHash,
                        authProvider: 'LOCAL',
                    },
                });
                return persistSessionWithClient(tx, user);
            });
        }
        catch (error) {
            if (isPrismaError(error, 'P2002')) {
                throw new app_error_1.AppError('Email đã được sử dụng', constants_1.HTTP_STATUS.CONFLICT);
            }
            throw error;
        }
    },
    async login(email, password) {
        const user = await db_1.default.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });
        if (!user?.passwordHash || !user.isActive) {
            throw new app_error_1.AppError(INVALID_CREDENTIALS, constants_1.HTTP_STATUS.UNAUTHORIZED);
        }
        const passwordMatches = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!passwordMatches) {
            throw new app_error_1.AppError(INVALID_CREDENTIALS, constants_1.HTTP_STATUS.UNAUTHORIZED);
        }
        return persistSession(user);
    },
    async loginWithUserId(userId) {
        const user = await db_1.default.user.findUnique({ where: { id: userId } });
        if (!user || !user.isActive) {
            throw new app_error_1.AppError('Tài khoản không tồn tại hoặc đã bị khóa', constants_1.HTTP_STATUS.FORBIDDEN);
        }
        return persistSession(user);
    },
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new app_error_1.AppError(INVALID_REFRESH_TOKEN, constants_1.HTTP_STATUS.UNAUTHORIZED);
        }
        let payload;
        try {
            payload = (0, jwt_utils_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw new app_error_1.AppError(INVALID_REFRESH_TOKEN, constants_1.HTTP_STATUS.UNAUTHORIZED);
        }
        const storedToken = await db_1.default.refreshToken.findUnique({
            where: { id: payload.tokenId },
            include: { user: true },
        });
        const tokenHash = (0, exports.hashRefreshToken)(refreshToken);
        if (!storedToken ||
            storedToken.userId !== payload.userId ||
            storedToken.tokenHash !== tokenHash) {
            await db_1.default.refreshToken.deleteMany({ where: { userId: payload.userId } });
            throw new app_error_1.AppError(INVALID_REFRESH_TOKEN, constants_1.HTTP_STATUS.UNAUTHORIZED);
        }
        if (storedToken.expiresAt <= new Date() || !storedToken.user.isActive) {
            await db_1.default.refreshToken.deleteMany({ where: { userId: storedToken.userId } });
            throw new app_error_1.AppError(INVALID_REFRESH_TOKEN, constants_1.HTTP_STATUS.UNAUTHORIZED);
        }
        const nextSession = buildSession(storedToken.user);
        const nextPayload = (0, jwt_utils_1.verifyRefreshToken)(nextSession.refreshToken);
        try {
            await db_1.default.$transaction(async (tx) => {
                const deleted = await tx.refreshToken.deleteMany({
                    where: { id: storedToken.id, tokenHash },
                });
                if (deleted.count !== 1) {
                    throw new app_error_1.AppError(INVALID_REFRESH_TOKEN, constants_1.HTTP_STATUS.UNAUTHORIZED);
                }
                await tx.refreshToken.create({
                    data: {
                        id: nextPayload.tokenId,
                        userId: storedToken.userId,
                        tokenHash: (0, exports.hashRefreshToken)(nextSession.refreshToken),
                        expiresAt: nextSession.refreshTokenExpiresAt,
                    },
                });
            });
        }
        catch (error) {
            if (error instanceof app_error_1.AppError)
                throw error;
            if (isPrismaError(error, 'P2002') || isPrismaError(error, 'P2025')) {
                throw new app_error_1.AppError(INVALID_REFRESH_TOKEN, constants_1.HTTP_STATUS.UNAUTHORIZED);
            }
            throw error;
        }
        return nextSession;
    },
    async logout(refreshToken) {
        if (!refreshToken)
            return;
        try {
            const payload = (0, jwt_utils_1.verifyRefreshToken)(refreshToken);
            await db_1.default.refreshToken.deleteMany({
                where: {
                    id: payload.tokenId,
                    userId: payload.userId,
                    tokenHash: (0, exports.hashRefreshToken)(refreshToken),
                },
            });
        }
        catch {
            // Logout idempotent: cookie vẫn bị xóa dù token hỏng hoặc đã hết hạn.
        }
    },
    async replaceAllSessionsForUser(user) {
        return db_1.default.$transaction(async (tx) => {
            await tx.refreshToken.deleteMany({ where: { userId: user.id } });
            return persistSessionWithClient(tx, user);
        });
    },
};
//# sourceMappingURL=auth.service.js.map