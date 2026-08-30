"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoleSchema = exports.updateUserStatusSchema = exports.userIdParamsSchema = exports.adminUserListQuerySchema = exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
const auth_validator_1 = require("./auth.validator");
const positiveIdSchema = zod_1.z.coerce
    .number()
    .int('ID phải là số nguyên')
    .positive('ID phải lớn hơn 0');
const optionalBoolean = zod_1.z.preprocess((value) => {
    if (value === undefined || value === '')
        return undefined;
    if (value === true || value === 'true' || value === '1')
        return true;
    if (value === false || value === 'false' || value === '0')
        return false;
    return value;
}, zod_1.z.boolean().optional());
exports.updateProfileSchema = zod_1.z
    .object({
    fullName: zod_1.z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100),
})
    .strict();
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Mật khẩu hiện tại là bắt buộc').max(128),
    newPassword: auth_validator_1.passwordSchema,
})
    .strict()
    .refine((data) => data.currentPassword !== data.newPassword, {
    path: ['newPassword'],
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
});
exports.adminUserListQuerySchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().trim().min(1).max(255).optional(),
    role: zod_1.z.enum(['ADMIN', 'USER']).optional(),
    authProvider: zod_1.z.enum(['LOCAL', 'GOOGLE']).optional(),
    isActive: optionalBoolean,
    sortBy: zod_1.z.enum(['createdAt', 'fullName', 'email']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
})
    .strict();
exports.userIdParamsSchema = zod_1.z.object({ userId: positiveIdSchema }).strict();
exports.updateUserStatusSchema = zod_1.z.object({ isActive: zod_1.z.boolean() }).strict();
exports.updateUserRoleSchema = zod_1.z
    .object({ role: zod_1.z.enum(['ADMIN', 'USER']) })
    .strict();
//# sourceMappingURL=user.validator.js.map