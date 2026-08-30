import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from '@/components/common/Loading';

// Dev-Only Preview (tree-shaken in production)
const DesignSystemPreviewPage = import.meta.env.DEV
  ? lazy(() => import('@/pages/dev/DesignSystemPreviewPage'))
  : null;

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Client Pages (Public)
import HomePage from '@/pages/client/HomePage';
import DestinationsPage from '@/pages/client/DestinationsPage';
import DestinationDetailPage from '@/pages/client/DestinationDetailPage';
import LoginPage from '@/pages/client/LoginPage';
import RegisterPage from '@/pages/client/RegisterPage';
import SharedTripPage from '@/pages/client/SharedTripPage';
import NotFoundPage from '@/pages/client/NotFoundPage';

// Client Pages (Protected - User)
import ProfilePage from '@/pages/client/ProfilePage';
import FavoritesPage from '@/pages/client/FavoritesPage';
import PreferencesPage from '@/pages/client/PreferencesPage';
import TripsPage from '@/pages/client/TripsPage';
import TripDetailPage from '@/pages/client/TripDetailPage';

// Admin Pages
import DashboardPage from '@/pages/admin/DashboardPage';
import UsersPage from '@/pages/admin/UsersPage';
import DestinationsAdminPage from '@/pages/admin/DestinationsAdminPage';
import CategoriesPage from '@/pages/admin/CategoriesPage';
import ReviewsAdminPage from '@/pages/admin/ReviewsAdminPage';

/**
 * AppRoutes — Bộ định tuyến tập trung của toàn bộ ứng dụng.
 *
 * ============================================================
 * QUY ĐỊNH & HƯỚNG DẪN THÊM ROUTE:
 * ============================================================
 *
 * 1. Thành viên ĐƯỢC PHÉP thêm Route chức năng của mình vào đúng nhóm bên dưới.
 * 2. TUYỆT ĐỐI KHÔNG thay đổi cấu trúc bọc layout (MainLayout, AdminLayout, AuthLayout, ProtectedRoute, AdminRoute).
 *
 * - Auth route: Bọc bên trong <Route element={<AuthLayout />}>
 * - Public route: Thêm <Route path="..." element={<MyPage />} /> bên trong <Route element={<MainLayout />}>
 * - Protected user route: Thêm bên trong <Route element={<ProtectedRoute />}><Route element={<MainLayout />}>
 * - Admin route: Thêm bên trong <Route element={<AdminRoute />}><Route path="admin" element={<AdminLayout />}>
 * ============================================================
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ======================================================
          AUTH ROUTES — Split-screen Desktop Layout (Bọc trong AuthLayout)
          ====================================================== */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* ======================================================
          PUBLIC ROUTES — Ai cũng vào được (trong MainLayout)
          ====================================================== */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="destinations" element={<DestinationsPage />} />
        <Route path="destinations/:id" element={<DestinationDetailPage />} />
        <Route path="shared-trip/:token" element={<SharedTripPage />} />
      </Route>

      {/* ======================================================
          PROTECTED ROUTES — Yêu cầu đăng nhập (trong MainLayout)
          ====================================================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="preferences" element={<PreferencesPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="trips/:id" element={<TripDetailPage />} />
        </Route>
      </Route>

      {/* ======================================================
          ADMIN ROUTES — Yêu cầu role ADMIN (trong AdminLayout)
          ====================================================== */}
      <Route element={<AdminRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          {/* /admin → redirect /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="destinations" element={<DestinationsAdminPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="reviews" element={<ReviewsAdminPage />} />
        </Route>
      </Route>

      {/* ======================================================
          DEV-ONLY DESIGN SYSTEM PREVIEW
          ====================================================== */}
      {import.meta.env.DEV && DesignSystemPreviewPage && (
        <Route
          path="design-system"
          element={
            <Suspense fallback={<Loading fullPage message="Đang tải Design System Preview..." />}>
              <DesignSystemPreviewPage />
            </Suspense>
          }
        />
      )}

      {/* ======================================================
          404 — Fallback
          ====================================================== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
