import { Outlet } from 'react-router-dom';
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
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
