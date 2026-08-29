import axiosClient, { API_BASE_URL } from '@/api/axiosClient';
import type {
  AuthTokenResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '@/types/auth.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authService = {
  googleLoginUrl: `${API_BASE_URL}/auth/google`,

  async login(input: LoginRequest): Promise<AuthTokenResponse> {
    const response = await axiosClient.post<ApiResponse<AuthTokenResponse>>('/auth/login', input);
    return response.data.data;
  },

  async register(input: RegisterRequest): Promise<AuthTokenResponse> {
    const response = await axiosClient.post<ApiResponse<AuthTokenResponse>>('/auth/register', input);
    return response.data.data;
  },

  async refresh(): Promise<AuthTokenResponse> {
    const response = await axiosClient.post<ApiResponse<AuthTokenResponse>>('/auth/refresh');
    return response.data.data;
  },

  async logout(): Promise<void> {
    await axiosClient.post('/auth/logout');
  },

  async getProfile(): Promise<User> {
    const response = await axiosClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },

  async updateProfile(input: UpdateProfileRequest): Promise<User> {
    const response = await axiosClient.patch<ApiResponse<User>>('/users/me', input);
    return response.data.data;
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosClient.post<ApiResponse<User>>('/users/me/avatar', formData);
    return response.data.data;
  },

  async deleteAvatar(): Promise<User> {
    const response = await axiosClient.delete<ApiResponse<User>>('/users/me/avatar');
    return response.data.data;
  },

  async changePassword(input: ChangePasswordRequest): Promise<AuthTokenResponse> {
    const response = await axiosClient.patch<ApiResponse<AuthTokenResponse>>(
      '/users/me/password',
      input,
    );
    return response.data.data;
  },
};
