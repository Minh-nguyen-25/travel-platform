import type { CreateTripPayload, TravelMode } from '@/types/trip.types';
import type { BudgetLevel } from '@/types/preference.types';

export interface GenerateItineraryPayload {
  destinationCity: string;
  days: number;
  startDate: string;
  budgetLevel?: BudgetLevel;
  budget?: number;
  numberOfPeople?: number;
  travelStyle?: string;
  preferredActivities?: string[];
  preferredCategories?: string[];
  travelMode?: TravelMode;
  additionalRequests?: string;
  locale?: string;
}

export interface GeneratedItineraryActivity {
  destinationId: number;
  destinationName: string;
  address: string;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
  startTime: string;
  endTime: string;
  estimatedCost: number;
  travelDistanceKm: number | null;
  travelDurationMinutes: number | null;
  travelMode: TravelMode;
  note: string;
}

export interface GeneratedItineraryDay {
  dayNumber: number;
  date: string | null;
  theme: string;
  note: string;
  estimatedCost: number;
  activities: GeneratedItineraryActivity[];
}

export interface GeneratedItinerary {
  title: string;
  destinationCity: string;
  summary: string;
  numberOfPeople: number;
  totalEstimatedCost: number;
  days: GeneratedItineraryDay[];
}

export interface AiTripDraft extends CreateTripPayload {
  aiRawData: string;
  aiProofToken: string;
}

export interface AiItineraryGenerationResult {
  itinerary: GeneratedItinerary;
  tripDraft: AiTripDraft | null;
  metadata: {
    provider: 'openai' | 'gemini';
    model: string;
    generatedAt: string;
  };
  warnings: string[];
  aiRawData: string;
}

export interface AiPlannerFormValues {
  destinationCity: string;
  startDate: string;
  days: number;
  numberOfPeople: number;
  budgetLevel: BudgetLevel;
  budget: string;
  travelStyle: string;
  preferredActivities: string[];
  preferredCategories: string[];
  travelMode: TravelMode;
  additionalRequests: string;
}

export type AiChatRole = 'user' | 'assistant';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

export interface AiChatPayload {
  message: string;
  history?: AiChatMessage[];
  locale?: string;
}

export interface AiChatResult {
  reply: string;
  metadata: {
    provider: 'openai' | 'gemini';
    model: string;
    generatedAt: string;
  };
  context: {
    tripCount: number;
    destinationCount: number;
  };
}
