import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

/**
 * Header / Navbar chung cho Client (User) website.
 * Đặt trong MainLayout.
 *
 * Nav links:
 * - Home / Destinations / AI Planner (public)
 * - My Trips / Favorites (chỉ khi đã đăng nhập)
 * - Nút Login + Register (chưa đăng nhập)
 * - Avatar dropdown: Profile, Logout (đã đăng nhập)
 */
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
    `text-sm font-medium transition-colors px-1 py-0.5 ${
      isActive
        ? 'text-primary-600'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container h-full flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 font-bold text-lg text-primary-600 hover:text-primary-700 flex-shrink-0"
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>TravelPlatform</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to={ROUTES.HOME} end className={navLinkClass}>
            Trang chủ
          </NavLink>
          <NavLink to={ROUTES.DESTINATIONS} className={navLinkClass}>
            Địa điểm
          </NavLink>
          <NavLink to={ROUTES.PREFERENCES} className={navLinkClass}>
            AI Lập lịch
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to={ROUTES.TRIPS} className={navLinkClass}>
                Chuyến đi
              </NavLink>
              <NavLink to={ROUTES.FAVORITES} className={navLinkClass}>
                Yêu thích
              </NavLink>
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            /* Avatar Dropdown */
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to={ROUTES.PROFILE}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Tài khoản của tôi
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        to={ROUTES.ADMIN_DASHBOARD}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Quản trị hệ thống
                      </Link>
                    )}
                    <button
                      onClick={() => void handleLogout()}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Login / Register */
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to={ROUTES.LOGIN}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Mở menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              {menuOpen ? (
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-100 py-3 px-4 flex flex-col gap-1">
          {[
            { to: ROUTES.HOME, label: 'Trang chủ' },
            { to: ROUTES.DESTINATIONS, label: 'Địa điểm' },
            { to: ROUTES.PREFERENCES, label: 'AI Lập lịch' },
            ...(isAuthenticated
              ? [
                  { to: ROUTES.TRIPS, label: 'Chuyến đi' },
                  { to: ROUTES.FAVORITES, label: 'Yêu thích' },
                  { to: ROUTES.PROFILE, label: 'Tài khoản' },
                ]
              : [
                  { to: ROUTES.LOGIN, label: 'Đăng nhập' },
                  { to: ROUTES.REGISTER, label: 'Đăng ký' },
                ]),
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className="px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
