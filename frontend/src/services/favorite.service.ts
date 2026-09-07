import axiosClient from '@/api/axiosClient';
import type { Pagination } from '@/types/destination.types';
import type {
  FavoriteListResult,
  FavoriteStatus,
  SavedDestination,
} from '@/types/review.types';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  pagination: Pagination;
}

export const favoriteService = {
  async getStatus(destinationId: number): Promise<FavoriteStatus> {
    const response = await axiosClient.get<ApiEnvelope<FavoriteStatus>>(
      `/destinations/${destinationId}/favorite`,
    );
    return response.data.data;
  },

  async toggle(destinationId: number): Promise<FavoriteStatus> {
    const response = await axiosClient.post<ApiEnvelope<FavoriteStatus>>(
      `/destinations/${destinationId}/favorite`,
    );
    return response.data.data;
  },

  async getFavorites(page = 1, limit = 12): Promise<FavoriteListResult> {
    const response = await axiosClient.get<PaginatedEnvelope<SavedDestination>>('/favorites', {
      params: { page, limit },
    });
    return { data: response.data.data, pagination: response.data.pagination };
  },
};

