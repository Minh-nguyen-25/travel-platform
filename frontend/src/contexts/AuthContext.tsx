import { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/services/auth.service';
import { getToken, removeToken, setToken, subscribeToken } from '@/utils/access-token.store';
import type {
  AuthContextType,
  LoginRequest,
  RegisterRequest,
  User,
} from '@/types/auth.types';

// ================================================================
// Context
// ================================================================
export const AuthContext = createContext<AuthContextType | null>(null);

// ================================================================
// Single-flight restorePromise (Module-level)
// Tránh gọi trùng lặp /auth/refresh khi React StrictMode chạy effect 2 lần.
// Sẽ được reset về null khi quá trình restore hoàn tất.
// ================================================================
let restorePromise: Promise<void> | null = null;

// ================================================================
// Provider
// ================================================================
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // Khởi tạo accessToken từ in-memory store (không đọc từ localStorage)
  const [accessToken, setAccessToken] = useState<string | null>(() => getToken());
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // ================================================================
  // Derived state — isAuthenticated dựa trên sự tồn tại của user object
  // ================================================================
  const isAuthenticated = user !== null;

  // ================================================================
  // Đăng ký đồng bộ với in-memory token store
  // Khi interceptor refresh token hoặc removeToken, state React tự cập nhật.
  // ================================================================
  useEffect(() => {
    const unsubscribe = subscribeToken((newToken) => {
      setAccessToken(newToken);
    });
    return unsubscribe;
  }, []);

  // ================================================================
  // restoreSession — Khôi phục session an toàn khi app khởi động
  // Gọi /auth/refresh với HttpOnly cookie → nếu thành công lưu token vào RAM
  // → gọi /auth/me để lấy user data.
  // ================================================================
  const restoreSession = useCallback(async (): Promise<void> => {
    if (restorePromise) {
      return restorePromise;
    }

    restorePromise = (async () => {
      try {
        const refreshRes = await authApi.refresh();
        const newAccessToken = refreshRes.data.data.accessToken;
        setToken(newAccessToken);

        const meRes = await authApi.getMe();
        setUser(meRes.data.data.user);
      } catch {
        // Chưa có cookie hoặc cookie không hợp lệ → giữ trạng thái guest sạch
        removeToken();
        setUser(null);
      } finally {
        setIsAuthLoading(false);
        restorePromise = null;
      }
    })();

    return restorePromise;
  }, []);

  // Khởi tạo khôi phục session khi mount
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  // ================================================================
  // Lắng nghe sự kiện auth:logout từ Axios interceptor khi refresh token thất bại
  // ================================================================
  useEffect(() => {
    const handleForceLogout = () => {
      removeToken();
      setUser(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, []);

  // ================================================================
  // login — Đăng nhập bằng email/password
  // ================================================================
  const login = useCallback(async (data: LoginRequest): Promise<User> => {
    const response = await authApi.login(data);
    const { accessToken: token, user: loggedInUser } = response.data.data;

    setToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // ================================================================
  // register — Đăng ký tài khoản người dùng mới
  // ================================================================
  const register = useCallback(async (data: RegisterRequest): Promise<User> => {
    const response = await authApi.register(data);
    const { accessToken: token, user: newUser } = response.data.data;

    setToken(token);
    setUser(newUser);
    return newUser;
  }, []);

  // ================================================================
  // logout — Đăng xuất
  // Luôn dọn dẹp state trong finally bất kể API thành công hay lỗi mạng
  // ================================================================
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Bỏ qua lỗi API logout (ví dụ: mất mạng hoặc server lỗi)
    } finally {
      removeToken();
      setUser(null);
    }
  }, []);

  // ================================================================
  // Context value
  // ================================================================
  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isAuthLoading,
    login,
    register,
    logout,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
