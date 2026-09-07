import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, USER_ROLES } from '@/constants';
import Loading from '@/components/common/Loading';

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
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
