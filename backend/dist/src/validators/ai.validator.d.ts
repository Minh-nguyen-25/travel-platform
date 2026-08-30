import { z } from 'zod';
export declare const generateItinerarySchema: z.ZodObject<{
    destinationCity: z.ZodString;
    days: z.ZodNumber;
    startDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    budgetLevel: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH"]>>;
    budget: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    numberOfPeople: z.ZodOptional<z.ZodNumber>;
    travelStyle: z.ZodOptional<z.ZodString>;
    preferredActivities: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>;
    preferredCategories: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodString, "many">, string[], string[]>>;
    travelMode: z.ZodOptional<z.ZodEnum<["WALKING", "DRIVING", "TRANSIT", "CYCLING"]>>;
    additionalRequests: z.ZodOptional<z.ZodString>;
    locale: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    days: number;
    destinationCity: string;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | undefined;
    startDate?: string | undefined;
    budget?: number | undefined;
    numberOfPeople?: number | undefined;
    budgetLevel?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    travelStyle?: string | undefined;
    preferredActivities?: string[] | undefined;
    preferredCategories?: string[] | undefined;
    additionalRequests?: string | undefined;
    locale?: string | undefined;
}, {
    days: number;
    destinationCity: string;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | undefined;
    startDate?: string | undefined;
    budget?: number | undefined;
    numberOfPeople?: number | undefined;
    budgetLevel?: "LOW" | "MEDIUM" | "HIGH" | undefined;
    travelStyle?: string | undefined;
    preferredActivities?: string[] | undefined;
    preferredCategories?: string[] | undefined;
    additionalRequests?: string | undefined;
    locale?: string | undefined;
}>;
//# sourceMappingURL=ai.validator.d.ts.map