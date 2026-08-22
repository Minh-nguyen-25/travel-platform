import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { AuthContextType } from '@/types/auth.types';

/**
 * Hook truy cập AuthContext.
 *
 * Cách dùng:
 * ```tsx
 * const { user, isAuthenticated, isLoading, login, logout } = useAuth();
 * ```
 *
 * @throws Error nếu dùng ngoài <AuthProvider>
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }

  return context;
}
