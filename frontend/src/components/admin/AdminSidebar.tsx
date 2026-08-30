import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import TravelGoLogo from '@/components/common/TravelGoLogo';
import { useState } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    to: ROUTES.ADMIN_DASHBOARD,
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5 shrink-0 text-current" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_USERS,
    label: 'Người dùng',
    icon: (
      <svg className="w-5 h-5 shrink-0 text-current" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_DESTINATIONS,
    label: 'Địa điểm',
    icon: (
      <svg className="w-5 h-5 shrink-0 text-current" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_CATEGORIES,
    label: 'Danh mục',
    icon: (
      <svg className="w-5 h-5 shrink-0 text-current" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_REVIEWS,
    label: 'Đánh giá',
    icon: (
      <svg className="w-5 h-5 shrink-0 text-current" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
  },
];

interface AdminSidebarProps {
  /** Whether the mobile overlay drawer is open */
  mobileOpen: boolean;
  /** Called when sidebar wants to close (e.g., user clicks a nav link on mobile) */
  onCloseMobile: () => void;
}

/**
 * AdminSidebar — Menu điều hướng chuẩn hóa cho Admin Dashboard TravelGo.
 *
 * Cấu trúc:
 * - Logo/Header ở trên cùng
 * - Điều hướng chính trong khu vực flex-1 (khoảng cách và padding cân đối, không dồn sát mép trên)
 * - "Về trang chủ" và "Đăng xuất" neo chắc chắn tại footer dưới đáy
 * - Nút thu gọn (collapse button) định vị tại tâm dọc (top-1/2) của toàn bộ Sidebar
 * - Kiểu chữ hiển thị đầy đủ dấu tiếng Việt (leading-6, whitespace-nowrap)
 */
export default function AdminSidebar({ mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    onCloseMobile();
    await logout();
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    const base =
      'relative flex items-center min-h-[48px] h-12 px-3.5 rounded-xl transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 select-none';

    if (collapsed) {
      return isActive
        ? `${base} justify-center bg-primary-700 text-white shadow-sm font-semibold hover:bg-primary-700/90 hover:text-white`
        : `${base} justify-center text-stone-300 hover:bg-stone-800 hover:text-white font-medium`;
    }

    return isActive
      ? `${base} gap-3.5 bg-primary-700 text-white shadow-sm font-semibold hover:bg-primary-700/90 hover:text-white`
      : `${base} gap-3.5 text-stone-300 hover:bg-stone-800 hover:text-white font-medium`;
  };

  return (
    <>
      <aside
        className={[
          // Shared structural classes
          'relative flex flex-col h-screen flex-shrink-0 z-50 overflow-visible',
          'bg-gradient-to-b from-stone-950 via-stone-900 to-[#0c2824]',
          'text-stone-300 border-r border-stone-800/60',
          'transition-[width,transform] duration-200',
          // Width
          collapsed ? 'w-16' : 'w-64',
          // Mobile: fixed overlay, hidden by default, slides in when mobileOpen
          'fixed inset-y-0 left-0 lg:relative lg:inset-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        aria-label="Menu điều hướng quản trị"
      >
        {/* ── 1. Brand Header ───────────────────────────────────── */}
        <div
          className={`h-16 flex items-center border-b border-stone-800/60 flex-shrink-0 px-3.5 ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="flex items-center gap-2 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg"
            aria-label="TravelGo Admin — Dashboard"
            onClick={onCloseMobile}
          >
            <div className="flex-shrink-0">
              <TravelGoLogo variant="light" iconOnly={collapsed} showTagline={false} />
            </div>
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-teal-300 px-1.5 py-0.5 rounded border border-stone-700 whitespace-nowrap flex-shrink-0">
                Admin
              </span>
            )}
          </Link>
        </div>

        {/* ── 2. Primary Navigation Region ──────────────────────── */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <nav
            className="pt-5 pb-4 px-2.5 flex flex-col gap-2"
            aria-label="Menu chức năng quản trị"
          >
            {/* Section label — only when expanded */}
            {!collapsed && (
              <p className="px-3.5 pb-1 text-xs font-semibold uppercase tracking-wider text-stone-400 select-none">
                Điều hướng
              </p>
            )}

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getNavLinkClass}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {/* Absolutely-positioned active indicator bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-400 rounded-r-full"
                        aria-hidden="true"
                      />
                    )}
                    <div className="w-6 h-6 shrink-0 flex items-center justify-center" aria-hidden="true">
                      {item.icon}
                    </div>
                    {!collapsed && (
                      <span className="text-[17px] leading-6 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ── 3. Footer: Secondary Actions (Home + Logout) ──────── */}
        <footer className="shrink-0 border-t border-stone-800/60 p-2.5 pb-3 flex flex-col gap-1.5">
          <NavLink
            to={ROUTES.HOME}
            onClick={onCloseMobile}
            className={`relative flex items-center min-h-[48px] h-12 px-3.5 rounded-xl transition-colors duration-150 text-stone-300 hover:bg-stone-800 hover:text-white font-medium select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
              collapsed ? 'justify-center' : 'gap-3.5'
            }`}
            title={collapsed ? 'Về trang chủ' : undefined}
            aria-label={collapsed ? 'Về trang chủ' : undefined}
          >
            <div className="w-6 h-6 shrink-0 flex items-center justify-center" aria-hidden="true">
              <svg className="w-5 h-5 shrink-0 text-current" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            {!collapsed && (
              <span className="text-[17px] leading-6 whitespace-nowrap">
                Về trang chủ
              </span>
            )}
          </NavLink>

          <button
            onClick={() => void handleLogout()}
            className={`relative flex items-center min-h-[48px] h-12 px-3.5 rounded-xl transition-colors duration-150 text-rose-300 hover:bg-rose-950/40 hover:text-rose-100 font-medium select-none w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
              collapsed ? 'justify-center' : 'gap-3.5'
            }`}
            title={collapsed ? 'Đăng xuất' : undefined}
            aria-label={collapsed ? 'Đăng xuất' : undefined}
          >
            <div className="w-6 h-6 shrink-0 flex items-center justify-center" aria-hidden="true">
              <svg className="w-5 h-5 shrink-0 text-current" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </div>
            {!collapsed && (
              <span className="text-[17px] leading-6 whitespace-nowrap">
                Đăng xuất
              </span>
            )}
          </button>
        </footer>

        {/* ── 4. Desktop collapse toggle (vertically centered on full sidebar height) ── */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex absolute right-0 top-1/2 z-30 h-9 w-9 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-stone-800 border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-700 shadow-md transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Mở rộng menu' : 'Thu nhỏ menu'}
        >
          <svg
            className={`h-4 w-4 block shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : 'rotate-0'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </aside>
    </>
  );
}
