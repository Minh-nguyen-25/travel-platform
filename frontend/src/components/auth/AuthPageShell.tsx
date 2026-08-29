import type { ReactNode } from 'react';

interface AuthPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

const Feature = ({ children }: { children: ReactNode }) => (
  <li className="flex items-center gap-3 text-sm font-medium text-blue-50">
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
}: AuthPageShellProps) {
  return (
    <section className="relative overflow-x-hidden bg-slate-50 px-4 py-10 sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-blue-50 to-transparent" />
      <div className="relative mx-auto grid min-w-0 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-blue-900/10 lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative hidden min-h-[650px] overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[48px] border-white/10" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-50 backdrop-blur">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s7-5.35 7-12a7 7 0 1 0-14 0c0 6.65 7 12 7 12Z" />
                <circle cx="12" cy="9" r="2" />
              </svg>
              TravelPlatform
            </span>
            <h2 className="mt-8 max-w-sm text-4xl font-black leading-tight text-white">
              Mỗi hành trình bắt đầu từ một nơi đáng nhớ.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-blue-100">
              Lưu điểm đến, xem đánh giá thật và biến những ý tưởng du lịch thành kế hoạch rõ ràng.
            </p>
          </div>

          <ul className="relative space-y-4">
            <Feature>Đồng bộ địa điểm yêu thích</Feature>
            <Feature>Lập lịch trình cá nhân hóa</Feature>
            <Feature>Quản lý mọi chuyến đi tại một nơi</Feature>
          </ul>
        </aside>

        <div className="flex min-w-0 min-h-[650px] flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
          <div className="mx-auto min-w-0 w-full max-w-md">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary-600">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
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
