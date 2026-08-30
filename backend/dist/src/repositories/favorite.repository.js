"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteRepository = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db"));
const destinationInclude = {
    categories: {
        include: { category: true },
        orderBy: { categoryId: 'asc' },
    },
    images: {
        orderBy: [
            { isPrimary: 'desc' },
            { displayOrder: 'asc' },
            { id: 'asc' },
        ],
    },
};
const favoriteInclude = {
    destination: { include: destinationInclude },
};
const isRetryableTransactionError = (error) => error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2034' || error.code === 'P2002');
const toggleInSerializableTransaction = async (userId, destinationId) => {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
            return await db_1.default.$transaction(async (tx) => {
                const favorite = await tx.favorite.findUnique({
                    where: { userId_destinationId: { userId, destinationId } },
                    select: { userId: true },
                });
                if (favorite) {
                    await tx.favorite.delete({
                        where: { userId_destinationId: { userId, destinationId } },
                    });
                    return false;
                }
                await tx.favorite.create({ data: { userId, destinationId } });
                return true;
            }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        }
        catch (error) {
            if (!isRetryableTransactionError(error) || attempt === 3)
                throw error;
        }
    }
    throw new Error('Không thể hoàn tất transaction yêu thích');
};
exports.favoriteRepository = {
    async findMany(userId, query) {
        const where = {
            userId,
            destination: { isActive: true },
        };
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await db_1.default.$transaction([
            db_1.default.favorite.findMany({
                where,
                include: favoriteInclude,
                orderBy: { createdAt: 'desc' },
                skip,
                take: query.limit,
            }),
            db_1.default.favorite.count({ where }),
        ]);
        return { data, total };
    },
    async exists(userId, destinationId) {
        const favorite = await db_1.default.favorite.findUnique({
            where: { userId_destinationId: { userId, destinationId } },
            select: { userId: true },
        });
        return favorite !== null;
    },
    toggle(userId, destinationId) {
        return toggleInSerializableTransaction(userId, destinationId);
    },
};
//# sourceMappingURL=favorite.repository.js.map