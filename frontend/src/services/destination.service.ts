import axiosClient from '@/api/axiosClient';
import type { AxiosResponse } from 'axios';
import type { ApiResponse, PaginatedApiResponse } from '@/types/common.types';
import type {
  Destination,
  DestinationFilterParams,
} from '@/types/destination.types';

export const destinationService = {
  /**
   * Lấy danh sách địa điểm (có bộ lọc đa năng & phân trang)
   */
  getAll: (
    params?: DestinationFilterParams
  ): Promise<AxiosResponse<PaginatedApiResponse<Destination>>> =>
    axiosClient.get<PaginatedApiResponse<Destination>>('/destinations', { params }),

  /**
   * Lấy top địa điểm đánh giá cao nhất cho trang chủ
   */
  getTopRated: (
    limit = 6
  ): Promise<AxiosResponse<ApiResponse<Destination[]>>> =>
    axiosClient.get<ApiResponse<Destination[]>>('/destinations/top-rated', {
      params: { limit },
    }),

  /**
   * Lấy thông tin chi tiết 1 địa điểm
   */
  getById: (
    id: number | string
  ): Promise<AxiosResponse<ApiResponse<Destination>>> =>
    axiosClient.get<ApiResponse<Destination>>(`/destinations/${id}`),

  /**
   * Tạo địa điểm mới (Admin - hỗ trợ upload nhiều ảnh qua FormData)
   */
  create: (
    formData: FormData
  ): Promise<AxiosResponse<ApiResponse<Destination>>> =>
    axiosClient.post<ApiResponse<Destination>>('/destinations', formData, {
      headers: { 'Content-Type': undefined },
    }),

  /**
   * Cập nhật thông tin địa điểm (Admin - hỗ trợ upload thêm ảnh mới qua FormData)
   */
  update: (
    id: number | string,
    formData: FormData
  ): Promise<AxiosResponse<ApiResponse<Destination>>> =>
    axiosClient.put<ApiResponse<Destination>>(`/destinations/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    }),

  /**
   * Bật / Tắt trạng thái hiển thị (Ẩn/Hiện địa điểm)
   */
  toggleStatus: (
    id: number | string,
    isActive: boolean
  ): Promise<AxiosResponse<ApiResponse<Destination>>> =>
    axiosClient.patch<ApiResponse<Destination>>(`/destinations/${id}/status`, {
      isActive,
    }),

  /**
   * Xóa mềm địa điểm
   */
  delete: (id: number | string): Promise<AxiosResponse<ApiResponse<null>>> =>
    axiosClient.delete<ApiResponse<null>>(`/destinations/${id}`),

  /**
   * Xóa 1 ảnh của địa điểm
   */
  deleteImage: (
    destinationId: number | string,
    imageId: number | string
  ): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    axiosClient.delete<ApiResponse<{ message: string }>>(`/destinations/${destinationId}/images/${imageId}`),

  /**
   * Đặt 1 ảnh làm ảnh chính
   */
  setPrimaryImage: (
    destinationId: number | string,
    imageId: number | string
  ): Promise<AxiosResponse<ApiResponse<{ message: string }>>> =>
    axiosClient.patch<ApiResponse<{ message: string }>>(`/destinations/${destinationId}/images/${imageId}/primary`),
};

// Backwards compatibility for any temporary imports
export const destinationApi = destinationService;

