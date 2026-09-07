import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="admin-shell flex h-screen overflow-hidden bg-admin-canvas">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        collapsed={sidebarCollapsed}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader onOpenSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 xl:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
