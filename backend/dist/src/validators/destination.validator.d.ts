import { z } from 'zod';
export declare const createDestinationSchema: z.ZodObject<{
    primaryImageIndex: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
    name: z.ZodString;
    description: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, unknown>;
    address: z.ZodString;
    phoneNumber: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, unknown>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    ticketPrice: z.ZodEffects<z.ZodOptional<z.ZodPipeline<z.ZodNumber, z.ZodType<number, z.ZodTypeDef, number>>>, number | undefined, unknown>;
    openingHoursNote: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, unknown>;
    visitDuration: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, number | null | undefined, unknown>;
    isActive: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    categoryIds: z.ZodEffects<z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>, number[], unknown>;
}, "strict", z.ZodTypeAny, {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    categoryIds: number[];
    isActive?: boolean | undefined;
    description?: string | null | undefined;
    phoneNumber?: string | null | undefined;
    ticketPrice?: number | undefined;
    openingHoursNote?: string | null | undefined;
    visitDuration?: number | null | undefined;
    primaryImageIndex?: number | undefined;
}, {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isActive?: unknown;
    description?: unknown;
    phoneNumber?: unknown;
    ticketPrice?: unknown;
    openingHoursNote?: unknown;
    visitDuration?: unknown;
    categoryIds?: unknown;
    primaryImageIndex?: unknown;
}>;
export declare const updateDestinationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, unknown>;
    address: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, unknown>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    ticketPrice: z.ZodEffects<z.ZodOptional<z.ZodPipeline<z.ZodNumber, z.ZodType<number, z.ZodTypeDef, number>>>, number | undefined, unknown>;
    openingHoursNote: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, unknown>;
    visitDuration: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, number | null | undefined, unknown>;
    isActive: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    categoryIds: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>, number[], unknown>>;
    primaryImageIndex: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
}, "strict", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
    address?: string | undefined;
    phoneNumber?: string | null | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    ticketPrice?: number | undefined;
    openingHoursNote?: string | null | undefined;
    visitDuration?: number | null | undefined;
    categoryIds?: number[] | undefined;
    primaryImageIndex?: number | undefined;
}, {
    isActive?: unknown;
    name?: string | undefined;
    description?: unknown;
    address?: string | undefined;
    phoneNumber?: unknown;
    latitude?: number | undefined;
    longitude?: number | undefined;
    ticketPrice?: unknown;
    openingHoursNote?: unknown;
    visitDuration?: unknown;
    categoryIds?: unknown;
    primaryImageIndex?: unknown;
}>;
export declare const destinationListQuerySchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    categoryIds: z.ZodEffects<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>, number[] | undefined, unknown>;
    categoryMatch: z.ZodDefault<z.ZodEnum<["any", "all"]>>;
    minPrice: z.ZodEffects<z.ZodOptional<z.ZodPipeline<z.ZodNumber, z.ZodType<number, z.ZodTypeDef, number>>>, number | undefined, unknown>;
    maxPrice: z.ZodEffects<z.ZodOptional<z.ZodPipeline<z.ZodNumber, z.ZodType<number, z.ZodTypeDef, number>>>, number | undefined, unknown>;
    minRating: z.ZodEffects<z.ZodOptional<z.ZodPipeline<z.ZodNumber, z.ZodType<number, z.ZodTypeDef, number>>>, number | undefined, unknown>;
    maxRating: z.ZodEffects<z.ZodOptional<z.ZodPipeline<z.ZodNumber, z.ZodType<number, z.ZodTypeDef, number>>>, number | undefined, unknown>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "name", "rating", "ticketPrice"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "name" | "ticketPrice" | "rating";
    sortOrder: "asc" | "desc";
    categoryMatch: "any" | "all";
    search?: string | undefined;
    categoryId?: number | undefined;
    categoryIds?: number[] | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    categoryId?: number | undefined;
    sortBy?: "createdAt" | "name" | "ticketPrice" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    categoryIds?: unknown;
    categoryMatch?: "any" | "all" | undefined;
    minPrice?: unknown;
    maxPrice?: unknown;
    minRating?: unknown;
    maxRating?: unknown;
}>, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "name" | "ticketPrice" | "rating";
    sortOrder: "asc" | "desc";
    categoryMatch: "any" | "all";
    search?: string | undefined;
    categoryId?: number | undefined;
    categoryIds?: number[] | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    categoryId?: number | undefined;
    sortBy?: "createdAt" | "name" | "ticketPrice" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    categoryIds?: unknown;
    categoryMatch?: "any" | "all" | undefined;
    minPrice?: unknown;
    maxPrice?: unknown;
    minRating?: unknown;
    maxRating?: unknown;
}>, {
    categoryIds: number[];
    limit: number;
    page: number;
    sortBy: "createdAt" | "name" | "ticketPrice" | "rating";
    sortOrder: "asc" | "desc";
    categoryMatch: "any" | "all";
    search?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    categoryId?: number | undefined;
    sortBy?: "createdAt" | "name" | "ticketPrice" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    categoryIds?: unknown;
    categoryMatch?: "any" | "all" | undefined;
    minPrice?: unknown;
    maxPrice?: unknown;
    minRating?: unknown;
    maxRating?: unknown;
}>;
export declare const adminDestinationListQuerySchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    categoryIds: z.ZodEffects<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>, number[] | undefined, unknown>;
    categoryMatch: z.ZodDefault<z.ZodEnum<["any", "all"]>>;
    minPrice: z.ZodEffects<z.ZodOptional<z.ZodPipeline<z.ZodNumber, z.ZodType<number, z.ZodTypeDef, number>>>, number | undefined, unknown>;
    maxPrice: z.ZodEffects<z.ZodOptional<z.ZodPipeline<z.ZodNumber, z.ZodType<number, z.ZodTypeDef, number>>>, number | undefined, unknown>;
    minRating: z.ZodEffects<z.ZodOptional<z.ZodPipeline<z.ZodNumber, z.ZodType<number, z.ZodTypeDef, number>>>, number | undefined, unknown>;
    maxRating: z.ZodEffects<z.ZodOptional<z.ZodPipeline<z.ZodNumber, z.ZodType<number, z.ZodTypeDef, number>>>, number | undefined, unknown>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "name", "rating", "ticketPrice"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    isActive: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "name" | "ticketPrice" | "rating";
    sortOrder: "asc" | "desc";
    categoryMatch: "any" | "all";
    isActive?: boolean | undefined;
    search?: string | undefined;
    categoryId?: number | undefined;
    categoryIds?: number[] | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    isActive?: unknown;
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    categoryId?: number | undefined;
    sortBy?: "createdAt" | "name" | "ticketPrice" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    categoryIds?: unknown;
    categoryMatch?: "any" | "all" | undefined;
    minPrice?: unknown;
    maxPrice?: unknown;
    minRating?: unknown;
    maxRating?: unknown;
}>, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "name" | "ticketPrice" | "rating";
    sortOrder: "asc" | "desc";
    categoryMatch: "any" | "all";
    isActive?: boolean | undefined;
    search?: string | undefined;
    categoryId?: number | undefined;
    categoryIds?: number[] | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    isActive?: unknown;
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    categoryId?: number | undefined;
    sortBy?: "createdAt" | "name" | "ticketPrice" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    categoryIds?: unknown;
    categoryMatch?: "any" | "all" | undefined;
    minPrice?: unknown;
    maxPrice?: unknown;
    minRating?: unknown;
    maxRating?: unknown;
}>, {
    categoryIds: number[];
    limit: number;
    page: number;
    sortBy: "createdAt" | "name" | "ticketPrice" | "rating";
    sortOrder: "asc" | "desc";
    categoryMatch: "any" | "all";
    isActive?: boolean | undefined;
    search?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    isActive?: unknown;
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    categoryId?: number | undefined;
    sortBy?: "createdAt" | "name" | "ticketPrice" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    categoryIds?: unknown;
    categoryMatch?: "any" | "all" | undefined;
    minPrice?: unknown;
    maxPrice?: unknown;
    minRating?: unknown;
    maxRating?: unknown;
}>, {
    categoryIds: number[];
    limit: number;
    page: number;
    sortBy: "createdAt" | "name" | "ticketPrice" | "rating";
    sortOrder: "asc" | "desc";
    categoryMatch: "any" | "all";
    isActive?: boolean | undefined;
    search?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, unknown>;
export declare const destinationIdParamsSchema: z.ZodObject<{
    destinationId: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    destinationId: number;
}, {
    destinationId: number;
}>;
export declare const destinationImageParamsSchema: z.ZodObject<{
    destinationId: z.ZodNumber;
    imageId: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    destinationId: number;
    imageId: number;
}, {
    destinationId: number;
    imageId: number;
}>;
export declare const uploadDestinationImagesSchema: z.ZodObject<{
    primaryImageIndex: z.ZodEffects<z.ZodOptional<z.ZodNumber>, number | undefined, unknown>;
}, "strict", z.ZodTypeAny, {
    primaryImageIndex?: number | undefined;
}, {
    primaryImageIndex?: unknown;
}>;
export declare const categoryListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "name"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "name";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "name" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, unknown>;
}, "strict", z.ZodTypeAny, {
    name: string;
    description?: string | null | undefined;
}, {
    name: string;
    description?: unknown;
}>;
export declare const updateCategorySchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, unknown>;
}, "strict", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | null | undefined;
}, {
    name?: string | undefined;
    description?: unknown;
}>, {
    name?: string | undefined;
    description?: string | null | undefined;
}, {
    name?: string | undefined;
    description?: unknown;
}>;
export declare const categoryIdParamsSchema: z.ZodObject<{
    categoryId: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    categoryId: number;
}, {
    categoryId: number;
}>;
//# sourceMappingURL=destination.validator.d.ts.map