import axios from 'axios';
import axiosClient from '@/api/axiosClient';
import type {
  TravelPreference,
  TravelPreferencePayload,
} from '@/types/preference.types';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const updatePreference = async (
  payload: TravelPreferencePayload,
): Promise<TravelPreference> => {
  const response = await axiosClient.patch<ApiEnvelope<TravelPreference>>('/travel-preferences', payload);
  return response.data.data;
};

const createPreference = async (
  payload: TravelPreferencePayload,
): Promise<TravelPreference> => {
  const response = await axiosClient.post<ApiEnvelope<TravelPreference>>(
    '/travel-preferences',
    payload,
  );
  return response.data.data;
};

export const preferenceService = {
  async getPreference(): Promise<TravelPreference | null> {
    try {
      const response = await axiosClient.get<ApiEnvelope<TravelPreference>>('/travel-preferences');
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  async savePreference(
    payload: TravelPreferencePayload,
    preferenceExists: boolean,
  ): Promise<TravelPreference> {
    if (preferenceExists) {
      try {
        return await updatePreference(payload);
      } catch (error: unknown) {
        // The row may have been deleted from another tab after this page loaded.
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return createPreference(payload);
        }
        throw error;
      }
    }

    try {
      return await createPreference(payload);
    } catch (error: unknown) {
      // A second tab may have created the one-to-one preference after it was loaded.
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return updatePreference(payload);
      }
      throw error;
    }
  },
};
