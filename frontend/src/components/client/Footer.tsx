import { Link } from 'react-router-dom';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';

const footerLinks = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Điểm đến Việt Nam', to: ROUTES.DESTINATIONS },
      { label: 'AI Travel Planner', to: ROUTES.PREFERENCES },
      { label: 'Địa điểm yêu thích', to: ROUTES.FAVORITES },
    ],
  },
  {
    title: 'Hành trình',
    links: [
      { label: 'Chuyến đi của tôi', to: ROUTES.TRIPS },
      { label: 'Tạo tài khoản', to: ROUTES.REGISTER },
      { label: 'Hồ sơ cá nhân', to: ROUTES.PROFILE },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-navy-950 text-white">
      <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="container relative pt-16 sm:pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.35fr_0.65fr_0.65fr_1.1fr]">
          <div>
            <Link to={ROUTES.HOME} className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-white hover:text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 text-white shadow-lg shadow-navy-950/40">
                <TripIcon name="compass" size={22} />
              </span>
              TravelPlatform
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/58">
              Nền tảng khám phá Việt Nam, lưu giữ cảm hứng và biến những điểm đến mơ ước thành hành trình rõ ràng.
            </p>
            <p className="accent-script mt-5 text-3xl text-primary-200">Đi xa theo cách của bạn.</p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h2 className="font-sans text-xs font-extrabold uppercase tracking-[0.18em] text-white">{group.title}</h2>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="group inline-flex items-center gap-2 text-sm text-white/58 hover:text-primary-200">
                      <span className="h-px w-0 bg-primary-300 transition-all duration-300 group-hover:w-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
            <span className="eyebrow text-accent-300"><TripIcon name="sparkles" size={14} />Bắt đầu từ đây</span>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white">Chuyến đi tiếp theo đang chờ bạn đặt tên.</h2>
            <Link to={ROUTES.PREFERENCES} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-extrabold text-navy-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-50 hover:text-primary-900">
              Tạo lịch trình <TripIcon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TravelPlatform. Made for journeys across Vietnam.</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary-400" />
            Trải nghiệm du lịch Việt Nam hiện đại
          </div>
        </div>
      </div>
    </footer>
  );
}
