import AdminFeaturePlaceholder from '@/components/admin/AdminFeaturePlaceholder';

/**
 * DestinationsAdminPage — Quản lý Địa điểm.
 * TODO: Minh triển khai theo phân công trong backend/docs/travel-platform-development-guide.md (Mục 15)
 */
export default function DestinationsAdminPage() {
  return (
    <AdminFeaturePlaceholder
      icon={
        <svg className="w-9 h-9" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      }
      title="Quản lý Địa điểm"
      description="Thêm, chỉnh sửa và xóa các địa điểm du lịch trong nền tảng TravelGo."
      owner="Minh"
      capabilities={[
        'Danh sách địa điểm với lọc theo danh mục',
        'Thêm và chỉnh sửa thông tin địa điểm',
        'Quản lý hình ảnh và mô tả',
        'Xóa hoặc ẩn địa điểm',
      ]}
    />
  );
}
