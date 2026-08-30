"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateItinerarySchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const hasAtMostTwoDecimalPlaces = (value) => Number(value.toFixed(2)) === value;
const isValidDateOnly = (value) => {
    if (!DATE_PATTERN.test(value))
        return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const preferenceListSchema = zod_1.z
    .array(zod_1.z.string().trim().min(1).max(100))
    .max(20)
    .refine((items) => new Set(items.map((item) => item.toLocaleLowerCase('vi'))).size === items.length, 'Danh sách sở thích không được chứa giá trị trùng lặp');
exports.generateItinerarySchema = zod_1.z
    .object({
    destinationCity: zod_1.z.string().trim().min(1).max(100),
    days: zod_1.z.number().int().min(1).max(14),
    startDate: zod_1.z.string().refine(isValidDateOnly, 'startDate phải có định dạng YYYY-MM-DD hợp lệ').optional(),
    budgetLevel: zod_1.z.enum([constants_1.BUDGET_LEVEL.LOW, constants_1.BUDGET_LEVEL.MEDIUM, constants_1.BUDGET_LEVEL.HIGH]).optional(),
    budget: zod_1.z
        .number()
        .finite()
        .min(0)
        .max(9_999_999_999.99)
        .refine(hasAtMostTwoDecimalPlaces, 'budget chỉ được có tối đa 2 chữ số thập phân')
        .optional(),
    numberOfPeople: zod_1.z.number().int().min(1).max(10_000).optional(),
    travelStyle: zod_1.z.string().trim().min(1).max(100).optional(),
    preferredActivities: preferenceListSchema.optional(),
    preferredCategories: preferenceListSchema.optional(),
    travelMode: zod_1.z
        .enum([
        constants_1.TRAVEL_MODE.WALKING,
        constants_1.TRAVEL_MODE.DRIVING,
        constants_1.TRAVEL_MODE.TRANSIT,
        constants_1.TRAVEL_MODE.CYCLING,
    ])
        .optional(),
    additionalRequests: zod_1.z.string().trim().min(1).max(2_000).optional(),
    locale: zod_1.z
        .string()
        .trim()
        .regex(/^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?$/, 'locale không hợp lệ')
        .optional(),
})
    .strict();
//# sourceMappingURL=ai.validator.js.map