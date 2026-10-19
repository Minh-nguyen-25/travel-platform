import axiosClient from '@/api/axiosClient';
import type {
  AiChatPayload,
  AiConversation,
  AiConversationSummary,
  AiChatResult,
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
  async listConversations(): Promise<AiConversationSummary[]> {
    return (await axiosClient.get<ApiEnvelope<AiConversationSummary[]>>('/ai/conversations')).data.data;
  },
  async getConversation(id: string): Promise<AiConversation> {
    return (await axiosClient.get<ApiEnvelope<AiConversation>>('/ai/conversations/' + id)).data.data;
  },
  async deleteConversation(id: string): Promise<void> {
    await axiosClient.delete('/ai/conversations/' + id);
  },
  async chat(payload: AiChatPayload): Promise<AiChatResult> {
    const response = await axiosClient.post<ApiEnvelope<AiChatResult>>('/ai/chat', payload);
    return response.data.data;
  },

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
