import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import Loading from '@/components/common/Loading';

/**
 * ProtectedRoute — Bảo vệ các route yêu cầu đăng nhập.
 *
 * Flow:
 *   isLoading  → Hiển thị Loading (tránh flash redirect khi app mới khởi động)
 *   !isAuthenticated → Redirect /login (giữ location hiện tại để redirect về sau)
 *   isAuthenticated → Render <Outlet /> (trang được bảo vệ)
 *
 * Lưu ý quan trọng:
 *   Frontend route guard này chỉ phục vụ UX.
 *   Backend PHẢI kiểm tra authenticate middleware ở tất cả protected endpoints.
 *
 * Cách dùng trong AppRoutes.tsx:
 * ```tsx
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/profile" element={<ProfilePage />} />
 *   <Route path="/trips" element={<TripsPage />} />
 * </Route>
 * ```
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Đang kiểm tra session ban đầu → hiển thị loading tránh flash
  if (isLoading) {
    return <Loading fullPage message="Đang kiểm tra đăng nhập..." />;
  }

  // Chưa đăng nhập → redirect login, giữ path hiện tại để redirect về sau
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
