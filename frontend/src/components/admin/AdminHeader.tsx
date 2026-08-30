import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

/** Map route path → tên trang (dùng cho breadcrumb title) */
const PAGE_TITLES: Record<string, string> = {
  [ROUTES.ADMIN_DASHBOARD]:   'Dashboard Tổng quan',
  [ROUTES.ADMIN_USERS]:        'Quản lý Người dùng',
  [ROUTES.ADMIN_DESTINATIONS]: 'Quản lý Địa điểm',
  [ROUTES.ADMIN_CATEGORIES]:   'Quản lý Danh mục',
  [ROUTES.ADMIN_REVIEWS]:      'Kiểm duyệt Đánh giá',
};

interface AdminHeaderProps {
  /** Called by the hamburger button to open/close the mobile sidebar drawer */
  onMobileMenuToggle?: () => void;
  /** Whether the mobile drawer is currently open */
  mobileMenuOpen?: boolean;
}

/**
 * AdminHeader — Topbar chuẩn hóa cho Admin Dashboard TravelGo.
 *
 * Left:  Mobile hamburger (lg:hidden) + breadcrumb context + real page title.
 * Right: Localized current date (secondary) + admin identity (name, role, avatar).
 *
 * Does not duplicate sidebar account actions. No fake session info,
 * no notification counts, no search box, no unsupported controls.
 */
export default function AdminHeader({
  onMobileMenuToggle,
  mobileMenuOpen = false,
}: AdminHeaderProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const pageTitle = PAGE_TITLES[pathname] ?? 'Quản trị hệ thống';

  // Real localized date — secondary display only
  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <header
      className="h-16 bg-white border-b border-line flex items-center justify-between px-4 sm:px-6 flex-shrink-0 shadow-sm z-20"
      role="banner"
    >
      {/* ── Left: Mobile trigger + Page breadcrumb ────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — visible only below lg */}
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden flex-shrink-0 p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-main-content"
          >
            {mobileMenuOpen ? (
              /* X icon */
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}

        {/* Breadcrumb + Page title */}
        <div className="min-w-0">
          <p className="hidden sm:block text-xs text-stone-400 font-medium leading-none mb-0.5 truncate">
            Quản trị
          </p>
          <h1 className="text-base font-bold text-stone-900 tracking-tight leading-tight truncate">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* ── Right: Date + Admin identity ──────────────────────── */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Current date — secondary, hidden on small screens */}
        <p className="hidden md:block text-xs text-stone-400 font-medium capitalize">
          {today}
        </p>

        {/* Admin identity */}
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-stone-900 leading-tight">
                {user.fullName}
              </p>
              <p className="text-xs font-semibold text-primary-700 leading-none mt-0.5">
                {user.role}
              </p>
            </div>

            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover border border-line flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 border border-primary-200 flex items-center justify-center font-bold text-sm flex-shrink-0 select-none">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
