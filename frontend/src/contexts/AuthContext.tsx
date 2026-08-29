import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { getToken, removeToken, setToken } from '@/utils/storage.utils';
import type {
  AuthContextType,
  AuthTokenResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '@/types/auth.types';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const clearSession = useCallback((): void => {
    removeToken();
    setAccessToken(null);
    setUser(null);
  }, []);

  const applySession = useCallback((session: AuthTokenResponse): void => {
    setToken(session.accessToken);
    setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  const loadCurrentUser = useCallback(async (): Promise<void> => {
    try {
      const storedToken = getToken();
      if (!storedToken) {
        applySession(await authService.refresh());
        return;
      }

      const currentUser = await authService.getProfile();
      setUser(currentUser);
      setAccessToken(getToken() ?? storedToken);
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    void loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    const handleForceLogout = () => clearSession();
    const handleTokenRefresh = (event: Event) => {
      setAccessToken((event as CustomEvent<string>).detail);
    };

    window.addEventListener('auth:logout', handleForceLogout);
    window.addEventListener('auth:token-refreshed', handleTokenRefresh);
    return () => {
      window.removeEventListener('auth:logout', handleForceLogout);
      window.removeEventListener('auth:token-refreshed', handleTokenRefresh);
    };
  }, [clearSession]);

  const login = useCallback(async (data: LoginRequest): Promise<void> => {
    applySession(await authService.login(data));
  }, [applySession]);

  const register = useCallback(async (data: RegisterRequest): Promise<void> => {
    applySession(await authService.register(data));
  }, [applySession]);

  const completeGoogleLogin = useCallback(async (token: string): Promise<void> => {
    setToken(token);
    setAccessToken(token);
    try {
      setUser(await authService.getProfile());
    } catch (error) {
      clearSession();
      throw error;
    }
  }, [clearSession]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const session = await authService.refresh();
      applySession(session);
      return session.accessToken;
    } catch {
      clearSession();
      return null;
    }
  }, [applySession, clearSession]);

  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<User> => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<User> => {
    const updatedUser = await authService.uploadAvatar(file);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const deleteAvatar = useCallback(async (): Promise<User> => {
    const updatedUser = await authService.deleteAvatar();
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<void> => {
    applySession(await authService.changePassword(data));
  }, [applySession]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    accessToken,
    isAuthenticated: user !== null && accessToken !== null,
    isLoading,
    login,
    register,
    completeGoogleLogin,
    logout,
    refresh,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    changePassword,
  }), [
    accessToken,
    changePassword,
    completeGoogleLogin,
    deleteAvatar,
    isLoading,
    login,
    logout,
    refresh,
    register,
    updateProfile,
    uploadAvatar,
    user,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
