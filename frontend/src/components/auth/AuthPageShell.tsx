import type { ReactNode } from 'react';
import logoImg from '@/assets/branding/travelgo-logo.png';

interface AuthPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
  motion?: 'signin' | 'signup';
}

const Feature = ({ children }: { children: ReactNode }) => (
  <li className="flex items-center gap-3 text-sm font-semibold text-primary-50">
    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/15">
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m5 10 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    {children}
  </li>
);

export default function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  motion = 'signin',
}: AuthPageShellProps) {
  return (
    <section className={`auth-shell auth-shell--${motion} relative overflow-x-hidden bg-sand-50 px-4 py-10 sm:py-14 lg:py-16`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary-50 to-transparent" />
      <div className="relative mx-auto grid min-w-0 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-float lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative isolate hidden min-h-[650px] overflow-hidden bg-navy-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <img src="/images/vietnam-hoi-an-journal.jpg" alt="" className="auth-shell__media absolute inset-0 -z-30 h-full w-full object-cover object-[64%_50%]" />
          <div className="absolute inset-0 -z-20 bg-gradient-to-b from-navy-950/45 via-navy-950/64 to-navy-950/92" />
          <div className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full border-[48px] border-white/10" />
          <div className="absolute -bottom-24 -left-16 -z-10 h-72 w-72 rounded-full bg-primary-300/20 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-normal text-blue-50 backdrop-blur">
              <img src={logoImg} alt="" width={18} height={18} style={{ objectFit: 'contain', flexShrink: 0 }} aria-hidden="true" />
              TravelGo
            </span>
            <h2 className="mt-8 max-w-sm text-4xl font-black leading-tight text-white">
              Mỗi hành trình bắt đầu từ một nơi đáng nhớ.
            </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-primary-100">
              Lưu điểm đến, xem đánh giá thật và biến những ý tưởng du lịch thành kế hoạch rõ ràng.
            </p>
          </div>

          <ul className="relative space-y-4">
            <Feature>Đồng bộ địa điểm yêu thích</Feature>
            <Feature>Lập lịch trình cá nhân hóa</Feature>
            <Feature>Quản lý mọi chuyến đi tại một nơi</Feature>
          </ul>
        </aside>

        <div className="auth-shell__form flex min-w-0 min-h-[650px] flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
          <div className="mx-auto min-w-0 w-full max-w-md">
            <p className="text-xs font-extrabold uppercase tracking-normal text-primary-600">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-black tracking-normal text-gray-900 sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-7 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
