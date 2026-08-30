import { z } from 'zod';
export declare const createPreferenceSchema: z.ZodObject<{
    budgetLevel: z.ZodOptional<z.ZodNullable<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>>;
    travelStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    preferredActivities: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>>;
    preferredCategories: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>>;
}, "strict", z.ZodTypeAny, {
    budgetLevel?: "LOW" | "MEDIUM" | "HIGH" | null | undefined;
    travelStyle?: string | null | undefined;
    preferredActivities?: string[] | null | undefined;
    preferredCategories?: string[] | null | undefined;
}, {
    budgetLevel?: "LOW" | "MEDIUM" | "HIGH" | null | undefined;
    travelStyle?: string | null | undefined;
    preferredActivities?: string[] | null | undefined;
    preferredCategories?: string[] | null | undefined;
}>;
export declare const updatePreferenceSchema: z.ZodEffects<z.ZodObject<{
    budgetLevel: z.ZodOptional<z.ZodNullable<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>>;
    travelStyle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    preferredActivities: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>>;
    preferredCategories: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>>;
}, "strict", z.ZodTypeAny, {
    budgetLevel?: "LOW" | "MEDIUM" | "HIGH" | null | undefined;
    travelStyle?: string | null | undefined;
    preferredActivities?: string[] | null | undefined;
    preferredCategories?: string[] | null | undefined;
}, {
    budgetLevel?: "LOW" | "MEDIUM" | "HIGH" | null | undefined;
    travelStyle?: string | null | undefined;
    preferredActivities?: string[] | null | undefined;
    preferredCategories?: string[] | null | undefined;
}>, {
    budgetLevel?: "LOW" | "MEDIUM" | "HIGH" | null | undefined;
    travelStyle?: string | null | undefined;
    preferredActivities?: string[] | null | undefined;
    preferredCategories?: string[] | null | undefined;
}, {
    budgetLevel?: "LOW" | "MEDIUM" | "HIGH" | null | undefined;
    travelStyle?: string | null | undefined;
    preferredActivities?: string[] | null | undefined;
    preferredCategories?: string[] | null | undefined;
}>;
//# sourceMappingURL=preference.validator.d.ts.map