import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loading from '@/components/common/Loading';
import { ROUTES, USER_ROLES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

export default function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullPage message="Đang kiểm tra quyền quản trị..." />;
  }
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }
  if (user?.role !== USER_ROLES.ADMIN) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <Outlet />;
}
