import { AxiosResponse } from 'axios';
import axiosClient from '@/api/axiosClient';
import type {
  ApiResponse,
  AuthTokenResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '@/types/auth.types';

export const authApi = {
  login: (data: LoginRequest): Promise<AxiosResponse<ApiResponse<AuthTokenResponse>>> =>
    axiosClient.post<ApiResponse<AuthTokenResponse>>('/auth/login', data),

  register: (data: RegisterRequest): Promise<AxiosResponse<ApiResponse<AuthTokenResponse>>> =>
    axiosClient.post<ApiResponse<AuthTokenResponse>>('/auth/register', data),

  refresh: (): Promise<AxiosResponse<ApiResponse<{ accessToken: string }>>> =>
    axiosClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),

  logout: (): Promise<AxiosResponse<ApiResponse<null>>> =>
    axiosClient.post<ApiResponse<null>>('/auth/logout'),

  getMe: (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    axiosClient.get<ApiResponse<{ user: User }>>('/auth/me'),

  consumeOAuthTicket: (ticket: string): Promise<AxiosResponse<ApiResponse<{ returnPath: string }>>> =>
    axiosClient.post<ApiResponse<{ returnPath: string }>>('/auth/oauth/consume-ticket', { ticket }),

  forgotPassword: (data: { email: string }): Promise<AxiosResponse<ApiResponse<null>>> =>
    axiosClient.post<ApiResponse<null>>('/auth/forgot-password', data),

  requestResetCode: (email: string) =>
    axiosClient.post<ApiResponse<{ expiresInSeconds: number; resendAfterSeconds: number }>>('/auth/forgot-password/code', { email }),

  verifyResetCode: (email: string, code: string) =>
    axiosClient.post<ApiResponse<{ resetToken: string }>>('/auth/reset-password/code/verify', { email, code }),

  resetPasswordWithCode: (data: { email: string; code: string; resetToken: string; password: string; confirmPassword: string }) =>
    axiosClient.post<ApiResponse<null>>('/auth/reset-password/code', data),

  validateResetToken: (
    data: { token: string },
    signal?: AbortSignal
  ): Promise<AxiosResponse<ApiResponse<{ valid: boolean }>>> =>
    axiosClient.post<ApiResponse<{ valid: boolean }>>('/auth/reset-password/validate', data, { signal }),

  resetPassword: (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<AxiosResponse<ApiResponse<null>>> =>
    axiosClient.post<ApiResponse<null>>('/auth/reset-password', data),
};


export const authService = {
  async login(input: LoginRequest): Promise<AuthTokenResponse> {
    const response = await authApi.login(input);
    return response.data.data;
  },

  async register(input: RegisterRequest): Promise<AuthTokenResponse> {
    const response = await authApi.register(input);
    return response.data.data;
  },

  async refresh(): Promise<AuthTokenResponse> {
    const response = await authApi.refresh();
    return {
      accessToken: response.data.data.accessToken,
      user: (await authService.getProfile()),
    };
  },

  async logout(): Promise<void> {
    await authApi.logout();
  },

  async getProfile(): Promise<User> {
    const response = await authApi.getMe();
    return response.data.data.user;
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

  async consumeOAuthTicket(ticket: string): Promise<string> {
    try {
      const response = await authApi.consumeOAuthTicket(ticket);
      return response.data.data.returnPath || '/';
    } catch {
      return '/';
    }
  },

  async forgotPassword(email: string): Promise<string> {
    const response = await authApi.forgotPassword({ email });
    return response.data.message || 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.';
  },

  async requestResetCode(email: string) {
    const response = await authApi.requestResetCode(email);
    return { ...response.data.data, message: response.data.message };
  },

  async verifyResetCode(email: string, code: string): Promise<string> {
    return (await authApi.verifyResetCode(email, code)).data.data.resetToken;
  },

  async resetPasswordWithCode(data: { email: string; code: string; resetToken: string; password: string; confirmPassword: string }): Promise<string> {
    return (await authApi.resetPasswordWithCode(data)).data.message;
  },

  async validateResetToken(token: string, signal?: AbortSignal): Promise<boolean> {
    const response = await authApi.validateResetToken({ token }, signal);
    return Boolean(response.data?.data?.valid);
  },

  async resetPassword(data: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<string> {
    const response = await authApi.resetPassword(data);
    return response.data.message || 'Mật khẩu đã được đặt lại thành công.';
  },
};
