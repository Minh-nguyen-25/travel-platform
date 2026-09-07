import axiosClient from '@/api/axiosClient';
import type {
  AdminUser,
  AdminUserListResponse,
  AdminUserQuery,
  AnalyticsOverview,
} from '@/types/admin.types';
import type { UserRole } from '@/types/auth.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: AdminUserListResponse['pagination'];
}

export const adminService = {
  async getUsers(query: AdminUserQuery, signal?: AbortSignal): Promise<AdminUserListResponse> {
    const response = await axiosClient.get<PaginatedApiResponse<AdminUser>>('/admin/users', {
      params: query,
      signal,
    });
    return { data: response.data.data, pagination: response.data.pagination };
  },

  async setUserStatus(userId: number, isActive: boolean): Promise<AdminUser> {
    const response = await axiosClient.patch<ApiResponse<AdminUser>>(
      `/admin/users/${userId}/status`,
      { isActive },
    );
    return response.data.data;
  },

  async setUserRole(userId: number, role: UserRole): Promise<AdminUser> {
    const response = await axiosClient.patch<ApiResponse<AdminUser>>(
      `/admin/users/${userId}/role`,
      { role },
    );
    return response.data.data;
  },

  async getAnalytics(periodDays: number, signal?: AbortSignal): Promise<AnalyticsOverview> {
    const response = await axiosClient.get<ApiResponse<AnalyticsOverview>>(
      '/admin/analytics/overview',
      {
        params: { periodDays, popularDestinationLimit: 20, topCityLimit: 5 },
        signal,
      },
    );
    return response.data.data;
  },
};
