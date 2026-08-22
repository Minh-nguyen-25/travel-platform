import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

/**
 * DashboardPage — Trang tổng quan quản trị (Admin Dashboard).
 * TODO: TV5 sẽ kết nối API thống kê phân tích (Analytics API).
 */
export default function DashboardPage() {
  const stats = [
    { label: 'Tổng người dùng', value: '1,248', change: '+12%', isPositive: true, icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Tổng địa điểm', value: '384', change: '+5%', isPositive: true, icon: '📍', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Lịch trình đã tạo', value: '2,890', change: '+18%', isPositive: true, icon: '🗺️', color: 'bg-purple-50 text-purple-700' },
    { label: 'Đánh giá mới', value: '542', change: '-2%', isPositive: false, icon: '⭐', color: 'bg-amber-50 text-amber-700' },
  ];

  const recentDestinations = [
    { id: 1, name: 'Vịnh Hạ Long', category: 'Thiên nhiên', views: '14.2k', status: 'Hoạt động' },
    { id: 2, name: 'Phố Cổ Hội An', category: 'Văn hóa', views: '11.8k', status: 'Hoạt động' },
    { id: 3, name: 'Bà Nà Hills', category: 'Giải trí', views: '9.5k', status: 'Hoạt động' },
    { id: 4, name: 'Đảo Phú Quốc', category: 'Biển đảo', views: '8.9k', status: 'Hoạt động' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Chào mừng trở lại, Quản trị viên! 👋</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tổng quan tình hình hệ thống và hoạt động du lịch hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ADMIN_DESTINATIONS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <span>+</span> Thêm địa điểm mới
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-2xl p-2.5 rounded-xl bg-gray-50">{item.icon}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {item.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2 Columns: Recent Table + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table: Địa điểm nổi bật */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Địa điểm du lịch nổi bật</h3>
            <Link to={ROUTES.ADMIN_DESTINATIONS} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              Xem tất cả →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 rounded-lg">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Tên địa điểm</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4">Lượt xem</th>
                  <th className="py-3 px-4 rounded-r-lg">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentDestinations.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-900">{row.name}</td>
                    <td className="py-3.5 px-4 text-gray-500">{row.category}</td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium">{row.views}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Menu / Phím tắt quản trị */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">Lối tắt quản lý</h3>
            <div className="space-y-3">
              <Link
                to={ROUTES.ADMIN_USERS}
                className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">Quản lý Người dùng</p>
                    <p className="text-xs text-gray-400">Xem danh sách, phân quyền</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-primary-600">→</span>
              </Link>

              <Link
                to={ROUTES.ADMIN_CATEGORIES}
                className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📁</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">Quản lý Danh mục</p>
                    <p className="text-xs text-gray-400">Phân loại điểm đến</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-primary-600">→</span>
              </Link>

              <Link
                to={ROUTES.ADMIN_REVIEWS}
                className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">Kiểm duyệt Đánh giá</p>
                    <p className="text-xs text-gray-400">Duyệt & ẩn bình luận</p>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-primary-600">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
            💡 <strong>Dành cho Dev:</strong> Khung layout và menu Admin đã hoàn tất. Thành viên nhận module chỉ cần phát triển nghiệp vụ vào từng trang.
          </div>
        </div>
      </div>
    </div>
  );
}
