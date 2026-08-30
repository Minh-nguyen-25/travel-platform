import { ROUTES } from '@/constants';

/**
 * DashboardPage — Trang tổng quan quản trị (Admin Dashboard).
 *
 * Dữ liệu thực sẽ được kết nối sau khi Analytics API hoàn thành (TV5).
 * Mọi ô số liệu hiển thị "—" cho đến khi có dữ liệu thực từ backend.
 */
export default function DashboardPage() {
  // ── Stat card definitions ─────────────────────────────────────────────
  // 4 uniform summary cards with consistent surface, border, and hierarchy.
  const stats = [
    {
      label: 'Tổng người dùng',
      value: '—',
      note: 'Chưa kết nối dữ liệu',
      iconBg: 'bg-stone-100 text-stone-600',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      label: 'Tổng địa điểm',
      value: '—',
      note: 'Chưa kết nối',
      iconBg: 'bg-teal-50 text-teal-700',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: 'Danh mục',
      value: '—',
      note: 'Chưa kết nối',
      iconBg: 'bg-stone-100 text-stone-600',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        </svg>
      ),
    },
    {
      label: 'Đánh giá',
      value: '—',
      note: 'Chưa kết nối',
      iconBg: 'bg-stone-100 text-stone-600',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
    },
  ];

  // ── Quick nav links ───────────────────────────────────────────────────
  const quickLinks = [
    {
      to: ROUTES.ADMIN_USERS,
      label: 'Quản lý Người dùng',
      description: 'Xem và phân quyền tài khoản',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      to: ROUTES.ADMIN_DESTINATIONS,
      label: 'Quản lý Địa điểm',
      description: 'Thêm, sửa, xóa điểm đến',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      to: ROUTES.ADMIN_CATEGORIES,
      label: 'Quản lý Danh mục',
      description: 'Phân loại điểm đến',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        </svg>
      ),
    },
    {
      to: ROUTES.ADMIN_REVIEWS,
      label: 'Kiểm duyệt Đánh giá',
      description: 'Duyệt & ẩn bình luận',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-1">
            TravelGo Admin
          </p>
          <h2 className="text-2xl font-bold text-stone-900 leading-tight">
            Tổng quan hệ thống
          </h2>
          <p className="text-sm text-stone-500 mt-1 leading-relaxed">
            Quản lý địa điểm, người dùng, danh mục và đánh giá trong nền tảng TravelGo.
          </p>
        </div>
      </div>

      {/* ── Stat cards: 4 uniform summary cards ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-line shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[140px]"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
              {stat.icon}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-stone-500">{stat.label}</p>
              <p className="text-2xl font-bold text-stone-900 mt-0.5">{stat.value}</p>
              <p className="text-[11px] text-stone-400 mt-1">{stat.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom: Destinations panel + Quick links ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

        {/* Destinations panel — data not yet available */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <h3 className="text-sm font-bold text-stone-900">Địa điểm du lịch</h3>
            <span className="text-xs text-stone-400 font-medium">Chờ kết nối API</span>
          </div>

          {/* Honest empty state while data is unavailable */}
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-stone-700 mb-1">Dữ liệu chưa sẵn sàng</p>
            <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
              Danh sách địa điểm sẽ hiển thị ở đây sau khi API Destinations được kết nối.
            </p>
          </div>
        </div>

        {/* Quick navigation links */}
        <div className="bg-white rounded-2xl border border-line shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="text-sm font-bold text-stone-900">Lối tắt quản lý</h3>
          </div>

          <div className="flex-1 p-3 flex flex-col gap-1">
            {quickLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-line"
              >
                <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-500 group-hover:bg-primary-50 group-hover:text-primary-600 flex items-center justify-center flex-shrink-0 transition-colors">
                  {link.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-800 group-hover:text-primary-700 truncate transition-colors">
                    {link.label}
                  </p>
                  <p className="text-xs text-stone-400 truncate">{link.description}</p>
                </div>
                <svg
                  className="w-4 h-4 text-stone-300 group-hover:text-primary-500 flex-shrink-0 transition-colors"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Developer notice — DEV build only ─────────────────────── */}
      {import.meta.env.DEV && (
        <p className="text-[11px] text-stone-400 text-center">
          ⓘ Môi trường phát triển — Số liệu thực sẽ kết nối sau khi API Analytics hoàn thành (TV5).
        </p>
      )}
    </div>
  );
}
