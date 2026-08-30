import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import TravelGoLogo from '@/components/common/TravelGoLogo';

/**
 * Footer chung cho Client (User) website TravelGo.
 * Đặt trong MainLayout.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 mt-auto">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1 space-y-4">
            <Link
              to={ROUTES.HOME}
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg p-0.5"
              aria-label="TravelGo — Về trang chủ"
            >
              <TravelGoLogo variant="light" />
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              Nền tảng du lịch thông minh hỗ trợ khám phá, lên kế hoạch và trải nghiệm các điểm đến Việt Nam cùng công nghệ AI.
            </p>
          </div>

          {/* Khám phá */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Khám phá
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to={ROUTES.DESTINATIONS}
                  className="text-stone-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
                >
                  Địa điểm du lịch
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.PREFERENCES}
                  className="text-stone-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
                >
                  AI Lập lịch trình
                </Link>
              </li>
            </ul>
          </div>

          {/* Tài khoản */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Tài khoản
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to={ROUTES.TRIPS}
                  className="text-stone-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
                >
                  Chuyến đi của tôi
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.FAVORITES}
                  className="text-stone-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
                >
                  Địa điểm yêu thích
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.PROFILE}
                  className="text-stone-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
                >
                  Hồ sơ cá nhân
                </Link>
              </li>
            </ul>
          </div>

          {/* Dự án */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Dự án
            </h4>
            <p className="text-sm text-stone-400 leading-relaxed">
              Đồ án môn học — Xây dựng nền tảng Web quản lý thông tin du lịch và đề xuất lịch trình cá nhân hóa.
            </p>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-stone-800/80 mt-12 pt-8 text-center text-xs text-stone-500">
          <p>© {currentYear} TravelGo. Nền tảng du lịch thông minh Việt Nam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
