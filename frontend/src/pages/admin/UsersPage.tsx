import AdminFeaturePlaceholder from '@/components/admin/AdminFeaturePlaceholder';

/**
 * UsersPage — Quản lý Người dùng.
 * TODO: Nhóm trưởng triển khai theo phân công trong backend/docs/travel-platform-development-guide.md (Mục 15)
 */
export default function UsersPage() {
  return (
    <AdminFeaturePlaceholder
      icon={
        <svg className="w-9 h-9" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      }
      title="Quản lý Người dùng"
      description="Xem, tìm kiếm và phân quyền người dùng trong hệ thống TravelGo."
      owner="Nhóm trưởng"
      capabilities={[
        'Danh sách người dùng với lọc và phân trang',
        'Phân quyền USER / ADMIN',
        'Vô hiệu hóa hoặc khôi phục tài khoản',
      ]}
    />
  );
}
