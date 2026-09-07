import { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi, authService } from '@/services/auth.service';
import { getToken, removeToken, setToken, subscribeToken } from '@/utils/access-token.store';
import type {
  AuthContextType,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from '@/types/auth.types';

export const AuthContext = createContext<AuthContextType | null>(null);

let restorePromise: Promise<void> | null = null;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => getToken());
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const isAuthenticated = user !== null;

  useEffect(() => {
    const unsubscribe = subscribeToken((newToken) => {
      setAccessToken(newToken);
    });
    return unsubscribe;
  }, []);

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
        removeToken();
        setUser(null);
      } finally {
        setIsAuthLoading(false);
        restorePromise = null;
      }
    })();

    return restorePromise;
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

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

  const login = useCallback(async (data: LoginRequest): Promise<User> => {
    const response = await authApi.login(data);
    const { accessToken: token, user: loggedInUser } = response.data.data;

    setToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<User> => {
    const response = await authApi.register(data);
    const { accessToken: token, user: newUser } = response.data.data;

    setToken(token);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Ignore API logout failure
    } finally {
      removeToken();
      setUser(null);
    }
  }, []);

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await authApi.refresh();
      const token = res.data.data.accessToken;
      setToken(token);
      const meRes = await authApi.getMe();
      setUser(meRes.data.data.user);
      return token;
    } catch {
      removeToken();
      setUser(null);
      return null;
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<User> => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    return updated;
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<User> => {
    const updated = await authService.uploadAvatar(file);
    setUser(updated);
    return updated;
  }, []);

  const deleteAvatar = useCallback(async (): Promise<User> => {
    const updated = await authService.deleteAvatar();
    setUser(updated);
    return updated;
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<void> => {
    const session = await authService.changePassword(data);
    if (session.accessToken) {
      setToken(session.accessToken);
    }
    if (session.user) {
      setUser(session.user);
    }
  }, []);

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isAuthLoading,
    isLoading: isAuthLoading,
    login,
    register,
    logout,
    restoreSession,
    refresh,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
