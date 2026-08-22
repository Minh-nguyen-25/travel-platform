import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

/**
 * Footer chung cho Client (User) website.
 * Đặt trong MainLayout.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-2 font-bold text-lg text-white hover:text-primary-400 transition-colors mb-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              TravelPlatform
            </Link>
            <p className="text-sm leading-relaxed">
              Khám phá, lên kế hoạch và trải nghiệm hành trình du lịch của bạn với sự hỗ trợ của AI.
            </p>
          </div>

          {/* Khám phá */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Khám phá</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={ROUTES.DESTINATIONS} className="hover:text-white transition-colors">Địa điểm du lịch</Link></li>
              <li><Link to={ROUTES.PREFERENCES} className="hover:text-white transition-colors">AI Lập lịch trình</Link></li>
            </ul>
          </div>

          {/* Tài khoản */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Tài khoản</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to={ROUTES.TRIPS} className="hover:text-white transition-colors">Chuyến đi của tôi</Link></li>
              <li><Link to={ROUTES.FAVORITES} className="hover:text-white transition-colors">Địa điểm yêu thích</Link></li>
              <li><Link to={ROUTES.PROFILE} className="hover:text-white transition-colors">Hồ sơ cá nhân</Link></li>
            </ul>
          </div>

          {/* Thông tin */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Dự án</h4>
            <p className="text-sm leading-relaxed">
              Đồ án môn học — Xây dựng nền tảng Web quản lý thông tin du lịch và đề xuất lịch trình cá nhân hóa.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>© {currentYear} TravelPlatform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
