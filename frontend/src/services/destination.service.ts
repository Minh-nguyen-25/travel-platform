import axiosClient from '@/api/axiosClient';
import type {
  Category,
  CategoryListParams,
  CategoryListResult,
  Destination,
  DestinationListParams,
  DestinationListResult,
  Pagination,
} from '@/types/destination.types';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  pagination: Pagination;
}

const destinationParams = (params: DestinationListParams) => ({
  ...params,
  categoryIds: params.categoryIds?.length ? params.categoryIds.join(',') : undefined,
});

export const destinationService = {
  async getDestinations(params: DestinationListParams = {}): Promise<DestinationListResult> {
    const response = await axiosClient.get<PaginatedEnvelope<Destination>>('/destinations', {
      params: destinationParams(params),
    });
    return { data: response.data.data, pagination: response.data.pagination };
  },

  async getDestination(destinationId: number): Promise<Destination> {
    const response = await axiosClient.get<ApiEnvelope<Destination>>(
      `/destinations/${destinationId}`,
    );
    return response.data.data;
  },

  async getCategories(params: CategoryListParams = {}): Promise<CategoryListResult> {
    const response = await axiosClient.get<PaginatedEnvelope<Category>>('/categories', { params });
    return { data: response.data.data, pagination: response.data.pagination };
  },
};
