import AdminFeaturePlaceholder from '@/components/admin/AdminFeaturePlaceholder';

/**
 * CategoriesPage — Quản lý Danh mục.
 * TODO: Minh triển khai theo phân công trong backend/docs/travel-platform-development-guide.md (Mục 15)
 */
export default function CategoriesPage() {
  return (
    <AdminFeaturePlaceholder
      icon={
        <svg className="w-9 h-9" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
        </svg>
      }
      title="Quản lý Danh mục"
      description="Phân loại các địa điểm du lịch theo nhóm chủ đề hoặc loại hình."
      owner="Minh"
      capabilities={[
        'Tạo và chỉnh sửa danh mục',
        'Gán địa điểm vào danh mục',
        'Xóa danh mục không còn sử dụng',
      ]}
    />
  );
}
