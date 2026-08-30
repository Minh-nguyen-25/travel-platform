"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteListQuerySchema = exports.reviewVisibilitySchema = exports.adminReviewListQuerySchema = exports.reviewListQuerySchema = exports.reviewImageParamsSchema = exports.reviewIdParamsSchema = exports.reviewDestinationIdParamsSchema = exports.updateReviewSchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
const positiveIdSchema = zod_1.z.coerce
    .number()
    .int('ID phải là số nguyên')
    .positive('ID phải lớn hơn 0');
const ratingSchema = zod_1.z.coerce
    .number({ invalid_type_error: 'Điểm đánh giá phải là số' })
    .int('Điểm đánh giá phải là số nguyên')
    .min(1, 'Điểm đánh giá phải từ 1 đến 5')
    .max(5, 'Điểm đánh giá phải từ 1 đến 5');
const optionalNullableComment = zod_1.z.preprocess((value) => (value === '' ? null : value), zod_1.z
    .string()
    .trim()
    .max(5_000, 'Nội dung đánh giá không được vượt quá 5000 ký tự')
    .nullable()
    .optional());
const optionalBoolean = zod_1.z.preprocess((value) => {
    if (value === undefined || value === '')
        return undefined;
    if (value === true || value === 'true' || value === '1')
        return true;
    if (value === false || value === 'false' || value === '0')
        return false;
    return value;
}, zod_1.z.boolean().optional());
exports.createReviewSchema = zod_1.z
    .object({
    rating: ratingSchema,
    comment: optionalNullableComment,
})
    .strict();
// Body có thể rỗng khi request chỉ bổ sung ảnh; service sẽ chặn request không đổi gì.
exports.updateReviewSchema = zod_1.z
    .object({
    rating: ratingSchema.optional(),
    comment: optionalNullableComment,
})
    .strict();
exports.reviewDestinationIdParamsSchema = zod_1.z
    .object({ destinationId: positiveIdSchema })
    .strict();
exports.reviewIdParamsSchema = zod_1.z.object({ reviewId: positiveIdSchema }).strict();
exports.reviewImageParamsSchema = zod_1.z
    .object({ reviewId: positiveIdSchema, imageId: positiveIdSchema })
    .strict();
exports.reviewListQuerySchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    sortBy: zod_1.z.enum(['createdAt', 'rating']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
})
    .strict();
exports.adminReviewListQuerySchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'rating']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    search: zod_1.z.string().trim().min(1).max(200).optional(),
    destinationId: positiveIdSchema.optional(),
    userId: positiveIdSchema.optional(),
    rating: ratingSchema.optional(),
    isVisible: optionalBoolean,
})
    .strict();
exports.reviewVisibilitySchema = zod_1.z
    .object({ isVisible: zod_1.z.boolean() })
    .strict();
exports.favoriteListQuerySchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(12),
})
    .strict();
//# sourceMappingURL=review.validator.js.map