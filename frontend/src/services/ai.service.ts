import axiosClient from '@/api/axiosClient';
import type {
  AiItineraryGenerationResult,
  AiTripDraft,
  GenerateItineraryPayload,
} from '@/types/ai.types';
import type { TripDetail } from '@/types/trip.types';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const aiService = {
  async generateItinerary(
    payload: GenerateItineraryPayload,
  ): Promise<AiItineraryGenerationResult> {
    const response = await axiosClient.post<ApiEnvelope<AiItineraryGenerationResult>>(
      '/ai/generate-itinerary',
      payload,
    );
    return response.data.data;
  },

  async saveTripDraft(draft: AiTripDraft): Promise<TripDetail> {
    const response = await axiosClient.post<ApiEnvelope<TripDetail>>('/trips', draft);
    return response.data.data;
  },
};
