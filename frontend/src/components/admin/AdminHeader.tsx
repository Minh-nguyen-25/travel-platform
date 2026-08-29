import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

const pageMeta: Record<string, { title: string; description: string }> = {
  [ROUTES.ADMIN_DASHBOARD]: { title: 'Tổng quan', description: 'Theo dõi sức khỏe và tăng trưởng hệ thống' },
  [ROUTES.ADMIN_USERS]: { title: 'Người dùng', description: 'Quản lý tài khoản và quyền truy cập' },
  [ROUTES.ADMIN_DESTINATIONS]: { title: 'Địa điểm', description: 'Quản lý nội dung điểm đến' },
  [ROUTES.ADMIN_CATEGORIES]: { title: 'Danh mục', description: 'Tổ chức danh mục du lịch' },
  [ROUTES.ADMIN_REVIEWS]: { title: 'Đánh giá', description: 'Kiểm duyệt nội dung cộng đồng' },
};

export default function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = pageMeta[pathname] ?? { title: 'Quản trị', description: 'TravelPlatform Admin' };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="relative z-30 flex h-[72px] flex-none items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6 xl:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onOpenSidebar} className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="Mở menu quản trị">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-black text-slate-900 sm:text-lg">{meta.title}</h1>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{meta.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
          Hệ thống ổn định
        </div>
        <div className="relative">
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition hover:border-slate-200 hover:bg-slate-50" aria-expanded={menuOpen}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-blue-700">{user?.fullName.charAt(0).toUpperCase() ?? 'A'}</span>
            )}
            <div className="hidden max-w-36 text-left sm:block">
              <p className="truncate text-xs font-extrabold text-slate-800">{user?.fullName}</p>
              <p className="text-[10px] font-semibold text-slate-400">ADMIN</p>
            </div>
            <svg className="hidden h-4 w-4 text-slate-400 sm:block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.3 7.3a1 1 0 0 1 1.4 0l3.3 3.3 3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" clipRule="evenodd" /></svg>
          </button>
          {menuOpen && (
            <>
              <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} aria-label="Đóng menu tài khoản" />
              <div className="trip-modal-enter absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1.5 shadow-xl shadow-slate-200/70">
                <div className="border-b border-slate-100 px-4 py-3 sm:hidden">
                  <p className="truncate text-sm font-bold text-slate-900">{user?.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
                <Link to={ROUTES.PROFILE} onClick={() => setMenuOpen(false)} className="flex px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hồ sơ cá nhân</Link>
                <Link to={ROUTES.HOME} onClick={() => setMenuOpen(false)} className="flex px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Về trang chính</Link>
                <button type="button" onClick={() => void handleLogout()} className="mt-1 w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50">Đăng xuất</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
