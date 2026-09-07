import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/client/Header';
import Footer from '@/components/client/Footer';

/**
 * MainLayout — Khung chung cho toàn bộ website người dùng (Client).
 *
 * Cấu trúc:
 *   Header (sticky navbar)
 *   <main> → <Outlet /> ← Các page được render tại đây
 *   Footer
 *
 * Thành viên khi thêm page mới vào Client chỉ cần:
 *   1. Tạo component page
 *   2. Khai báo route trong AppRoutes.tsx
 *   3. Component sẽ tự động render trong <Outlet />
 */
export default function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="client-shell flex min-h-screen flex-col overflow-x-clip bg-sand-50">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-white shadow-lg transition focus:translate-y-0 focus:text-white"
      >
        Chuyển đến nội dung chính
      </a>
      <Header />
      <main id="main-content" key={pathname} className="page-enter w-full flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
