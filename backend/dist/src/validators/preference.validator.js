"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferenceSchema = exports.createPreferenceSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
const MAX_PREFERENCE_ITEMS = 50;
const MAX_PREFERENCE_ITEM_LENGTH = 100;
const preferenceListSchema = (label) => zod_1.z
    .array(zod_1.z
    .string({ invalid_type_error: `${label} phải là chuỗi` })
    .trim()
    .min(1, `${label} không được để trống`)
    .max(MAX_PREFERENCE_ITEM_LENGTH, `${label} không được vượt quá ${MAX_PREFERENCE_ITEM_LENGTH} ký tự`))
    .max(MAX_PREFERENCE_ITEMS, `${label} chỉ được có tối đa ${MAX_PREFERENCE_ITEMS} mục`)
    .refine((items) => new Set(items.map((item) => item.toLocaleLowerCase('vi'))).size === items.length, `${label} không được chứa giá trị trùng lặp`);
const preferenceFields = {
    budgetLevel: zod_1.z
        .enum([constants_1.BUDGET_LEVEL.LOW, constants_1.BUDGET_LEVEL.MEDIUM, constants_1.BUDGET_LEVEL.HIGH], {
        invalid_type_error: 'Mức ngân sách không hợp lệ',
    })
        .nullable()
        .optional(),
    travelStyle: zod_1.z
        .string({ invalid_type_error: 'Phong cách du lịch phải là chuỗi' })
        .trim()
        .min(1, 'Phong cách du lịch không được để trống')
        .max(50, 'Phong cách du lịch không được vượt quá 50 ký tự')
        .nullable()
        .optional(),
    preferredActivities: preferenceListSchema('Hoạt động yêu thích').nullable().optional(),
    preferredCategories: preferenceListSchema('Danh mục yêu thích').nullable().optional(),
};
// All preference fields are nullable in Prisma, so creating an initially empty
// profile is valid and lets onboarding save progress incrementally.
exports.createPreferenceSchema = zod_1.z.object(preferenceFields).strict();
exports.updatePreferenceSchema = zod_1.z
    .object(preferenceFields)
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'Cần cung cấp ít nhất một trường để cập nhật',
});
//# sourceMappingURL=preference.validator.js.map