import { z } from 'zod';
export declare const analyticsOverviewQuerySchema: z.ZodObject<{
    periodDays: z.ZodOptional<z.ZodNumber>;
    popularDestinationLimit: z.ZodOptional<z.ZodNumber>;
    topCityLimit: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    periodDays?: number | undefined;
    popularDestinationLimit?: number | undefined;
    topCityLimit?: number | undefined;
}, {
    periodDays?: number | undefined;
    popularDestinationLimit?: number | undefined;
    topCityLimit?: number | undefined;
}>;
export type AnalyticsOverviewQuery = z.infer<typeof analyticsOverviewQuerySchema>;
//# sourceMappingURL=analytics.validator.d.ts.map