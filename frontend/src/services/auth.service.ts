import axiosClient from '@/api/axiosClient';
import type { AxiosResponse } from 'axios';
import type {
  ApiResponse,
  AuthTokenResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/types/auth.types';

/**
 * Service API tập trung cho Authentication.
 * Tất cả request đều đi qua axiosClient (đã gắn withCredentials: true và request interceptor).
 */
export const authApi = {
  /**
   * Đăng nhập với email và password.
   * Backend trả về accessToken và user object; refreshToken được set trong HttpOnly cookie.
   */
  login: (data: LoginRequest): Promise<AxiosResponse<ApiResponse<AuthTokenResponse>>> =>
    axiosClient.post<ApiResponse<AuthTokenResponse>>('/auth/login', data),

  /**
   * Đăng ký tài khoản người dùng mới.
   * Backend trả về accessToken và user object; refreshToken được set trong HttpOnly cookie.
   */
  register: (data: RegisterRequest): Promise<AxiosResponse<ApiResponse<AuthTokenResponse>>> =>
    axiosClient.post<ApiResponse<AuthTokenResponse>>('/auth/register', data),

  /**
   * Làm mới Access Token thông qua HttpOnly cookie.
   */
  refresh: (): Promise<AxiosResponse<ApiResponse<{ accessToken: string }>>> =>
    axiosClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),

  /**
   * Đăng xuất người dùng — Backend thu hồi session trong Redis và xóa HttpOnly cookie.
   */
  logout: (): Promise<AxiosResponse<ApiResponse<null>>> =>
    axiosClient.post<ApiResponse<null>>('/auth/logout'),

  /**
   * Lấy thông tin an toàn của người dùng hiện tại (yêu cầu Authorization: Bearer token).
   */
  getMe: (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    axiosClient.get<ApiResponse<{ user: User }>>('/auth/me'),
};
