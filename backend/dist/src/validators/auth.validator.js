"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = exports.passwordSchema = void 0;
const zod_1 = require("zod");
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất một chữ thường')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất một chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất một chữ số');
exports.registerSchema = zod_1.z
    .object({
    fullName: zod_1.z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100),
    email: zod_1.z.string().trim().email('Email không hợp lệ').max(255).transform((email) => email.toLowerCase()),
    password: exports.passwordSchema,
})
    .strict();
exports.loginSchema = zod_1.z
    .object({
    email: zod_1.z.string().trim().email('Email không hợp lệ').max(255).transform((email) => email.toLowerCase()),
    password: zod_1.z.string().min(1, 'Mật khẩu là bắt buộc').max(128, 'Mật khẩu quá dài'),
})
    .strict();
//# sourceMappingURL=auth.validator.js.map