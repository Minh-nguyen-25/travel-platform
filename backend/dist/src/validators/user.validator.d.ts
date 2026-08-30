import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    fullName: z.ZodString;
}, "strict", z.ZodTypeAny, {
    fullName: string;
}, {
    fullName: string;
}>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strict", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const adminUserListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["ADMIN", "USER"]>>;
    authProvider: z.ZodOptional<z.ZodEnum<["LOCAL", "GOOGLE"]>>;
    isActive: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "fullName", "email"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "fullName" | "email" | "createdAt";
    sortOrder: "asc" | "desc";
    authProvider?: "GOOGLE" | "LOCAL" | undefined;
    role?: "USER" | "ADMIN" | undefined;
    isActive?: boolean | undefined;
    search?: string | undefined;
}, {
    authProvider?: "GOOGLE" | "LOCAL" | undefined;
    role?: "USER" | "ADMIN" | undefined;
    isActive?: unknown;
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "fullName" | "email" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const userIdParamsSchema: z.ZodObject<{
    userId: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    userId: number;
}, {
    userId: number;
}>;
export declare const updateUserStatusSchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    isActive: boolean;
}, {
    isActive: boolean;
}>;
export declare const updateUserRoleSchema: z.ZodObject<{
    role: z.ZodEnum<["ADMIN", "USER"]>;
}, "strict", z.ZodTypeAny, {
    role: "USER" | "ADMIN";
}, {
    role: "USER" | "ADMIN";
}>;
//# sourceMappingURL=user.validator.d.ts.map