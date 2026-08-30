"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db"));
const adminUserInclude = {
    _count: {
        select: { reviews: true, favorites: true, trips: true },
    },
};
const buildWhere = (query) => ({
    ...(query.search && {
        OR: [
            { fullName: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
        ],
    }),
    ...(query.role && { role: query.role }),
    ...(query.authProvider && { authProvider: query.authProvider }),
    ...(query.isActive !== undefined && { isActive: query.isActive }),
});
exports.userRepository = {
    findById(id) {
        return db_1.default.user.findUnique({ where: { id } });
    },
    updateProfile(id, fullName) {
        return db_1.default.user.update({ where: { id }, data: { fullName } });
    },
    updatePassword(id, passwordHash) {
        return db_1.default.user.update({ where: { id }, data: { passwordHash } });
    },
    updateAvatar(id, avatarUrl) {
        return db_1.default.user.update({ where: { id }, data: { avatarUrl } });
    },
    async findManyAdmin(query) {
        const where = buildWhere(query);
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await db_1.default.$transaction([
            db_1.default.user.findMany({
                where,
                include: adminUserInclude,
                orderBy: [{ [query.sortBy]: query.sortOrder }, { id: query.sortOrder }],
                skip,
                take: query.limit,
            }),
            db_1.default.user.count({ where }),
        ]);
        return { data, total };
    },
    findAdminById(id) {
        return db_1.default.user.findUnique({ where: { id }, include: adminUserInclude });
    },
    setStatus(id, isActive) {
        return db_1.default.$transaction(async (tx) => {
            await tx.user.update({ where: { id }, data: { isActive } });
            if (!isActive)
                await tx.refreshToken.deleteMany({ where: { userId: id } });
            return tx.user.findUniqueOrThrow({ where: { id }, include: adminUserInclude });
        });
    },
    setRole(id, role) {
        return db_1.default.$transaction(async (tx) => {
            const current = await tx.user.findUniqueOrThrow({ where: { id } });
            if (current.role === 'ADMIN' && role === 'USER' && current.isActive) {
                const activeAdminCount = await tx.user.count({
                    where: { role: 'ADMIN', isActive: true },
                });
                if (activeAdminCount <= 1)
                    throw new Error('LAST_ACTIVE_ADMIN');
            }
            await tx.user.update({ where: { id }, data: { role } });
            await tx.refreshToken.deleteMany({ where: { userId: id } });
            return tx.user.findUniqueOrThrow({ where: { id }, include: adminUserInclude });
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
    },
};
//# sourceMappingURL=user.repository.js.map