import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';
import TravelGoLogo from '@/components/common/TravelGoLogo';

/**
 * Header / Navbar chung cho Client (User) website TravelGo.
 * Đặt trong MainLayout.
 *
 * Nav links:
 * - Home / Destinations / AI Planner (public)
 * - My Trips / Favorites (chỉ khi đã đăng nhập)
 * - Nút Login + Register (chưa đăng nhập)
 * - Avatar dropdown: Profile, Logout, Admin (đã đăng nhập)
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
    `text-sm font-medium transition-colors px-2 py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
      isActive
        ? 'text-primary-700 font-semibold'
        : 'text-stone-600 hover:text-stone-900'
    }`;

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-line shadow-sm">
      <div className="container h-full flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-lg p-0.5"
          aria-label="TravelGo — Về trang chủ"
        >
          <TravelGoLogo variant="dark" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5" aria-label="Điều hướng chính">
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

        {/* Auth Actions / User Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            /* Avatar Dropdown */
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-stone-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="Menu tài khoản người dùng"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-line"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm border border-primary-200">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <svg className="w-4 h-4 text-stone-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-line z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-line bg-stone-50/50">
                      <p className="text-sm font-bold text-stone-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to={ROUTES.PROFILE}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 hover:text-primary-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Tài khoản của tôi
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          to={ROUTES.ADMIN_DASHBOARD}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Quản trị hệ thống
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-line pt-1">
                      <button
                        onClick={() => void handleLogout()}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-error-700 hover:bg-error-50 transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Login / Register Buttons */
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to={ROUTES.LOGIN}
                className="px-3.5 py-2 text-sm font-medium text-stone-700 hover:text-primary-700 transition-colors rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Đăng nhập
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-4 py-2 text-sm font-semibold bg-primary-700 text-white rounded-xl hover:bg-primary-800 active:bg-primary-900 shadow-sm transition-[background-color,box-shadow,transform] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              {menuOpen ? (
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <nav
          className="md:hidden bg-white border-t border-line py-3 px-4 flex flex-col gap-1 shadow-lg animate-in slide-in-from-top-2 duration-150"
          aria-label="Menu di động"
        >
          {[
            { to: ROUTES.HOME, label: 'Trang chủ' },
            { to: ROUTES.DESTINATIONS, label: 'Địa điểm' },
            { to: ROUTES.PREFERENCES, label: 'AI Lập lịch' },
            ...(isAuthenticated
              ? [
                  { to: ROUTES.TRIPS, label: 'Chuyến đi của tôi' },
                  { to: ROUTES.FAVORITES, label: 'Địa điểm yêu thích' },
                  { to: ROUTES.PROFILE, label: 'Hồ sơ cá nhân' },
                  ...(user?.role === 'ADMIN'
                    ? [{ to: ROUTES.ADMIN_DASHBOARD, label: 'Quản trị hệ thống' }]
                    : []),
                ]
              : [
                  { to: ROUTES.LOGIN, label: 'Đăng nhập' },
                  { to: ROUTES.REGISTER, label: 'Đăng ký' },
                ]),
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.HOME}
              className={({ isActive }) =>
                `px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => {
                setMenuOpen(false);
                void handleLogout();
              }}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-error-700 hover:bg-error-50 rounded-xl transition-colors mt-1 border-t border-line pt-2"
            >
              Đăng xuất
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
