import { BudgetLevel, TravelMode } from '../constants';
import { CreateTripInput } from './trip.types';

export type AiProvider = 'openai' | 'gemini';

export interface GenerateItineraryInput {
  destinationCity: string;
  days: number;
  startDate?: string;
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

export type AiChatRole = 'user' | 'assistant';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

export interface AiChatInput {
  message: string;
  history?: AiChatMessage[];
  locale?: string;
}

export interface AiChatResult {
  reply: string;
  metadata: AiGenerationMetadata;
  context: {
    tripCount: number;
    destinationCount: number;
  };
}

export interface AiDestinationCandidate {
  id: number;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  ticketPrice: number;
  openingHoursNote: string | null;
  visitDurationMinutes: number | null;
  rating: number;
  categories: string[];
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

export interface AiGenerationMetadata {
  provider: AiProvider;
  model: string;
  generatedAt: string;
}

export interface AiTripDraft extends CreateTripInput {
  aiRawData: string;
  aiProofToken: string;
}

/**
 * `tripDraft` is present only when the request contains `startDate`.
 * Send it unchanged to POST /trips so the server can verify the signed AI proof.
 */
export interface AiItineraryGenerationResult {
  itinerary: GeneratedItinerary;
  tripDraft: AiTripDraft | null;
  metadata: AiGenerationMetadata;
  warnings: string[];
  aiRawData: string;
}
