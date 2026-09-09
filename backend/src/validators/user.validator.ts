import { z } from 'zod';
import { passwordSchema } from './auth.validator';

const positiveIdSchema = z.coerce
  .number()
  .int('ID phải là số nguyên')
  .positive('ID phải lớn hơn 0');

const optionalBoolean = z.preprocess((value) => {
  if (value === undefined || value === '') return undefined;
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return value;
}, z.boolean().optional());

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc').max(128),
    newPassword: passwordSchema,
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ['newPassword'],
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  });

export const adminUserListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).max(255).optional(),
    role: z.enum(['ADMIN', 'USER']).optional(),
    authProvider: z.enum(['LOCAL', 'GOOGLE', 'FACEBOOK']).optional(),
    isActive: optionalBoolean,
    sortBy: z.enum(['createdAt', 'fullName', 'email']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export const userIdParamsSchema = z.object({ userId: positiveIdSchema }).strict();

export const updateUserStatusSchema = z.object({ isActive: z.boolean() }).strict();

export const updateUserRoleSchema = z
  .object({ role: z.enum(['ADMIN', 'USER']) })
  .strict();

