import { z } from 'zod';
export declare const createItinerarySchema: z.ZodEffects<z.ZodObject<{
    destinationId: z.ZodNumber;
    startTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    endTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    estimatedCost: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    travelDistanceKm: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, number, number>>>;
    travelDurationMinutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    travelMode: z.ZodOptional<z.ZodNullable<z.ZodEnum<["WALKING", "DRIVING", "TRANSIT", "CYCLING"]>>>;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    destinationId: number;
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    estimatedCost?: number | undefined;
    travelDistanceKm?: number | null | undefined;
    travelDurationMinutes?: number | null | undefined;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
    note?: string | null | undefined;
}, {
    destinationId: number;
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    estimatedCost?: number | undefined;
    travelDistanceKm?: number | null | undefined;
    travelDurationMinutes?: number | null | undefined;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
    note?: string | null | undefined;
}>, {
    destinationId: number;
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    estimatedCost?: number | undefined;
    travelDistanceKm?: number | null | undefined;
    travelDurationMinutes?: number | null | undefined;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
    note?: string | null | undefined;
}, {
    destinationId: number;
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    estimatedCost?: number | undefined;
    travelDistanceKm?: number | null | undefined;
    travelDurationMinutes?: number | null | undefined;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
    note?: string | null | undefined;
}>;
export declare const updateItinerarySchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    destinationId: z.ZodOptional<z.ZodNumber>;
    startTime: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    endTime: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    estimatedCost: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>>;
    travelDistanceKm: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, number, number>>>>;
    travelDurationMinutes: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    travelMode: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodEnum<["WALKING", "DRIVING", "TRANSIT", "CYCLING"]>>>>;
    note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strict", z.ZodTypeAny, {
    destinationId?: number | undefined;
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    estimatedCost?: number | undefined;
    travelDistanceKm?: number | null | undefined;
    travelDurationMinutes?: number | null | undefined;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
    note?: string | null | undefined;
}, {
    destinationId?: number | undefined;
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    estimatedCost?: number | undefined;
    travelDistanceKm?: number | null | undefined;
    travelDurationMinutes?: number | null | undefined;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
    note?: string | null | undefined;
}>, {
    destinationId?: number | undefined;
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    estimatedCost?: number | undefined;
    travelDistanceKm?: number | null | undefined;
    travelDurationMinutes?: number | null | undefined;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
    note?: string | null | undefined;
}, {
    destinationId?: number | undefined;
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    estimatedCost?: number | undefined;
    travelDistanceKm?: number | null | undefined;
    travelDurationMinutes?: number | null | undefined;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
    note?: string | null | undefined;
}>, {
    destinationId?: number | undefined;
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    estimatedCost?: number | undefined;
    travelDistanceKm?: number | null | undefined;
    travelDurationMinutes?: number | null | undefined;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
    note?: string | null | undefined;
}, {
    destinationId?: number | undefined;
    startTime?: string | null | undefined;
    endTime?: string | null | undefined;
    estimatedCost?: number | undefined;
    travelDistanceKm?: number | null | undefined;
    travelDurationMinutes?: number | null | undefined;
    travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
    note?: string | null | undefined;
}>;
export declare const createTripDaySchema: z.ZodObject<{
    dayNumber: z.ZodOptional<z.ZodNumber>;
    date: z.ZodEffects<z.ZodString, string, string>;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    date: string;
    note?: string | null | undefined;
    dayNumber?: number | undefined;
}, {
    date: string;
    note?: string | null | undefined;
    dayNumber?: number | undefined;
}>;
export declare const updateTripDaySchema: z.ZodEffects<z.ZodObject<{
    date: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    date?: string | undefined;
    note?: string | null | undefined;
}, {
    date?: string | undefined;
    note?: string | null | undefined;
}>, {
    date?: string | undefined;
    note?: string | null | undefined;
}, {
    date?: string | undefined;
    note?: string | null | undefined;
}>;
export declare const createTripSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    tripDays: z.ZodOptional<z.ZodArray<z.ZodObject<{
        itineraries: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            destinationId: z.ZodNumber;
            startTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            endTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            estimatedCost: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
            travelDistanceKm: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, number, number>>>;
            travelDurationMinutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            travelMode: z.ZodOptional<z.ZodNullable<z.ZodEnum<["WALKING", "DRIVING", "TRANSIT", "CYCLING"]>>>;
            note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strict", z.ZodTypeAny, {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }, {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }>, {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }, {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }>, "many">>;
        dayNumber: z.ZodOptional<z.ZodNumber>;
        date: z.ZodEffects<z.ZodString, string, string>;
        note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strict", z.ZodTypeAny, {
        date: string;
        note?: string | null | undefined;
        dayNumber?: number | undefined;
        itineraries?: {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }[] | undefined;
    }, {
        date: string;
        note?: string | null | undefined;
        dayNumber?: number | undefined;
        itineraries?: {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }[] | undefined;
    }>, "many">>;
    aiRawData: z.ZodOptional<z.ZodString>;
    aiProofToken: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    destinationCity: z.ZodString;
    startDate: z.ZodEffects<z.ZodString, string, string>;
    endDate: z.ZodEffects<z.ZodString, string, string>;
    budget: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, number, number>>>;
    numberOfPeople: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    name: string;
    destinationCity: string;
    startDate: string;
    endDate: string;
    tripDays?: {
        date: string;
        note?: string | null | undefined;
        dayNumber?: number | undefined;
        itineraries?: {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }[] | undefined;
    }[] | undefined;
    aiRawData?: string | undefined;
    aiProofToken?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}, {
    name: string;
    destinationCity: string;
    startDate: string;
    endDate: string;
    tripDays?: {
        date: string;
        note?: string | null | undefined;
        dayNumber?: number | undefined;
        itineraries?: {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }[] | undefined;
    }[] | undefined;
    aiRawData?: string | undefined;
    aiProofToken?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}>, {
    name: string;
    destinationCity: string;
    startDate: string;
    endDate: string;
    tripDays?: {
        date: string;
        note?: string | null | undefined;
        dayNumber?: number | undefined;
        itineraries?: {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }[] | undefined;
    }[] | undefined;
    aiRawData?: string | undefined;
    aiProofToken?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}, {
    name: string;
    destinationCity: string;
    startDate: string;
    endDate: string;
    tripDays?: {
        date: string;
        note?: string | null | undefined;
        dayNumber?: number | undefined;
        itineraries?: {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }[] | undefined;
    }[] | undefined;
    aiRawData?: string | undefined;
    aiProofToken?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}>, {
    name: string;
    destinationCity: string;
    startDate: string;
    endDate: string;
    tripDays?: {
        date: string;
        note?: string | null | undefined;
        dayNumber?: number | undefined;
        itineraries?: {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }[] | undefined;
    }[] | undefined;
    aiRawData?: string | undefined;
    aiProofToken?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}, {
    name: string;
    destinationCity: string;
    startDate: string;
    endDate: string;
    tripDays?: {
        date: string;
        note?: string | null | undefined;
        dayNumber?: number | undefined;
        itineraries?: {
            destinationId: number;
            startTime?: string | null | undefined;
            endTime?: string | null | undefined;
            estimatedCost?: number | undefined;
            travelDistanceKm?: number | null | undefined;
            travelDurationMinutes?: number | null | undefined;
            travelMode?: "WALKING" | "DRIVING" | "TRANSIT" | "CYCLING" | null | undefined;
            note?: string | null | undefined;
        }[] | undefined;
    }[] | undefined;
    aiRawData?: string | undefined;
    aiProofToken?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}>;
export declare const updateTripSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    destinationCity: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    endDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    budget: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, number, number>>>;
    numberOfPeople: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    name?: string | undefined;
    destinationCity?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}, {
    name?: string | undefined;
    destinationCity?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}>, {
    name?: string | undefined;
    destinationCity?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}, {
    name?: string | undefined;
    destinationCity?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}>, {
    name?: string | undefined;
    destinationCity?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}, {
    name?: string | undefined;
    destinationCity?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    budget?: number | null | undefined;
    numberOfPeople?: number | undefined;
    description?: string | null | undefined;
}>;
export declare const tripListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    page: number;
}, {
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const tripIdParamsSchema: z.ZodObject<{
    tripId: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    tripId: number;
}, {
    tripId: number;
}>;
export declare const tripDayParamsSchema: z.ZodObject<{
    tripId: z.ZodNumber;
    dayId: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    tripId: number;
    dayId: number;
}, {
    tripId: number;
    dayId: number;
}>;
export declare const itineraryParamsSchema: z.ZodObject<{
    tripId: z.ZodNumber;
    dayId: z.ZodNumber;
    itineraryId: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    tripId: number;
    dayId: number;
    itineraryId: number;
}, {
    tripId: number;
    dayId: number;
    itineraryId: number;
}>;
export declare const shareTokenParamsSchema: z.ZodObject<{
    shareToken: z.ZodString;
}, "strict", z.ZodTypeAny, {
    shareToken: string;
}, {
    shareToken: string;
}>;
export declare const reorderItinerariesSchema: z.ZodEffects<z.ZodObject<{
    itineraryIds: z.ZodArray<z.ZodNumber, "many">;
}, "strict", z.ZodTypeAny, {
    itineraryIds: number[];
}, {
    itineraryIds: number[];
}>, {
    itineraryIds: number[];
}, {
    itineraryIds: number[];
}>;
//# sourceMappingURL=trip.validator.d.ts.map