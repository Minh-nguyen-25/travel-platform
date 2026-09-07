import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import TripIcon from '@/components/trip/TripIcon';
import TravelGoLogo from '@/components/common/TravelGoLogo';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === ROUTES.HOME;
  const transparent = isHome && !scrolled && !menuOpen;

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate(ROUTES.HOME);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    const idle = transparent
      ? 'text-white/82 hover:bg-white/10 hover:text-white'
      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-800';
    const active = transparent
      ? 'bg-white/14 text-white shadow-sm'
      : 'bg-primary-50 text-primary-800';
    return `relative rounded-full px-3.5 py-2 text-[0.82rem] font-bold transition-all duration-300 ${isActive ? active : idle}`;
  };

  const links = [
    { to: ROUTES.HOME, label: 'Trang chủ', end: true },
    { to: ROUTES.DESTINATIONS, label: 'Khám phá' },
    { to: ROUTES.PREFERENCES, label: 'AI Planner' },
    ...(isAuthenticated
      ? [
          { to: ROUTES.AI_CHAT, label: 'AI Chat' },
          { to: ROUTES.TRIPS, label: 'Chuyến đi' },
          { to: ROUTES.FAVORITES, label: 'Yêu thích' },
        ]
      : []),
  ];

  return (
    <header
      className={`${isHome ? 'fixed' : 'sticky'} inset-x-0 top-0 z-40 h-[72px] border-b transition-all duration-500 ${
        transparent
          ? 'border-transparent bg-transparent'
          : 'border-white/70 bg-sand-50/90 shadow-[0_10px_35px_rgba(7,28,44,0.07)] backdrop-blur-xl'
      }`}
    >
      <div className="container flex h-full items-center justify-between gap-4">
        <Link
          to={ROUTES.HOME}
          aria-label="TravelGo - Trang chủ"
        >
          <TravelGoLogo
            variant={transparent ? 'light' : 'dark'}
            showTagline={false}
            className="transition-opacity hover:opacity-85"
          />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full md:flex" aria-label="Điều hướng chính">
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
                className={`flex items-center gap-2 rounded-2xl border p-1.5 transition ${
                  transparent
                    ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
                    : 'border-transparent text-gray-700 hover:border-gray-100 hover:bg-white'
                }`}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                aria-label="Mở menu tài khoản"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-xl object-cover" />
                ) : (
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-extrabold ${transparent ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-800'}`}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-28 truncate text-xs font-bold lg:block">{user.fullName}</span>
                <TripIcon name="chevron-down" size={14} className="opacity-65" />
              </button>

              {dropdownOpen && (
                <>
                  <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setDropdownOpen(false)} aria-label="Đóng menu" />
                  <div className="trip-modal-enter absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-white bg-white/95 py-1.5 text-gray-700 shadow-float backdrop-blur-xl" role="menu">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-bold text-gray-900">{user.fullName}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link to={ROUTES.PROFILE} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-800" role="menuitem"><TripIcon name="users" size={15} />Tài khoản của tôi</Link>
                    <Link to={ROUTES.TRIPS} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-800" role="menuitem"><TripIcon name="suitcase" size={15} />Chuyến đi của tôi</Link>
                    {user.role === 'ADMIN' && (
                      <Link to={ROUTES.ADMIN_DASHBOARD} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-primary-800 hover:bg-primary-50" role="menuitem"><TripIcon name="compass" size={15} />Quản trị hệ thống</Link>
                    )}
                    <button type="button" onClick={() => void handleLogout()} className="mt-1 w-full border-t border-gray-100 px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50" role="menuitem">Đăng xuất</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Link to={ROUTES.LOGIN} className={`rounded-xl px-3 py-2 text-sm font-bold ${transparent ? 'text-white hover:bg-white/10 hover:text-white' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-800'}`}>Đăng nhập</Link>
              <Link to={ROUTES.REGISTER} className={`rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 ${transparent ? 'bg-white text-navy-900 hover:bg-primary-50 hover:text-navy-900' : 'bg-primary-600 text-white shadow-primary-900/15 hover:bg-primary-700 hover:text-white'}`}>Đăng ký</Link>
            </div>
          )}

          <button
            type="button"
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition md:hidden ${transparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-primary-50'}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menuOpen}
          >
            <TripIcon name={menuOpen ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="trip-fade-in border-t border-white/70 bg-sand-50/95 px-4 py-3 shadow-float backdrop-blur-xl md:hidden" aria-label="Điều hướng di động">
          <div className="mx-auto flex max-w-container flex-col gap-1">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `rounded-xl px-3.5 py-3 text-sm font-bold ${isActive ? 'bg-primary-100 text-primary-900' : 'text-gray-700 hover:bg-primary-50'}`}>{label}</NavLink>
            ))}
            {!isAuthenticated && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                <Link to={ROUTES.LOGIN} className="rounded-xl border border-gray-200 px-3 py-2.5 text-center text-sm font-bold text-gray-700">Đăng nhập</Link>
                <Link to={ROUTES.REGISTER} className="rounded-xl bg-primary-600 px-3 py-2.5 text-center text-sm font-bold text-white hover:text-white">Đăng ký</Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
