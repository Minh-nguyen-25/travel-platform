import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export default function Footer() {
  return (
    <footer className="mt-auto overflow-hidden bg-gray-900 text-gray-400">
      <div className="container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1fr]">
          <div>
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 text-lg font-extrabold text-white hover:text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.35 7-12a7 7 0 10-14 0c0 6.65 7 12 7 12z" />
                  <circle cx="12" cy="9" r="2.25" />
                </svg>
              </span>
              TravelPlatform
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6">
              Khám phá, lên kế hoạch và lưu giữ những hành trình đáng nhớ theo cách của riêng bạn.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Khám phá</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to={ROUTES.DESTINATIONS} className="text-gray-400 hover:text-white">Địa điểm nổi bật</Link></li>
              <li><Link to={ROUTES.PREFERENCES} className="text-gray-400 hover:text-white">AI lập lịch trình</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Hành trình</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to={ROUTES.TRIPS} className="text-gray-400 hover:text-white">Chuyến đi của tôi</Link></li>
              <li><Link to={ROUTES.FAVORITES} className="text-gray-400 hover:text-white">Địa điểm yêu thích</Link></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-800/40 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-300">Sẵn sàng lên đường?</p>
            <p className="mt-2 text-sm leading-6 text-gray-300">Biến ý tưởng tiếp theo thành một lịch trình thật dễ theo dõi.</p>
            <Link to={ROUTES.TRIPS} className="mt-4 inline-flex text-sm font-bold text-white hover:text-primary-300">Bắt đầu lập kế hoạch →</Link>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-gray-800 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TravelPlatform. All rights reserved.</p>
          <p>Được tạo cho những hành trình đáng nhớ.</p>
        </div>
      </div>
    </footer>
  );
}
