import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

/** Map route path → tên trang (dùng cho breadcrumb title) */
const PAGE_TITLES: Record<string, string> = {
  [ROUTES.ADMIN_DASHBOARD]:    'Dashboard',
  [ROUTES.ADMIN_USERS]:         'Quản lý Người dùng',
  [ROUTES.ADMIN_DESTINATIONS]:  'Quản lý Địa điểm',
  [ROUTES.ADMIN_CATEGORIES]:    'Quản lý Danh mục',
  [ROUTES.ADMIN_REVIEWS]:       'Kiểm duyệt Đánh giá',
};

/**
 * AdminHeader — Topbar cho Admin Dashboard.
 * Hiển thị tên trang hiện tại và thông tin admin đang đăng nhập.
 * Sử dụng trong AdminLayout.
 */
export default function AdminHeader() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const pageTitle = PAGE_TITLES[pathname] ?? 'Admin';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      {/* Page Title */}
      <h1 className="text-base font-semibold text-gray-800">{pageTitle}</h1>

      {/* Admin Info */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
