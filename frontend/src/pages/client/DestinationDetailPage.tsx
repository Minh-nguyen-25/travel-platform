import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinationService } from '@/services/destination.service';
import type { Destination } from '@/types/destination.types';
import { ROUTES } from '@/constants';
import Loading from '@/components/common/Loading';

const formatCurrency = (price: number | string | undefined) => {
  const num = Number(price);
  if (isNaN(num) || num === 0) return 'Miễn phí tham quan';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await destinationService.getById(id);
        if (res.data?.success && res.data.data) {
          setDestination(res.data.data);
          setActiveImageIndex(0);
        } else {
          setError('Không tìm thấy thông tin địa điểm này.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi tải thông tin địa điểm.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loading fullPage message="Đang tải chi tiết địa điểm..." />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-[60vh] container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy địa điểm</h2>
          <p className="text-sm text-gray-500 mb-6">{error || 'Địa điểm không tồn tại hoặc đã bị ẩn.'}</p>
          <Link
            to={ROUTES.DESTINATIONS}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition inline-block"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const allImages = destination.images && destination.images.length > 0
    ? destination.images.map((img) => img.imageUrl)
    : ['https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200&auto=format&fit=crop'];

  const currentImageUrl = allImages[activeImageIndex] || allImages[0];

  // URL chỉ đường Google Maps & OpenStreetMap
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${destination.latitude}&mlon=${destination.longitude}#map=16/${destination.latitude}/${destination.longitude}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ─── Breadcrumbs ─────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link to={ROUTES.HOME} className="hover:text-primary-600 transition">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to={ROUTES.DESTINATIONS} className="hover:text-primary-600 transition">
            Địa điểm
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">
            {destination.name}
          </span>
        </nav>

        {/* ─── Header: Tên & Đánh giá & Danh mục ────────────────────── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {destination.categories?.map((c, i) => (
                  <span
                    key={i}
                    className="bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full border border-primary-100"
                  >
                    {c.category?.name}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
                {destination.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{destination.address}</span>
              </p>
            </div>

            {/* Rating badge & nút chỉ đường top */}
            <div className="flex items-center gap-4 self-start md:self-center">
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-800 px-3.5 py-1.5 rounded-xl border border-yellow-200 text-base font-bold">
                  <span className="text-yellow-500 text-lg">★</span>
                  <span>{Number(destination.rating).toFixed(1)} / 5.0</span>
                </div>
                <span className="block text-[11px] text-gray-400 mt-0.5">Đánh giá chung</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Gallery ảnh & Thông tin chi tiết ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Gallery (2 cột) */}
          <div className="lg:col-span-2 space-y-3">
            {/* Ảnh chính lớn */}
            <div className="relative h-[340px] sm:h-[450px] rounded-2xl overflow-hidden bg-gray-900 border border-gray-100 shadow-sm">
              <img
                src={currentImageUrl}
                alt={destination.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                {activeImageIndex + 1} / {allImages.length} ảnh
              </div>
            </div>

            {/* Thumbnail Strip bên dưới */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
                      activeImageIndex === idx
                        ? 'border-primary-600 shadow-md scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hộp thông tin nhanh & Nút Chỉ đường (1 cột) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 pb-4 border-b border-gray-100">
                Thông Tin Tham Quan
              </h2>

              <ul className="divide-y divide-gray-100 text-sm">
                {/* Giá vé */}
                <li className="py-3.5 flex items-start justify-between gap-2">
                  <span className="text-gray-500 flex items-center gap-2">
                    <span>🎟️</span> Giá vé:
                  </span>
                  <span className="font-bold text-primary-600 text-right">
                    {formatCurrency(destination.ticketPrice)}
                  </span>
                </li>

                {/* Giờ mở cửa */}
                <li className="py-3.5 flex items-start justify-between gap-2">
                  <span className="text-gray-500 flex items-center gap-2">
                    <span>🕒</span> Giờ mở cửa:
                  </span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%]">
                    {destination.openingHoursNote || 'Mở cửa hàng ngày'}
                  </span>
                </li>

                {/* Thời lượng dự kiến */}
                {destination.visitDuration && (
                  <li className="py-3.5 flex items-start justify-between gap-2">
                    <span className="text-gray-500 flex items-center gap-2">
                      <span>⏳</span> Thời lượng:
                    </span>
                    <span className="font-medium text-gray-800 text-right">
                      Khoảng {destination.visitDuration} phút (~{(destination.visitDuration / 60).toFixed(1)}h)
                    </span>
                  </li>
                )}

                {/* Điện thoại */}
                {destination.phoneNumber && (
                  <li className="py-3.5 flex items-start justify-between gap-2">
                    <span className="text-gray-500 flex items-center gap-2">
                      <span>📞</span> Điện thoại:
                    </span>
                    <a
                      href={`tel:${destination.phoneNumber}`}
                      className="font-medium text-primary-600 hover:underline text-right"
                    >
                      {destination.phoneNumber}
                    </a>
                  </li>
                )}

                {/* Tọa độ GPS */}
                <li className="py-3.5 flex items-start justify-between gap-2 text-xs">
                  <span className="text-gray-500 flex items-center gap-2">
                    <span>🌐</span> Tọa độ GPS:
                  </span>
                  <span className="font-mono text-gray-600 text-right">
                    {Number(destination.latitude).toFixed(4)}, {Number(destination.longitude).toFixed(4)}
                  </span>
                </li>
              </ul>

              {/* ─── NÚT CHỈ ĐƯỜNG ──────────────────────────────────── */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2.5">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Chỉ đường trên Google Maps</span>
                </a>

                <a
                  href={osmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Xem trên OpenStreetMap</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Giới thiệu chi tiết ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
            Giới Thiệu Điểm Đến
          </h2>
          <div className="prose max-w-none text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {destination.description || 'Chưa có bài viết mô tả chi tiết cho địa điểm này.'}
          </div>
        </div>
      </div>
    </div>
  );
}
