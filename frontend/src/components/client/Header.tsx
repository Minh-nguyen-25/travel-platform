import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

const ChevronIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate(ROUTES.HOME);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-2 text-sm font-semibold transition-all ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const links = [
    { to: ROUTES.HOME, label: 'Trang chủ', end: true },
    { to: ROUTES.DESTINATIONS, label: 'Khám phá' },
    { to: ROUTES.PREFERENCES, label: 'AI Planner' },
    ...(isAuthenticated
      ? [
          { to: ROUTES.TRIPS, label: 'Chuyến đi' },
          { to: ROUTES.FAVORITES, label: 'Yêu thích' },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="container flex h-full items-center justify-between gap-4">
        <Link to={ROUTES.HOME} className="group flex flex-none items-center gap-2.5 text-gray-900 hover:text-gray-900">
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-md shadow-primary-200 transition group-hover:-rotate-3 group-hover:scale-105">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.35 7-12a7 7 0 10-14 0c0 6.65 7 12 7 12z" />
              <circle cx="12" cy="9" r="2.25" />
            </svg>
          </span>
          <span className="text-base font-extrabold tracking-tight sm:text-lg">
            Travel<span className="text-primary-600">Platform</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>{label}</NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition hover:border-gray-100 hover:bg-gray-50"
                aria-expanded={dropdownOpen}
                aria-label="Mở menu tài khoản"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-sm font-extrabold text-primary-700">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-28 truncate text-sm font-bold text-gray-700 lg:block">{user.fullName}</span>
                <span className="text-gray-400"><ChevronIcon /></span>
              </button>

              {dropdownOpen && (
                <>
                  <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setDropdownOpen(false)} aria-label="Đóng menu" />
                  <div className="trip-modal-enter absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl shadow-gray-200/70">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-bold text-gray-900">{user.fullName}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link to={ROUTES.PROFILE} onClick={() => setDropdownOpen(false)} className="flex px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-700">Tài khoản của tôi</Link>
                    <Link to={ROUTES.TRIPS} onClick={() => setDropdownOpen(false)} className="flex px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-700">Chuyến đi của tôi</Link>
                    {user.role === 'ADMIN' && (
                      <Link to={ROUTES.ADMIN_DASHBOARD} onClick={() => setDropdownOpen(false)} className="flex px-4 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50">Quản trị hệ thống</Link>
                    )}
                    <button type="button" onClick={() => void handleLogout()} className="mt-1 w-full border-t border-gray-100 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Đăng xuất</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to={ROUTES.LOGIN} className="rounded-lg px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-primary-700">Đăng nhập</Link>
              <Link to={ROUTES.REGISTER} className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-200 transition hover:-translate-y-0.5 hover:bg-primary-700 hover:text-white">Đăng ký</Link>
            </div>
          )}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              {menuOpen ? (
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="trip-fade-in border-t border-gray-100 bg-white px-4 py-3 shadow-lg md:hidden">
          <div className="mx-auto flex max-w-container flex-col gap-1">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass} onClick={() => setMenuOpen(false)}>{label}</NavLink>
            ))}
            {!isAuthenticated && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                <Link to={ROUTES.LOGIN} onClick={() => setMenuOpen(false)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-center text-sm font-bold text-gray-700">Đăng nhập</Link>
                <Link to={ROUTES.REGISTER} onClick={() => setMenuOpen(false)} className="rounded-xl bg-primary-600 px-3 py-2.5 text-center text-sm font-bold text-white">Đăng ký</Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
