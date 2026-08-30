"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRepository = exports.roundAverageRating = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db"));
const reviewInclude = {
    user: {
        select: { id: true, fullName: true, avatarUrl: true },
    },
    destination: {
        select: { id: true, name: true },
    },
    images: {
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    },
};
const isRetryableTransactionError = (error) => error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
const withSerializableTransaction = async (operation) => {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await db_1.default.$transaction(operation, {
                isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
            });
        }
        catch (error) {
            if (!isRetryableTransactionError(error) || attempt === maxAttempts)
                throw error;
        }
    }
    throw new Error('Không thể hoàn tất transaction đánh giá');
};
const roundAverageRating = (average) => average === null ? 0 : Math.round(average * 10) / 10;
exports.roundAverageRating = roundAverageRating;
const recalculateDestinationRating = async (tx, destinationId) => {
    const aggregate = await tx.review.aggregate({
        where: { destinationId, isVisible: true },
        _avg: { rating: true },
    });
    const rating = (0, exports.roundAverageRating)(aggregate._avg.rating);
    await tx.destination.update({
        where: { id: destinationId },
        data: { rating },
    });
    return rating;
};
const buildAdminWhere = (query) => ({
    ...(query.destinationId !== undefined && { destinationId: query.destinationId }),
    ...(query.userId !== undefined && { userId: query.userId }),
    ...(query.rating !== undefined && { rating: query.rating }),
    ...(query.isVisible !== undefined && { isVisible: query.isVisible }),
    ...(query.search && {
        OR: [
            { comment: { contains: query.search, mode: 'insensitive' } },
            { user: { fullName: { contains: query.search, mode: 'insensitive' } } },
            { destination: { name: { contains: query.search, mode: 'insensitive' } } },
        ],
    }),
});
exports.reviewRepository = {
    async findPublicByDestination(destinationId, query) {
        const where = { destinationId, isVisible: true };
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await db_1.default.$transaction([
            db_1.default.review.findMany({
                where,
                include: reviewInclude,
                orderBy: [{ [query.sortBy]: query.sortOrder }, { id: query.sortOrder }],
                skip,
                take: query.limit,
            }),
            db_1.default.review.count({ where }),
        ]);
        return { data, total };
    },
    async findAdmin(query) {
        const where = buildAdminWhere(query);
        const skip = (query.page - 1) * query.limit;
        const [data, total] = await db_1.default.$transaction([
            db_1.default.review.findMany({
                where,
                include: reviewInclude,
                orderBy: [{ [query.sortBy]: query.sortOrder }, { id: query.sortOrder }],
                skip,
                take: query.limit,
            }),
            db_1.default.review.count({ where }),
        ]);
        return { data, total };
    },
    findById(id) {
        return db_1.default.review.findUnique({ where: { id }, include: reviewInclude });
    },
    findByUserAndDestination(userId, destinationId) {
        return db_1.default.review.findUnique({
            where: { userId_destinationId: { userId, destinationId } },
            include: reviewInclude,
        });
    },
    create(userId, destinationId, input, imageUrls) {
        return withSerializableTransaction(async (tx) => {
            const created = await tx.review.create({
                data: {
                    userId,
                    destinationId,
                    rating: input.rating,
                    comment: input.comment ?? null,
                    ...(imageUrls.length > 0 && {
                        images: { create: imageUrls.map((imageUrl) => ({ imageUrl })) },
                    }),
                },
                select: { id: true },
            });
            await recalculateDestinationRating(tx, destinationId);
            return tx.review.findUniqueOrThrow({
                where: { id: created.id },
                include: reviewInclude,
            });
        });
    },
    update(id, input, imageUrls) {
        return withSerializableTransaction(async (tx) => {
            const current = await tx.review.findUniqueOrThrow({
                where: { id },
                select: { destinationId: true },
            });
            await tx.review.update({
                where: { id },
                data: {
                    ...(input.rating !== undefined && { rating: input.rating }),
                    ...(input.comment !== undefined && { comment: input.comment }),
                    ...(imageUrls.length > 0 && {
                        images: { create: imageUrls.map((imageUrl) => ({ imageUrl })) },
                    }),
                },
            });
            await recalculateDestinationRating(tx, current.destinationId);
            return tx.review.findUniqueOrThrow({ where: { id }, include: reviewInclude });
        });
    },
    async delete(id) {
        return withSerializableTransaction(async (tx) => {
            const review = await tx.review.findUniqueOrThrow({
                where: { id },
                include: reviewInclude,
            });
            await tx.review.delete({ where: { id } });
            await recalculateDestinationRating(tx, review.destinationId);
            return { review, imageUrls: review.images.map(({ imageUrl }) => imageUrl) };
        });
    },
    setVisibility(id, isVisible) {
        return withSerializableTransaction(async (tx) => {
            const current = await tx.review.findUniqueOrThrow({
                where: { id },
                select: { destinationId: true },
            });
            await tx.review.update({ where: { id }, data: { isVisible } });
            await recalculateDestinationRating(tx, current.destinationId);
            return tx.review.findUniqueOrThrow({ where: { id }, include: reviewInclude });
        });
    },
    async deleteImage(reviewId, imageId) {
        return db_1.default.$transaction(async (tx) => {
            const image = await tx.reviewImage.findFirst({ where: { id: imageId, reviewId } });
            if (!image)
                throw new Error('REVIEW_IMAGE_NOT_FOUND');
            await tx.reviewImage.delete({ where: { id: image.id } });
            const review = await tx.review.findUniqueOrThrow({
                where: { id: reviewId },
                include: reviewInclude,
            });
            return { review, imageUrl: image.imageUrl };
        });
    },
};
//# sourceMappingURL=review.repository.js.map