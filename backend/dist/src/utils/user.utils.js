"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeUser = void 0;
const serializeUser = (user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    authProvider: user.authProvider,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
});
exports.serializeUser = serializeUser;
//# sourceMappingURL=user.utils.js.map