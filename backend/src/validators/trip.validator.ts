import { z } from 'zod';
import { TRAVEL_MODE } from '../constants';
import { MAX_ITINERARIES_PER_DAY } from '../constants/trip.constants';

const MAX_MONEY = 9_999_999_999.99;
const MAX_DISTANCE_KM = 9_999.99;

const hasAtMostTwoDecimalPlaces = (value: number): boolean =>
  Number(value.toFixed(2)) === value;

const moneySchema = z
  .number({ invalid_type_error: 'Giá trị phải là số' })
  .finite('Giá trị phải là số hữu hạn')
  .min(0, 'Giá trị không được âm')
  .max(MAX_MONEY, `Giá trị không được vượt quá ${MAX_MONEY}`)
  .refine(hasAtMostTwoDecimalPlaces, 'Giá trị chỉ được có tối đa 2 chữ số thập phân');

const isCalendarDate = (value: string): boolean => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const dateOnlySchema = z
  .string({ required_error: 'Ngày là bắt buộc' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD')
  .refine(isCalendarDate, 'Ngày không hợp lệ');

const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/,
    'Thời gian phải có định dạng HH:mm hoặc HH:mm:ss'
  );

const positiveIdSchema = z.coerce
  .number()
  .int('ID phải là số nguyên')
  .positive('ID phải lớn hơn 0');

const positiveOrderSchema = z
  .number({ invalid_type_error: 'Thứ tự phải là số' })
  .int('Thứ tự phải là số nguyên')
  .positive('Thứ tự phải lớn hơn 0');

const nullableText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} không được vượt quá ${max} ký tự`).nullable();

const timeToSeconds = (value: string): number => {
  const [hours, minutes, seconds = '0'] = value.split(':');
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

const hasValidTimeRange = (data: { startTime?: string | null; endTime?: string | null }): boolean =>
  !data.startTime || !data.endTime || timeToSeconds(data.endTime) > timeToSeconds(data.startTime);

const itineraryFields = {
  destinationId: positiveIdSchema,
  startTime: timeSchema.nullable().optional(),
  endTime: timeSchema.nullable().optional(),
  estimatedCost: moneySchema.optional(),
  travelDistanceKm: z
    .number({ invalid_type_error: 'Khoảng cách phải là số' })
    .finite()
    .min(0, 'Khoảng cách không được âm')
    .max(MAX_DISTANCE_KM, `Khoảng cách không được vượt quá ${MAX_DISTANCE_KM} km`)
    .refine(hasAtMostTwoDecimalPlaces, 'Khoảng cách chỉ được có tối đa 2 chữ số thập phân')
    .nullable()
    .optional(),
  travelDurationMinutes: z
    .number({ invalid_type_error: 'Thời gian di chuyển phải là số' })
    .int('Thời gian di chuyển phải là số phút nguyên')
    .min(0, 'Thời gian di chuyển không được âm')
    .max(100_000, 'Thời gian di chuyển quá lớn')
    .nullable()
    .optional(),
  travelMode: z.enum([
    TRAVEL_MODE.WALKING,
    TRAVEL_MODE.DRIVING,
    TRAVEL_MODE.TRANSIT,
    TRAVEL_MODE.CYCLING,
  ]).nullable().optional(),
  note: nullableText(5_000, 'Ghi chú').optional(),
};

export const createItinerarySchema = z
  .object(itineraryFields)
  .strict()
  .refine(hasValidTimeRange, {
    message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
    path: ['endTime'],
  });

export const updateItinerarySchema = z
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

export const createTripDaySchema = z.object(tripDayFields).strict();

export const updateTripDaySchema = z
  .object({
    date: dateOnlySchema.optional(),
    note: nullableText(5_000, 'Ghi chú').optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, 'Cần cung cấp ít nhất một trường để cập nhật');

const completeTripDaySchema = z
  .object({
    ...tripDayFields,
    itineraries: z
      .array(createItinerarySchema)
      .max(MAX_ITINERARIES_PER_DAY, `Mỗi ngày có tối đa ${MAX_ITINERARIES_PER_DAY} điểm`)
      .optional(),
  })
  .strict();

const tripFields = {
  name: z.string().trim().min(1, 'Tên chuyến đi là bắt buộc').max(200),
  destinationCity: z.string().trim().min(1, 'Thành phố là bắt buộc').max(100),
  startDate: dateOnlySchema,
  endDate: dateOnlySchema,
  budget: moneySchema.nullable().optional(),
  numberOfPeople: z
    .number({ invalid_type_error: 'Số người phải là số' })
    .int('Số người phải là số nguyên')
    .min(1, 'Số người phải ít nhất là 1')
    .max(10_000, 'Số người quá lớn')
    .optional(),
  description: nullableText(10_000, 'Mô tả').optional(),
};

export const createTripSchema = z
  .object({
    ...tripFields,
    tripDays: z.array(completeTripDaySchema).optional(),
  })
  .strict()
  .refine((data) => data.endDate >= data.startDate, {
    message: 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu',
    path: ['endDate'],
  });

export const updateTripSchema = z
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
  .refine(
    (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
    { message: 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu', path: ['endDate'] }
  );

export const tripListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict();

export const tripIdParamsSchema = z.object({ tripId: positiveIdSchema }).strict();

export const tripDayParamsSchema = z
  .object({ tripId: positiveIdSchema, dayId: positiveIdSchema })
  .strict();

export const itineraryParamsSchema = z
  .object({
    tripId: positiveIdSchema,
    dayId: positiveIdSchema,
    itineraryId: positiveIdSchema,
  })
  .strict();

export const shareTokenParamsSchema = z
  .object({
    shareToken: z.string().regex(/^[a-f0-9]{64}$/, 'Share token không hợp lệ'),
  })
  .strict();

export const reorderItinerariesSchema = z
  .object({
    itineraryIds: z
      .array(z.number().int().positive())
      .min(1, 'Danh sách thứ tự không được để trống')
      .max(
        MAX_ITINERARIES_PER_DAY,
        `Danh sách thứ tự có tối đa ${MAX_ITINERARIES_PER_DAY} phần tử`
      ),
  })
  .strict()
  .refine((data) => new Set(data.itineraryIds).size === data.itineraryIds.length, {
    message: 'Danh sách thứ tự không được chứa ID trùng lặp',
    path: ['itineraryIds'],
  });
