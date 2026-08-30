import { z } from 'zod';
export declare const passwordSchema: z.ZodString;
export declare const registerSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strict", z.ZodTypeAny, {
    fullName: string;
    email: string;
    password: string;
}, {
    fullName: string;
    email: string;
    password: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strict", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
//# sourceMappingURL=auth.validator.d.ts.map