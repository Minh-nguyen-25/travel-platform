"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderItinerariesSchema = exports.shareTokenParamsSchema = exports.itineraryParamsSchema = exports.tripDayParamsSchema = exports.tripIdParamsSchema = exports.tripListQuerySchema = exports.updateTripSchema = exports.createTripSchema = exports.updateTripDaySchema = exports.createTripDaySchema = exports.updateItinerarySchema = exports.createItinerarySchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../constants");
const trip_constants_1 = require("../constants/trip.constants");
const MAX_MONEY = 9_999_999_999.99;
const MAX_DISTANCE_KM = 9_999.99;
const hasAtMostTwoDecimalPlaces = (value) => Number(value.toFixed(2)) === value;
const moneySchema = zod_1.z
    .number({ invalid_type_error: 'Giá trị phải là số' })
    .finite('Giá trị phải là số hữu hạn')
    .min(0, 'Giá trị không được âm')
    .max(MAX_MONEY, `Giá trị không được vượt quá ${MAX_MONEY}`)
    .refine(hasAtMostTwoDecimalPlaces, 'Giá trị chỉ được có tối đa 2 chữ số thập phân');
const isCalendarDate = (value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const dateOnlySchema = zod_1.z
    .string({ required_error: 'Ngày là bắt buộc' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD')
    .refine(isCalendarDate, 'Ngày không hợp lệ');
const timeSchema = zod_1.z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, 'Thời gian phải có định dạng HH:mm hoặc HH:mm:ss');
const positiveIdSchema = zod_1.z.coerce
    .number()
    .int('ID phải là số nguyên')
    .positive('ID phải lớn hơn 0');
const positiveOrderSchema = zod_1.z
    .number({ invalid_type_error: 'Thứ tự phải là số' })
    .int('Thứ tự phải là số nguyên')
    .positive('Thứ tự phải lớn hơn 0');
const nullableText = (max, label) => zod_1.z.string().trim().max(max, `${label} không được vượt quá ${max} ký tự`).nullable();
const timeToSeconds = (value) => {
    const [hours, minutes, seconds = '0'] = value.split(':');
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};
const hasValidTimeRange = (data) => !data.startTime || !data.endTime || timeToSeconds(data.endTime) > timeToSeconds(data.startTime);
const itineraryFields = {
    destinationId: positiveIdSchema,
    startTime: timeSchema.nullable().optional(),
    endTime: timeSchema.nullable().optional(),
    estimatedCost: moneySchema.optional(),
    travelDistanceKm: zod_1.z
        .number({ invalid_type_error: 'Khoảng cách phải là số' })
        .finite()
        .min(0, 'Khoảng cách không được âm')
        .max(MAX_DISTANCE_KM, `Khoảng cách không được vượt quá ${MAX_DISTANCE_KM} km`)
        .refine(hasAtMostTwoDecimalPlaces, 'Khoảng cách chỉ được có tối đa 2 chữ số thập phân')
        .nullable()
        .optional(),
    travelDurationMinutes: zod_1.z
        .number({ invalid_type_error: 'Thời gian di chuyển phải là số' })
        .int('Thời gian di chuyển phải là số phút nguyên')
        .min(0, 'Thời gian di chuyển không được âm')
        .max(100_000, 'Thời gian di chuyển quá lớn')
        .nullable()
        .optional(),
    travelMode: zod_1.z.enum([
        constants_1.TRAVEL_MODE.WALKING,
        constants_1.TRAVEL_MODE.DRIVING,
        constants_1.TRAVEL_MODE.TRANSIT,
        constants_1.TRAVEL_MODE.CYCLING,
    ]).nullable().optional(),
    note: nullableText(5_000, 'Ghi chú').optional(),
};
exports.createItinerarySchema = zod_1.z
    .object(itineraryFields)
    .strict()
    .refine(hasValidTimeRange, {
    message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
    path: ['endTime'],
});
exports.updateItinerarySchema = zod_1.z
    .object(itineraryFields)
    .partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, 'Cần cung cấp ít nhất một trường để cập nhật')
    .refine(hasValidTimeRange, {
    message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
    path: ['endTime'],
});
const tripDayFields = {
    dayNumber: positiveOrderSchema.optional(),
    date: dateOnlySchema,
    note: nullableText(5_000, 'Ghi chú').optional(),
};
exports.createTripDaySchema = zod_1.z.object(tripDayFields).strict();
exports.updateTripDaySchema = zod_1.z
    .object({
    date: dateOnlySchema.optional(),
    note: nullableText(5_000, 'Ghi chú').optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, 'Cần cung cấp ít nhất một trường để cập nhật');
const completeTripDaySchema = zod_1.z
    .object({
    ...tripDayFields,
    itineraries: zod_1.z
        .array(exports.createItinerarySchema)
        .max(trip_constants_1.MAX_ITINERARIES_PER_DAY, `Mỗi ngày có tối đa ${trip_constants_1.MAX_ITINERARIES_PER_DAY} điểm`)
        .optional(),
})
    .strict();
const tripFields = {
    name: zod_1.z.string().trim().min(1, 'Tên chuyến đi là bắt buộc').max(200),
    destinationCity: zod_1.z.string().trim().min(1, 'Thành phố là bắt buộc').max(100),
    startDate: dateOnlySchema,
    endDate: dateOnlySchema,
    budget: moneySchema.nullable().optional(),
    numberOfPeople: zod_1.z
        .number({ invalid_type_error: 'Số người phải là số' })
        .int('Số người phải là số nguyên')
        .min(1, 'Số người phải ít nhất là 1')
        .max(10_000, 'Số người quá lớn')
        .optional(),
    description: nullableText(10_000, 'Mô tả').optional(),
};
exports.createTripSchema = zod_1.z
    .object({
    ...tripFields,
    tripDays: zod_1.z.array(completeTripDaySchema).optional(),
    aiRawData: zod_1.z.string().min(1).max(80_000).optional(),
    aiProofToken: zod_1.z.string().min(1).max(2_048).optional(),
})
    .strict()
    .refine((data) => Boolean(data.aiProofToken) === Boolean(data.aiRawData), {
    message: 'aiProofToken và aiRawData phải được gửi cùng nhau',
    path: ['aiRawData'],
})
    .refine((data) => data.endDate >= data.startDate, {
    message: 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu',
    path: ['endDate'],
});
exports.updateTripSchema = zod_1.z
    .object({
    name: tripFields.name.optional(),
    destinationCity: tripFields.destinationCity.optional(),
    startDate: dateOnlySchema.optional(),
    endDate: dateOnlySchema.optional(),
    budget: tripFields.budget,
    numberOfPeople: tripFields.numberOfPeople,
    description: tripFields.description,
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, 'Cần cung cấp ít nhất một trường để cập nhật')
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, { message: 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu', path: ['endDate'] });
exports.tripListQuerySchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
})
    .strict();
exports.tripIdParamsSchema = zod_1.z.object({ tripId: positiveIdSchema }).strict();
exports.tripDayParamsSchema = zod_1.z
    .object({ tripId: positiveIdSchema, dayId: positiveIdSchema })
    .strict();
exports.itineraryParamsSchema = zod_1.z
    .object({
    tripId: positiveIdSchema,
    dayId: positiveIdSchema,
    itineraryId: positiveIdSchema,
})
    .strict();
exports.shareTokenParamsSchema = zod_1.z
    .object({
    shareToken: zod_1.z.string().regex(/^[a-f0-9]{64}$/, 'Share token không hợp lệ'),
})
    .strict();
exports.reorderItinerariesSchema = zod_1.z
    .object({
    itineraryIds: zod_1.z
        .array(zod_1.z.number().int().positive())
        .min(1, 'Danh sách thứ tự không được để trống')
        .max(trip_constants_1.MAX_ITINERARIES_PER_DAY, `Danh sách thứ tự có tối đa ${trip_constants_1.MAX_ITINERARIES_PER_DAY} phần tử`),
})
    .strict()
    .refine((data) => new Set(data.itineraryIds).size === data.itineraryIds.length, {
    message: 'Danh sách thứ tự không được chứa ID trùng lặp',
    path: ['itineraryIds'],
});
//# sourceMappingURL=trip.validator.js.map