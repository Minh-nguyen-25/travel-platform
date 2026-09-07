import { z } from 'zod';

export const passwordSchema = z
  .string({ required_error: 'Mật khẩu là bắt buộc' })
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số');

// ─── Register ─────────────────────────────────────────────────────────────────
// .strict() rejects any unknown field (e.g. role, isAdmin) with 422 before
// reaching the service layer. The service hard-codes role=USER as a second defence.
export const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Họ tên là bắt buộc' })
      .trim()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ tên không được vượt quá 100 ký tự'),
    email: z
      .string({ required_error: 'Email là bắt buộc' })
      .trim()
      .toLowerCase()
      .email('Email không hợp lệ'),
    password: passwordSchema,
  })
  .strict(); // unknown fields → 422 Unprocessable

export type RegisterDto = z.infer<typeof registerSchema>;

// ─── Login ────────────────────────────────────────────────────────────────────
// No password strength check here — the generic 401 prevents credential enumeration.
export const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Email là bắt buộc' })
      .trim()
      .toLowerCase()
      .email('Email không hợp lệ'),
    password: z.string({ required_error: 'Mật khẩu là bắt buộc' }).min(1),
  })
  .strict();

export type LoginDto = z.infer<typeof loginSchema>;
