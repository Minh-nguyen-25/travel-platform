/**
 * TODO: Minh triển khai Trang danh sách địa điểm (Explore / Destinations)
 *
 * Bao gồm:
 * - Bộ lọc đa năng (danh mục, khoảng giá, rating)
 * - Tìm kiếm từ khóa
 * - Danh sách địa điểm (dạng grid card)
 * - Phân trang
 *
 * API: GET /api/v1/destinations?page=1&limit=12&search=...&categoryId=...
 */
export default function DestinationsPage() {
  return (
    <div className="container py-16 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Khám phá địa điểm</h1>
      <p className="text-gray-500">Đang phát triển — Feature owner: Minh</p>
    </div>
  );
}
