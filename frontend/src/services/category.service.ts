import axiosClient from '@/api/axiosClient';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/common.types';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/category.types';

export const categoryService = {
  /**
   * Lấy danh sách tất cả danh mục (kèm số lượng địa điểm)
   */
  getAll: (): Promise<AxiosResponse<ApiResponse<Category[]>>> =>
    axiosClient.get<ApiResponse<Category[]>>('/categories'),

  /**
   * Lấy chi tiết 1 danh mục
   */
  getById: (id: number | string): Promise<AxiosResponse<ApiResponse<Category>>> =>
    axiosClient.get<ApiResponse<Category>>(`/categories/${id}`),

  /**
   * Tạo danh mục mới (Admin)
   */
  create: (data: CreateCategoryRequest): Promise<AxiosResponse<ApiResponse<Category>>> =>
    axiosClient.post<ApiResponse<Category>>('/categories', data),

  /**
   * Cập nhật danh mục (Admin)
   */
  update: (
    id: number | string,
    data: UpdateCategoryRequest
  ): Promise<AxiosResponse<ApiResponse<Category>>> =>
    axiosClient.put<ApiResponse<Category>>(`/categories/${id}`, data),

  /**
   * Xóa danh mục (Admin)
   */
  delete: (id: number | string): Promise<AxiosResponse<ApiResponse<null>>> =>
    axiosClient.delete<ApiResponse<null>>(`/categories/${id}`),
};

