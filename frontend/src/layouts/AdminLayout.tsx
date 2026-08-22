import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

/**
 * AdminLayout — Khung chung cho toàn bộ Admin Dashboard.
 *
 * Cấu trúc:
 *   ┌──────────────────────────────────────────────┐
 *   │  AdminSidebar (fixed left)  │  AdminHeader   │
 *   │                              ├────────────────│
 *   │                              │  <Outlet />    │
 *   │                              │  (content)     │
 *   └──────────────────────────────────────────────┘
 *
 * Thành viên khi thêm trang Admin mới chỉ cần:
 *   1. Tạo component page trong src/pages/admin/
 *   2. Khai báo route trong AppRoutes.tsx bên trong AdminRoute
 *   3. Thêm item vào AdminSidebar (src/components/admin/AdminSidebar.tsx)
 */
export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — fixed left */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Top header */}
        <AdminHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
