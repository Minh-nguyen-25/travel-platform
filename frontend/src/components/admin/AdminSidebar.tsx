import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const iconClass = 'h-5 w-5';
const navItems: NavItem[] = [
  {
    to: ROUTES.ADMIN_DASHBOARD,
    label: 'Tổng quan',
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></svg>,
  },
  {
    to: ROUTES.ADMIN_USERS,
    label: 'Người dùng',
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" /></svg>,
  },
  {
    to: ROUTES.ADMIN_DESTINATIONS,
    label: 'Địa điểm',
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>,
  },
  {
    to: ROUTES.ADMIN_CATEGORIES,
    label: 'Danh mục',
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 17.5h7M17.5 14v7" strokeLinecap="round" /></svg>,
  },
  {
    to: ROUTES.ADMIN_REVIEWS,
    label: 'Đánh giá',
    icon: <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3 2.8 5.67 6.2.9-4.5 4.38 1.06 6.18L12 17.2l-5.56 2.93 1.06-6.18L3 9.57l6.2-.9L12 3Z" strokeLinejoin="round" /></svg>,
  },
];

export default function AdminSidebar({
  mobileOpen,
  collapsed,
  onCloseMobile,
  onToggleCollapsed,
}: AdminSidebarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          aria-label="Đóng menu quản trị"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-none flex-col bg-slate-950 text-slate-300 shadow-2xl transition-all duration-300 lg:relative lg:z-auto lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[84px]' : 'lg:w-72'}`}
      >
        <div className={`flex h-[72px] flex-none items-center border-b border-white/10 ${collapsed ? 'lg:justify-center lg:px-3' : 'justify-between px-5'}`}>
          <NavLink to={ROUTES.ADMIN_DASHBOARD} className="flex min-w-0 items-center gap-3 text-white hover:text-white" onClick={onCloseMobile}>
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-950/40">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 21s7-5.35 7-12a7 7 0 1 0-14 0c0 6.65 7 12 7 12Z" /><circle cx="12" cy="9" r="2" /></svg>
            </span>
            <span className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <span className="block truncate text-sm font-black tracking-tight">TravelPlatform</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">Admin Console</span>
            </span>
          </NavLink>
          <button type="button" onClick={onCloseMobile} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Đóng menu">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          <p className={`mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 ${collapsed ? 'lg:text-center lg:text-[0]' : ''}`}>
            {collapsed ? <span className="hidden lg:inline">•••</span> : 'Quản lý hệ thống'}
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30'
                  : 'text-slate-400 hover:bg-white/[0.07] hover:text-white'
              } ${collapsed ? 'lg:justify-center' : ''}`}
            >
              <span className="flex-none">{item.icon}</span>
              <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className={`mb-2 flex items-center gap-3 rounded-xl bg-white/[0.05] p-3 ${collapsed ? 'lg:justify-center lg:p-2' : ''}`}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-9 w-9 flex-none rounded-xl object-cover" />
            ) : (
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-blue-500/20 text-sm font-black text-blue-300">
                {user?.fullName.charAt(0).toUpperCase() ?? 'A'}
              </span>
            )}
            <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-xs font-bold text-white">{user?.fullName}</p>
              <p className="truncate text-[10px] text-slate-500">Quản trị viên</p>
            </div>
          </div>
          <NavLink to={ROUTES.HOME} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-400 hover:bg-white/[0.07] hover:text-white ${collapsed ? 'lg:justify-center' : ''}`} title="Về trang chính">
            <svg className="h-5 w-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6" strokeLinejoin="round" /></svg>
            <span className={collapsed ? 'lg:hidden' : ''}>Về trang chính</span>
          </NavLink>
          <button type="button" onClick={() => void handleLogout()} className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 ${collapsed ? 'lg:justify-center' : ''}`} title="Đăng xuất">
            <svg className="h-5 w-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className={collapsed ? 'lg:hidden' : ''}>Đăng xuất</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="absolute -right-3 top-24 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:text-primary-600 lg:flex"
          aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          <svg className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.7 5.3a1 1 0 0 1 0 1.4L9.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 0 1 1.4 0Z" clipRule="evenodd" /></svg>
        </button>
      </aside>
    </>
  );
}
