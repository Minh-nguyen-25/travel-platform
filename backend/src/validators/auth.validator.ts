import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất một chữ thường')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất một chữ hoa')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất một chữ số');

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100),
    email: z.string().trim().email('Email không hợp lệ').max(255).transform((email) => email.toLowerCase()),
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email('Email không hợp lệ').max(255).transform((email) => email.toLowerCase()),
    password: z.string().min(1, 'Mật khẩu là bắt buộc').max(128, 'Mật khẩu quá dài'),
  })
  .strict();

