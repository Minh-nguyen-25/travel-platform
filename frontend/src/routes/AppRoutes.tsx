import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from '@/components/common/Loading';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Route-level code splitting keeps the first visit lightweight while preserving route contracts.
const HomePage = lazy(() => import('@/pages/client/HomePage'));
const DestinationsPage = lazy(() => import('@/pages/client/DestinationsPage'));
const DestinationDetailPage = lazy(() => import('@/pages/client/DestinationDetailPage'));
const LoginPage = lazy(() => import('@/pages/client/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/client/RegisterPage'));
const SharedTripPage = lazy(() => import('@/pages/client/SharedTripPage'));
const NotFoundPage = lazy(() => import('@/pages/client/NotFoundPage'));
const ProfilePage = lazy(() => import('@/pages/client/ProfilePage'));
const FavoritesPage = lazy(() => import('@/pages/client/FavoritesPage'));
const PreferencesPage = lazy(() => import('@/pages/client/PreferencesPage'));
const AiChatPage = lazy(() => import('@/pages/client/AiChatPage'));
const TripsPage = lazy(() => import('@/pages/client/TripsPage'));
const TripDetailPage = lazy(() => import('@/pages/client/TripDetailPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'));
const DestinationsAdminPage = lazy(() => import('@/pages/admin/DestinationsAdminPage'));
const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'));
const ReviewsAdminPage = lazy(() => import('@/pages/admin/ReviewsAdminPage'));

/**
 * AppRoutes — Bộ định tuyến tập trung của toàn bộ ứng dụng.
 *
 * ============================================================
 * QUY ĐỊNH & HƯỚNG DẪN THÊM ROUTE:
 * ============================================================
 *
 * 1. Thành viên ĐƯỢC PHÉP thêm Route chức năng của mình vào đúng nhóm bên dưới.
 * 2. TUYỆT ĐỐI KHÔNG thay đổi cấu trúc bọc layout (MainLayout, AdminLayout, ProtectedRoute, AdminRoute).
 *
 * - Public route: Thêm <Route path="..." element={<MyPage />} /> bên trong <Route element={<MainLayout />}>
 * - Protected user route: Thêm bên trong <Route element={<ProtectedRoute />}><Route element={<MainLayout />}>
 * - Admin route: Thêm bên trong <Route element={<AdminRoute />}><Route path="admin" element={<AdminLayout />}>
 * ============================================================
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading fullPage message="Đang mở hành trình..." />}>
      <Routes>
      {/* ======================================================
          PUBLIC ROUTES — Ai cũng vào được (trong MainLayout)
          ====================================================== */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="destinations" element={<DestinationsPage />} />
        <Route path="destinations/:id" element={<DestinationDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
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
          <Route path="ai-chat" element={<AiChatPage />} />
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
          404 — Fallback
          ====================================================== */}
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
