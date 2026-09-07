import axiosClient from '@/api/axiosClient';
import type {
  Review,
  ReviewListParams,
  ReviewListResult,
  ReviewPayload,
} from '@/types/review.types';
import type { Pagination } from '@/types/destination.types';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  pagination: Pagination;
}

const toFormData = ({ rating, comment, images = [] }: ReviewPayload): FormData => {
  const formData = new FormData();
  formData.append('rating', String(rating));
  formData.append('comment', comment);
  images.forEach((image) => formData.append('images', image));
  return formData;
};

const multipartConfig = { headers: { 'Content-Type': 'multipart/form-data' } };

export const reviewService = {
  async getReviews(
    destinationId: number,
    params: ReviewListParams = {},
  ): Promise<ReviewListResult> {
    const response = await axiosClient.get<PaginatedEnvelope<Review>>(
      `/destinations/${destinationId}/reviews`,
      { params },
    );
    return { data: response.data.data, pagination: response.data.pagination };
  },

  async getMyReview(destinationId: number): Promise<Review> {
    const response = await axiosClient.get<ApiEnvelope<Review>>(
      `/destinations/${destinationId}/reviews/me`,
    );
    return response.data.data;
  },

  async createReview(destinationId: number, payload: ReviewPayload): Promise<Review> {
    const response = await axiosClient.post<ApiEnvelope<Review>>(
      `/destinations/${destinationId}/reviews`,
      toFormData(payload),
      multipartConfig,
    );
    return response.data.data;
  },

  async updateReview(reviewId: number, payload: ReviewPayload): Promise<Review> {
    const response = await axiosClient.patch<ApiEnvelope<Review>>(
      `/reviews/${reviewId}`,
      toFormData(payload),
      multipartConfig,
    );
    return response.data.data;
  },

  async deleteReview(reviewId: number): Promise<void> {
    await axiosClient.delete(`/reviews/${reviewId}`);
  },

  async deleteReviewImage(reviewId: number, imageId: number): Promise<Review> {
    const response = await axiosClient.delete<ApiEnvelope<Review>>(
      `/reviews/${reviewId}/images/${imageId}`,
    );
    return response.data.data;
  },
};

