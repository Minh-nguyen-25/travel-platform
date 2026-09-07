import { z } from 'zod';
import { BUDGET_LEVEL, TRAVEL_MODE } from '../constants';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const hasAtMostTwoDecimalPlaces = (value: number): boolean =>
  Number(value.toFixed(2)) === value;

const isValidDateOnly = (value: string): boolean => {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const preferenceListSchema = z
  .array(z.string().trim().min(1).max(100))
  .max(20)
  .refine(
    (items) => new Set(items.map((item) => item.toLocaleLowerCase('vi'))).size === items.length,
    'Danh sách sở thích không được chứa giá trị trùng lặp'
  );

export const generateItinerarySchema = z
  .object({
    destinationCity: z.string().trim().min(1).max(100),
    days: z.number().int().min(1).max(14),
    startDate: z.string().refine(isValidDateOnly, 'startDate phải có định dạng YYYY-MM-DD hợp lệ').optional(),
    budgetLevel: z.enum([BUDGET_LEVEL.LOW, BUDGET_LEVEL.MEDIUM, BUDGET_LEVEL.HIGH]).optional(),
    budget: z
      .number()
      .finite()
      .min(0)
      .max(9_999_999_999.99)
      .refine(hasAtMostTwoDecimalPlaces, 'budget chỉ được có tối đa 2 chữ số thập phân')
      .optional(),
    numberOfPeople: z.number().int().min(1).max(10_000).optional(),
    travelStyle: z.string().trim().min(1).max(100).optional(),
    preferredActivities: preferenceListSchema.optional(),
    preferredCategories: preferenceListSchema.optional(),
    travelMode: z
      .enum([
        TRAVEL_MODE.WALKING,
        TRAVEL_MODE.DRIVING,
        TRAVEL_MODE.TRANSIT,
        TRAVEL_MODE.CYCLING,
      ])
      .optional(),
    additionalRequests: z.string().trim().min(1).max(2_000).optional(),
    locale: z
      .string()
      .trim()
      .regex(/^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?$/, 'locale không hợp lệ')
      .optional(),
  })
  .strict();

const chatMessageSchema = z
  .object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(4_000),
  })
  .strict();

export const chatSchema = z
  .object({
    message: z.string().trim().min(1).max(2_000),
    history: z.array(chatMessageSchema).max(12).optional(),
    locale: z
      .string()
      .trim()
      .regex(/^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?$/, 'locale không hợp lệ')
      .optional(),
  })
  .strict();
