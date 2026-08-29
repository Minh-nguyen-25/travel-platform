import { Link, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import TravelGoLogo from '@/components/common/TravelGoLogo';
import { SELECTED_HERO } from '@/data/auth-heroes';

/**
 * AuthLayout — Layout dùng chung cho các trang xác thực (Login & Register).
 *
 * Cung cấp:
 * 1. Khung split-screen đối xứng 50/50 trên desktop (lg:).
 * 2. Left Hero Panel ổn định tuyệt đối:
 *    - Sử dụng `SELECTED_HERO` được chọn 1 lần duy nhất khi ứng dụng tải.
 *    - Không bị re-mount hay re-animate khi điều hướng giữa Login và Register.
 *    - Hiệu ứng Ken Burns tinh tế (20s, 1 lần duy nhất, hỗ trợ reduced-motion).
 *    - Stagger reveal mượt mà cho Logo, Destination Badge và Quote.
 * 3. Right Form Panel cuộn dọc độc lập:
 *    - Chứa `Outlet` cho form Login/Register.
 *    - Hiệu ứng chuyển trang mượt mà `auth-form-enter` thông qua `key={location.pathname}`.
 *    - Vị trí nút "Trang chủ", form container và footer cố định và đồng nhất.
 * 4. Responsive: Dưới 1024px, ẩn hero panel và hiển thị form chiếm toàn màn hình.
 */
export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex overflow-x-hidden bg-gradient-to-br from-stone-50 via-slate-50 to-teal-50/20 lg:h-screen lg:max-h-screen lg:overflow-hidden">
      {/* ======================================================
          BÊN TRÁI: Hero Image Panel (Desktop 50%, cố định theo viewport)
          ====================================================== */}
      <div
        className="hidden lg:flex lg:w-1/2 lg:h-screen lg:max-h-screen lg:flex-none relative bg-stone-900 select-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Background Image with Ken Burns Effect */}
        <img
          src={SELECTED_HERO.image}
          alt={SELECTED_HERO.alt}
          className="absolute inset-0 w-full h-full object-cover auth-ken-burns"
          style={{ objectPosition: SELECTED_HERO.objectPosition }}
          loading="eager"
        />

        {/* Static Layered Vignette Overlays for Contrast & Depth */}
        <div className={`absolute inset-0 ${SELECTED_HERO.gradientOverlayClass} pointer-events-none`} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

        {/* Top-Left: TravelGo Brand Mark */}
        <div className="absolute top-8 left-8 z-10 auth-hero-reveal" style={{ animationDelay: '0ms' }}>
          <TravelGoLogo variant="light" showTagline />
        </div>

        {/* Top-Right: Destination Badge */}
        <div className="absolute top-8 right-8 z-10 auth-hero-reveal" style={{ animationDelay: '80ms' }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white text-[11px] font-medium tracking-wide shadow-sm">
            <svg
              className="w-3 h-3 text-amber-300 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {SELECTED_HERO.destination} · {SELECTED_HERO.descriptor}
            </span>
          </div>
        </div>

        {/* Bottom: Quotation with Amber Accent Bar */}
        <div className="absolute bottom-10 left-8 right-8 z-10 auth-hero-reveal" style={{ animationDelay: '160ms' }}>
          <div className="border-l-2 border-amber-400/80 pl-4 max-w-lg">
            <blockquote className="text-[19px] font-semibold text-white leading-relaxed">
              &ldquo;{SELECTED_HERO.quotation}&rdquo;
            </blockquote>
            {SELECTED_HERO.quotationAuthor && (
              <p className="mt-2.5 text-xs text-stone-300 font-medium tracking-widest uppercase">
                — {SELECTED_HERO.quotationAuthor}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          BÊN PHẢI: Form Panel (Desktop 50%, cuộn dọc độc lập)
          ====================================================== */}
      <div className="w-full lg:w-1/2 min-h-screen lg:min-h-0 lg:h-screen lg:max-h-screen lg:overflow-y-auto lg:overscroll-contain flex flex-col justify-between">
        {/* Top Bar: Mobile Logo & Link về Trang chủ */}
        <div className="flex items-center justify-between px-6 py-4 sm:px-10 flex-shrink-0">
          {/* Logo hiển thị trên màn hình nhỏ (< lg) */}
          <div className="lg:hidden">
            <TravelGoLogo variant="dark" showTagline={false} />
          </div>
          <div className="hidden lg:block" />

          {/* Link Trang chủ */}
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-stone-500 hover:text-teal-700 hover:bg-teal-50 border border-transparent hover:border-teal-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 motion-reduce:transition-none"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Trang chủ
          </Link>
        </div>

        {/* Vùng chứa Form nội dung (Outlet) với micro-animation khi chuyển route */}
        <div className="flex-1 flex flex-col justify-center px-6 py-6 sm:px-10">
          <div key={location.pathname} className="w-full max-w-[440px] mx-auto my-auto auth-form-enter">
            <Outlet />
          </div>
        </div>

        {/* Footer bản quyền */}
        <div className="text-center text-[11px] text-stone-400 py-4 flex-shrink-0">
          &copy; {new Date().getFullYear()} TravelGo · Nền tảng du lịch thông minh Việt Nam
        </div>
      </div>
    </div>
  );
}
