import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

/**
 * AdminLayout — Khung chung cho toàn bộ Admin Dashboard.
 *
 * Cấu trúc:
 *   ┌──────────────────────────────────────────────┐
 *   │  AdminSidebar (fixed left, lg+)  │  Header   │
 *   │                                  ├───────────│
 *   │                                  │  <Outlet> │
 *   │                                  │  (content)│
 *   └──────────────────────────────────────────────┘
 *
 * Mobile (< lg / 1024 px): Sidebar renders as a fixed overlay drawer.
 * Desktop (≥ lg / 1024 px): Sidebar is always visible as a fixed left panel.
 *
 * `mobileOpen` state lives here so both AdminHeader (toggle trigger)
 * and AdminSidebar (visibility + close-on-navigate) share it without
 * lifting state further up the tree.
 */
export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Close drawer whenever the route changes (user tapped a nav link)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape key + restore body overflow on unmount
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };

    // Lock body scroll while drawer is open on mobile
    const previousOverflow = document.body.style.overflow;
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previousOverflow;
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex h-screen bg-stone-100/70 overflow-hidden">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={closeMobile} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 lg:pl-0">
        {/* Top header */}
        <AdminHeader
          onMobileMenuToggle={toggleMobile}
          mobileMenuOpen={mobileOpen}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" id="admin-main-content">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
