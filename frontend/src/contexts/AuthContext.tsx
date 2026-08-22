import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import axiosClient from '@/api/axiosClient';
import { getToken, removeToken, setToken } from '@/utils/storage.utils';
import type { AuthContextType, LoginRequest, User } from '@/types/auth.types';

// ================================================================
// Context
// ================================================================
export const AuthContext = createContext<AuthContextType | null>(null);

// ================================================================
// Provider
// ================================================================
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Ref để tránh StrictMode double-call loadCurrentUser
  const initialized = useRef(false);

  // ================================================================
  // Derived state
  // ================================================================
  const isAuthenticated = user !== null && accessToken !== null;

  // ================================================================
  // loadCurrentUser — Khôi phục session từ token trong localStorage
  // Gọi 1 lần duy nhất khi app khởi động.
  // ================================================================
  const loadCurrentUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      /**
       * TODO (TV phụ trách Auth): Implement GET /api/v1/users/me
       * API này trả về thông tin user hiện tại dựa trên Bearer Token.
       */
      const response = await axiosClient.get<{ data: User }>('/users/me');
      setUser(response.data.data);
      setAccessToken(token);
    } catch {
      // Token hết hạn hoặc không hợp lệ → clear
      removeToken();
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ================================================================
  // Khởi tạo khi app load
  // ================================================================
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    void loadCurrentUser();
  }, [loadCurrentUser]);

  // ================================================================
  // Lắng nghe sự kiện auth:logout từ Axios interceptor
  // Khi refresh token thất bại, axiosClient dispatch event này.
  // ================================================================
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setAccessToken(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  // ================================================================
  // login — Đăng nhập bằng email/password
  // ================================================================
  const login = useCallback(async (data: LoginRequest): Promise<void> => {
    /**
     * TODO (TV phụ trách Auth): Implement POST /api/v1/auth/login
     * Response phải có format: { success, message, data: { accessToken, user } }
     * Refresh Token được set tự động trong HttpOnly Cookie bởi Backend.
     */
    const response = await axiosClient.post<{ data: { accessToken: string; user: User } }>(
      '/auth/login',
      data,
    );
    const { accessToken: token, user: loggedInUser } = response.data.data;

    setToken(token);
    setAccessToken(token);
    setUser(loggedInUser);
  }, []);

  // ================================================================
  // logout — Đăng xuất
  // ================================================================
  const logout = useCallback(async (): Promise<void> => {
    try {
      /**
       * TODO (TV phụ trách Auth): Implement POST /api/v1/auth/logout
       * Backend xóa Refresh Token Cookie.
       */
      await axiosClient.post('/auth/logout');
    } catch {
      // Bỏ qua lỗi logout (ví dụ: mất mạng) — vẫn clear state local
    } finally {
      removeToken();
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  // ================================================================
  // refresh — Làm mới Access Token
  // ================================================================
  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      /**
       * TODO (TV phụ trách Auth): Implement POST /api/v1/auth/refresh
       * Refresh Token gửi tự động qua HttpOnly Cookie (withCredentials: true).
       * Response: { data: { accessToken } }
       */
      const response = await axiosClient.post<{ data: { accessToken: string } }>('/auth/refresh');
      const newToken = response.data.data.accessToken;

      setToken(newToken);
      setAccessToken(newToken);
      return newToken;
    } catch {
      removeToken();
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, []);

  // ================================================================
  // mockLogin — Giả lập đăng nhập nhanh cho môi trường Dev
  // ================================================================
  const mockLogin = useCallback((role: 'USER' | 'ADMIN' = 'ADMIN') => {
    const mockUser: User = {
      id: 1,
      email: role === 'ADMIN' ? 'admin@travelplatform.vn' : 'user@travelplatform.vn',
      fullName: role === 'ADMIN' ? 'Quản Trị Viên' : 'Nguyễn Văn A',
      avatarUrl: null,
      role,
      isActive: true,
      authProvider: 'LOCAL',
      createdAt: new Date().toISOString(),
    };
    const fakeToken = 'mock_jwt_token_for_dev_mode';
    setToken(fakeToken);
    setAccessToken(fakeToken);
    setUser(mockUser);
  }, []);

  // ================================================================
  // Context value
  // ================================================================
  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refresh,
    mockLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
