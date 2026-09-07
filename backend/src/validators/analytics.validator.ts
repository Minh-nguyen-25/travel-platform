import { z } from 'zod';
import {
  MAX_ANALYTICS_PERIOD_DAYS,
  MAX_ANALYTICS_RANKING_LIMIT,
} from '../services/analytics.service';

const optionalBoundedInteger = (field: string, maximum: number) =>
  z.coerce
    .number({ invalid_type_error: `${field} phải là số` })
    .int(`${field} phải là số nguyên`)
    .min(1, `${field} phải lớn hơn hoặc bằng 1`)
    .max(maximum, `${field} không được vượt quá ${maximum}`)
    .optional();

export const analyticsOverviewQuerySchema = z
  .object({
    periodDays: optionalBoundedInteger('periodDays', MAX_ANALYTICS_PERIOD_DAYS),
    popularDestinationLimit: optionalBoundedInteger(
      'popularDestinationLimit',
      MAX_ANALYTICS_RANKING_LIMIT
    ),
    topCityLimit: optionalBoundedInteger('topCityLimit', MAX_ANALYTICS_RANKING_LIMIT),
  })
  .strict();

export type AnalyticsOverviewQuery = z.infer<typeof analyticsOverviewQuerySchema>;
