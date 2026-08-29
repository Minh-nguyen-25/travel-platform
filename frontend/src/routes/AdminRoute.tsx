import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, USER_ROLES } from '@/constants';
import Loading from '@/components/common/Loading';

/**
 * AdminRoute — Bảo vệ các route chỉ dành cho Admin.
 *
 * Flow:
 *   isLoading          → Loading
 *   !isAuthenticated   → /login
 *   role !== 'ADMIN'   → / (Unauthorized — user bình thường vào trang admin)
 *   role === 'ADMIN'   → <Outlet />
 *
 * Lưu ý quan trọng:
 *   Frontend guard này chỉ phục vụ UX.
 *   Backend PHẢI luôn kiểm tra: authenticate → requireRole('ADMIN')
 *
 * Cách dùng trong AppRoutes.tsx:
 * ```tsx
 * <Route element={<AdminRoute />}>
 *   <Route path="/admin" element={<AdminLayout />}>
 *     <Route path="dashboard" element={<DashboardPage />} />
 *   </Route>
 * </Route>
 * ```
 */
export default function AdminRoute() {
  const { isAuthenticated, isAuthLoading, user } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <Loading fullPage message="Đang kiểm tra quyền truy cập..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (user?.role !== USER_ROLES.ADMIN) {
    // Đã đăng nhập nhưng không phải ADMIN → về trang chủ
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
