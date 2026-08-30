import { TravelMode } from '../constants';
export interface TripListQuery {
    page: number;
    limit: number;
}
export interface CreateItineraryInput {
    destinationId: number;
    startTime?: string | null;
    endTime?: string | null;
    estimatedCost?: number;
    travelDistanceKm?: number | null;
    travelDurationMinutes?: number | null;
    travelMode?: TravelMode | null;
    note?: string | null;
}
export interface UpdateItineraryInput {
    destinationId?: number;
    startTime?: string | null;
    endTime?: string | null;
    estimatedCost?: number;
    travelDistanceKm?: number | null;
    travelDurationMinutes?: number | null;
    travelMode?: TravelMode | null;
    note?: string | null;
}
export interface CreateTripDayInput {
    dayNumber?: number;
    date: string;
    note?: string | null;
}
export interface CreateCompleteTripDayInput extends CreateTripDayInput {
    itineraries?: CreateItineraryInput[];
}
export interface UpdateTripDayInput {
    date?: string;
    note?: string | null;
}
export interface CreateTripInput {
    name: string;
    destinationCity: string;
    startDate: string;
    endDate: string;
    budget?: number | null;
    numberOfPeople?: number;
    description?: string | null;
    tripDays?: CreateCompleteTripDayInput[];
}
export interface UpdateTripInput {
    name?: string;
    destinationCity?: string;
    startDate?: string;
    endDate?: string;
    budget?: number | null;
    numberOfPeople?: number;
    description?: string | null;
}
export interface ReorderItinerariesInput {
    itineraryIds: number[];
}
export interface NormalizedItineraryInput {
    destinationId: number;
    sequenceOrder: number;
    startTime: Date | null;
    endTime: Date | null;
    estimatedCost: number;
    travelDistanceKm: number | null;
    travelDurationMinutes: number | null;
    travelMode: TravelMode | null;
    note: string | null;
}
export interface NormalizedTripDayInput {
    dayNumber: number;
    date: Date;
    note: string | null;
    itineraries: NormalizedItineraryInput[];
}
export interface NormalizedCreateTripInput {
    name: string;
    destinationCity: string;
    startDate: Date;
    endDate: Date;
    budget: number | null;
    numberOfPeople: number;
    description: string | null;
    isAiGenerated: boolean;
    aiRawData: string | null;
    tripDays: NormalizedTripDayInput[];
}
export interface NormalizedUpdateTripInput {
    name?: string;
    destinationCity?: string;
    startDate?: Date;
    endDate?: Date;
    budget?: number | null;
    numberOfPeople?: number;
    description?: string | null;
}
export interface NormalizedCreateTripDayInput {
    dayNumber: number;
    date: Date;
    note: string | null;
}
export interface NormalizedUpdateTripDayInput {
    dayNumber?: number;
    date?: Date;
    note?: string | null;
}
export interface NormalizedCreateItineraryInput {
    destinationId: number;
    startTime: Date | null;
    endTime: Date | null;
    estimatedCost: number;
    travelDistanceKm: number | null;
    travelDurationMinutes: number | null;
    travelMode: TravelMode | null;
    note: string | null;
}
export interface NormalizedUpdateItineraryInput {
    destinationId?: number;
    startTime?: Date | null;
    endTime?: Date | null;
    estimatedCost?: number;
    travelDistanceKm?: number | null;
    travelDurationMinutes?: number | null;
    travelMode?: TravelMode | null;
    note?: string | null;
}
export interface CreateTripMetadata {
    isAiGenerated?: boolean;
    aiRawData?: string | null;
}
//# sourceMappingURL=trip.types.d.ts.map