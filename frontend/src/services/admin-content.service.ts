import axiosClient from '@/api/axiosClient';
import type {
  AdminCategoryListResponse,
  AdminCategoryQuery,
  AdminDestinationListResponse,
  AdminDestinationQuery,
  AdminReviewListResponse,
  AdminReviewQuery,
  CategoryUpsertPayload,
  DestinationUpsertPayload,
} from '@/types/admin-content.types';
import type { PaginationMeta } from '@/types/admin.types';
import type { Category, Destination } from '@/types/destination.types';
import type { Review } from '@/types/review.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

const toDestinationFormData = (payload: DestinationUpsertPayload): FormData => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('description', payload.description ?? '');
  formData.append('address', payload.address);
  formData.append('phoneNumber', payload.phoneNumber ?? '');
  formData.append('latitude', String(payload.latitude));
  formData.append('longitude', String(payload.longitude));
  formData.append('ticketPrice', String(payload.ticketPrice));
  formData.append('openingHoursNote', payload.openingHoursNote ?? '');
  if (payload.visitDuration !== undefined) {
    formData.append('visitDuration', String(payload.visitDuration));
  }
  formData.append('isActive', String(payload.isActive));
  formData.append('categoryIds', JSON.stringify(payload.categoryIds));
  if (payload.primaryImageIndex !== undefined) {
    formData.append('primaryImageIndex', String(payload.primaryImageIndex));
  }
  payload.images?.forEach((image) => formData.append('images', image));
  return formData;
};

const destinationQueryParams = (query: AdminDestinationQuery) => ({
  ...query,
  categoryIds: query.categoryIds?.length ? query.categoryIds.join(',') : undefined,
});

export const adminContentService = {
  async getDestinations(
    query: AdminDestinationQuery,
    signal?: AbortSignal,
  ): Promise<AdminDestinationListResponse> {
    const response = await axiosClient.get<PaginatedApiResponse<Destination>>(
      '/admin/destinations',
      { params: destinationQueryParams(query), signal },
    );
    return { data: response.data.data, pagination: response.data.pagination };
  },

  async createDestination(payload: DestinationUpsertPayload): Promise<Destination> {
    const response = await axiosClient.post<ApiResponse<Destination>>(
      '/admin/destinations',
      toDestinationFormData(payload),
    );
    return response.data.data;
  },

  async updateDestination(
    destinationId: number,
    payload: DestinationUpsertPayload,
  ): Promise<Destination> {
    const response = await axiosClient.patch<ApiResponse<Destination>>(
      `/admin/destinations/${destinationId}`,
      toDestinationFormData(payload),
    );
    return response.data.data;
  },

  async setDestinationVisibility(destinationId: number, isActive: boolean): Promise<Destination> {
    if (!isActive) {
      const response = await axiosClient.delete<ApiResponse<Destination>>(
        `/admin/destinations/${destinationId}`,
      );
      return response.data.data;
    }
    const response = await axiosClient.patch<ApiResponse<Destination>>(
      `/admin/destinations/${destinationId}`,
      { isActive: true },
    );
    return response.data.data;
  },

  async getCategories(
    query: AdminCategoryQuery,
    signal?: AbortSignal,
  ): Promise<AdminCategoryListResponse> {
    const response = await axiosClient.get<PaginatedApiResponse<Category>>('/admin/categories', {
      params: query,
      signal,
    });
    return { data: response.data.data, pagination: response.data.pagination };
  },

  async createCategory(payload: CategoryUpsertPayload): Promise<Category> {
    const response = await axiosClient.post<ApiResponse<Category>>('/admin/categories', payload);
    return response.data.data;
  },

  async updateCategory(categoryId: number, payload: CategoryUpsertPayload): Promise<Category> {
    const response = await axiosClient.patch<ApiResponse<Category>>(
      `/admin/categories/${categoryId}`,
      payload,
    );
    return response.data.data;
  },

  async deleteCategory(categoryId: number): Promise<void> {
    await axiosClient.delete(`/admin/categories/${categoryId}`);
  },

  async getReviews(
    query: AdminReviewQuery,
    signal?: AbortSignal,
  ): Promise<AdminReviewListResponse> {
    const response = await axiosClient.get<PaginatedApiResponse<Review>>('/admin/reviews', {
      params: query,
      signal,
    });
    return { data: response.data.data, pagination: response.data.pagination };
  },

  async setReviewVisibility(reviewId: number, isVisible: boolean): Promise<Review> {
    const response = await axiosClient.patch<ApiResponse<Review>>(
      `/admin/reviews/${reviewId}/visibility`,
      { isVisible },
    );
    return response.data.data;
  },

  async deleteReview(reviewId: number): Promise<void> {
    await axiosClient.delete(`/admin/reviews/${reviewId}`);
  },
};
