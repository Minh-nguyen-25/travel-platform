import { z } from 'zod';

const positiveIdSchema = z.coerce
  .number()
  .int('ID phải là số nguyên')
  .positive('ID phải lớn hơn 0');

const ratingSchema = z.coerce
  .number({ invalid_type_error: 'Điểm đánh giá phải là số' })
  .int('Điểm đánh giá phải là số nguyên')
  .min(1, 'Điểm đánh giá phải từ 1 đến 5')
  .max(5, 'Điểm đánh giá phải từ 1 đến 5');

const optionalNullableComment = z.preprocess(
  (value) => (value === '' ? null : value),
  z
    .string()
    .trim()
    .max(5_000, 'Nội dung đánh giá không được vượt quá 5000 ký tự')
    .nullable()
    .optional()
);

const optionalBoolean = z.preprocess((value) => {
  if (value === undefined || value === '') return undefined;
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return value;
}, z.boolean().optional());

export const createReviewSchema = z
  .object({
    rating: ratingSchema,
    comment: optionalNullableComment,
  })
  .strict();

// Body có thể rỗng khi request chỉ bổ sung ảnh; service sẽ chặn request không đổi gì.
export const updateReviewSchema = z
  .object({
    rating: ratingSchema.optional(),
    comment: optionalNullableComment,
  })
  .strict();

export const reviewDestinationIdParamsSchema = z
  .object({ destinationId: positiveIdSchema })
  .strict();

export const reviewIdParamsSchema = z.object({ reviewId: positiveIdSchema }).strict();

export const reviewImageParamsSchema = z
  .object({ reviewId: positiveIdSchema, imageId: positiveIdSchema })
  .strict();

export const reviewListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(['createdAt', 'rating']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export const adminReviewListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'rating']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().trim().min(1).max(200).optional(),
    destinationId: positiveIdSchema.optional(),
    userId: positiveIdSchema.optional(),
    rating: ratingSchema.optional(),
    isVisible: optionalBoolean,
  })
  .strict();

export const reviewVisibilitySchema = z
  .object({ isVisible: z.boolean() })
  .strict();

export const favoriteListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
  })
  .strict();
