import { z } from 'zod';
export declare const createReviewSchema: z.ZodObject<{
    rating: z.ZodNumber;
    comment: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, unknown>;
}, "strict", z.ZodTypeAny, {
    rating: number;
    comment?: string | null | undefined;
}, {
    rating: number;
    comment?: unknown;
}>;
export declare const updateReviewSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, unknown>;
}, "strict", z.ZodTypeAny, {
    rating?: number | undefined;
    comment?: string | null | undefined;
}, {
    rating?: number | undefined;
    comment?: unknown;
}>;
export declare const reviewDestinationIdParamsSchema: z.ZodObject<{
    destinationId: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    destinationId: number;
}, {
    destinationId: number;
}>;
export declare const reviewIdParamsSchema: z.ZodObject<{
    reviewId: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    reviewId: number;
}, {
    reviewId: number;
}>;
export declare const reviewImageParamsSchema: z.ZodObject<{
    reviewId: z.ZodNumber;
    imageId: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    imageId: number;
    reviewId: number;
}, {
    imageId: number;
    reviewId: number;
}>;
export declare const reviewListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "rating"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "rating";
    sortOrder: "asc" | "desc";
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const adminReviewListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "rating"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    search: z.ZodOptional<z.ZodString>;
    destinationId: z.ZodOptional<z.ZodNumber>;
    userId: z.ZodOptional<z.ZodNumber>;
    rating: z.ZodOptional<z.ZodNumber>;
    isVisible: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "rating";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    userId?: number | undefined;
    destinationId?: number | undefined;
    rating?: number | undefined;
    isVisible?: boolean | undefined;
}, {
    search?: string | undefined;
    userId?: number | undefined;
    limit?: number | undefined;
    destinationId?: number | undefined;
    page?: number | undefined;
    rating?: number | undefined;
    sortBy?: "createdAt" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isVisible?: unknown;
}>;
export declare const reviewVisibilitySchema: z.ZodObject<{
    isVisible: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    isVisible: boolean;
}, {
    isVisible: boolean;
}>;
export declare const favoriteListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    page: number;
}, {
    limit?: number | undefined;
    page?: number | undefined;
}>;
//# sourceMappingURL=review.validator.d.ts.map