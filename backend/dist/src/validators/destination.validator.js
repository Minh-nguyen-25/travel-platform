"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryIdParamsSchema = exports.updateCategorySchema = exports.createCategorySchema = exports.categoryListQuerySchema = exports.uploadDestinationImagesSchema = exports.destinationImageParamsSchema = exports.destinationIdParamsSchema = exports.adminDestinationListQuerySchema = exports.destinationListQuerySchema = exports.updateDestinationSchema = exports.createDestinationSchema = void 0;
const zod_1 = require("zod");
const MAX_MONEY = 9_999_999_999.99;
const positiveIdSchema = zod_1.z.coerce
    .number()
    .int('ID phải là số nguyên')
    .positive('ID phải lớn hơn 0');
const optionalNumber = (schema) => zod_1.z.preprocess((value) => (value === '' || value === null ? undefined : value), zod_1.z.coerce.number().pipe(schema).optional());
const optionalBoolean = zod_1.z.preprocess((value) => {
    if (value === undefined || value === '')
        return undefined;
    if (value === true || value === 'true' || value === '1')
        return true;
    if (value === false || value === 'false' || value === '0')
        return false;
    return value;
}, zod_1.z.boolean().optional());
const optionalNullableText = (max, label) => zod_1.z.preprocess((value) => (value === '' ? null : value), zod_1.z.string().trim().max(max, `${label} không được vượt quá ${max} ký tự`).nullable().optional());
const parseIdList = (value) => {
    if (value === undefined)
        return undefined;
    const values = Array.isArray(value) ? value : [value];
    const result = [];
    for (const item of values) {
        if (typeof item !== 'string') {
            result.push(item);
            continue;
        }
        const trimmed = item.trim();
        if (!trimmed)
            continue;
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    result.push(...parsed);
                    continue;
                }
            }
            catch {
                return value;
            }
        }
        result.push(...trimmed.split(',').map((part) => part.trim()));
    }
    return result;
};
const categoryIdsSchema = zod_1.z.preprocess(parseIdList, zod_1.z
    .array(positiveIdSchema)
    .min(1, 'Địa điểm phải thuộc ít nhất một danh mục')
    .max(20, 'Một địa điểm chỉ được thuộc tối đa 20 danh mục')
    .transform((ids) => [...new Set(ids)]));
const latitudeSchema = zod_1.z.coerce
    .number({ invalid_type_error: 'Vĩ độ phải là số' })
    .finite('Vĩ độ phải là số hữu hạn')
    .min(-90, 'Vĩ độ phải từ -90 đến 90')
    .max(90, 'Vĩ độ phải từ -90 đến 90');
const longitudeSchema = zod_1.z.coerce
    .number({ invalid_type_error: 'Kinh độ phải là số' })
    .finite('Kinh độ phải là số hữu hạn')
    .min(-180, 'Kinh độ phải từ -180 đến 180')
    .max(180, 'Kinh độ phải từ -180 đến 180');
const moneySchema = zod_1.z
    .number({ invalid_type_error: 'Giá vé phải là số' })
    .finite('Giá vé phải là số hữu hạn')
    .min(0, 'Giá vé không được âm')
    .max(MAX_MONEY, `Giá vé không được vượt quá ${MAX_MONEY}`)
    .refine((value) => Number(value.toFixed(2)) === value, 'Giá vé chỉ được có tối đa 2 chữ số thập phân');
const ratingSchema = zod_1.z
    .number({ invalid_type_error: 'Điểm đánh giá phải là số' })
    .finite()
    .min(0, 'Điểm đánh giá không được âm')
    .max(5, 'Điểm đánh giá không được vượt quá 5')
    .refine((value) => Number(value.toFixed(1)) === value, 'Điểm đánh giá chỉ được có tối đa 1 chữ số thập phân');
const destinationFields = {
    name: zod_1.z.string().trim().min(1, 'Tên địa điểm là bắt buộc').max(200),
    description: optionalNullableText(20_000, 'Mô tả'),
    address: zod_1.z.string().trim().min(1, 'Địa chỉ là bắt buộc').max(2_000),
    phoneNumber: optionalNullableText(20, 'Số điện thoại'),
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    ticketPrice: optionalNumber(moneySchema),
    openingHoursNote: optionalNullableText(5_000, 'Ghi chú giờ mở cửa'),
    visitDuration: zod_1.z.preprocess((value) => (value === '' || value === null ? null : value), zod_1.z.coerce
        .number()
        .int('Thời lượng tham quan phải là số phút nguyên')
        .positive('Thời lượng tham quan phải lớn hơn 0')
        .max(10_080, 'Thời lượng tham quan không được vượt quá 7 ngày')
        .nullable()
        .optional()),
    isActive: optionalBoolean,
    categoryIds: categoryIdsSchema,
};
const primaryImageIndexSchema = zod_1.z.preprocess((value) => (value === '' || value === undefined ? undefined : value), zod_1.z.coerce.number().int().min(0).max(4).optional());
exports.createDestinationSchema = zod_1.z
    .object({
    ...destinationFields,
    primaryImageIndex: primaryImageIndexSchema,
})
    .strict();
exports.updateDestinationSchema = zod_1.z
    .object({
    name: destinationFields.name.optional(),
    description: destinationFields.description,
    address: destinationFields.address.optional(),
    phoneNumber: destinationFields.phoneNumber,
    latitude: latitudeSchema.optional(),
    longitude: longitudeSchema.optional(),
    ticketPrice: destinationFields.ticketPrice,
    openingHoursNote: destinationFields.openingHoursNote,
    visitDuration: destinationFields.visitDuration,
    isActive: destinationFields.isActive,
    categoryIds: categoryIdsSchema.optional(),
    primaryImageIndex: primaryImageIndexSchema,
})
    .strict();
const baseDestinationListQuerySchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(12),
    search: zod_1.z.string().trim().min(1).max(200).optional(),
    categoryId: positiveIdSchema.optional(),
    categoryIds: zod_1.z.preprocess(parseIdList, zod_1.z.array(positiveIdSchema).max(20).optional()),
    categoryMatch: zod_1.z.enum(['any', 'all']).default('any'),
    minPrice: optionalNumber(moneySchema),
    maxPrice: optionalNumber(moneySchema),
    minRating: optionalNumber(ratingSchema),
    maxRating: optionalNumber(ratingSchema),
    sortBy: zod_1.z.enum(['createdAt', 'name', 'rating', 'ticketPrice']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
})
    .strict()
    .superRefine((data, context) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined && data.minPrice > data.maxPrice) {
        context.addIssue({ code: zod_1.z.ZodIssueCode.custom, path: ['maxPrice'], message: 'maxPrice phải lớn hơn hoặc bằng minPrice' });
    }
    if (data.minRating !== undefined && data.maxRating !== undefined && data.minRating > data.maxRating) {
        context.addIssue({ code: zod_1.z.ZodIssueCode.custom, path: ['maxRating'], message: 'maxRating phải lớn hơn hoặc bằng minRating' });
    }
})
    .transform(({ categoryId, categoryIds, ...query }) => ({
    ...query,
    categoryIds: [...new Set([...(categoryIds ?? []), ...(categoryId ? [categoryId] : [])])],
}));
exports.destinationListQuerySchema = baseDestinationListQuerySchema;
exports.adminDestinationListQuerySchema = zod_1.z.preprocess((value) => value, zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(12),
    search: zod_1.z.string().trim().min(1).max(200).optional(),
    categoryId: positiveIdSchema.optional(),
    categoryIds: zod_1.z.preprocess(parseIdList, zod_1.z.array(positiveIdSchema).max(20).optional()),
    categoryMatch: zod_1.z.enum(['any', 'all']).default('any'),
    minPrice: optionalNumber(moneySchema),
    maxPrice: optionalNumber(moneySchema),
    minRating: optionalNumber(ratingSchema),
    maxRating: optionalNumber(ratingSchema),
    sortBy: zod_1.z.enum(['createdAt', 'name', 'rating', 'ticketPrice']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    isActive: optionalBoolean,
})
    .strict()
    .superRefine((data, context) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined && data.minPrice > data.maxPrice) {
        context.addIssue({ code: zod_1.z.ZodIssueCode.custom, path: ['maxPrice'], message: 'maxPrice phải lớn hơn hoặc bằng minPrice' });
    }
    if (data.minRating !== undefined && data.maxRating !== undefined && data.minRating > data.maxRating) {
        context.addIssue({ code: zod_1.z.ZodIssueCode.custom, path: ['maxRating'], message: 'maxRating phải lớn hơn hoặc bằng minRating' });
    }
})
    .transform(({ categoryId, categoryIds, ...query }) => ({
    ...query,
    categoryIds: [...new Set([...(categoryIds ?? []), ...(categoryId ? [categoryId] : [])])],
})));
exports.destinationIdParamsSchema = zod_1.z.object({ destinationId: positiveIdSchema }).strict();
exports.destinationImageParamsSchema = zod_1.z
    .object({ destinationId: positiveIdSchema, imageId: positiveIdSchema })
    .strict();
exports.uploadDestinationImagesSchema = zod_1.z.object({ primaryImageIndex: primaryImageIndexSchema }).strict();
exports.categoryListQuerySchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    search: zod_1.z.string().trim().min(1).max(100).optional(),
    sortBy: zod_1.z.enum(['createdAt', 'name']).default('name'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
})
    .strict();
exports.createCategorySchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1, 'Tên danh mục là bắt buộc').max(100),
    description: optionalNullableText(5_000, 'Mô tả'),
})
    .strict();
exports.updateCategorySchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(1, 'Tên danh mục không được để trống').max(100).optional(),
    description: optionalNullableText(5_000, 'Mô tả'),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, 'Cần cung cấp ít nhất một trường để cập nhật');
exports.categoryIdParamsSchema = zod_1.z.object({ categoryId: positiveIdSchema }).strict();
//# sourceMappingURL=destination.validator.js.map