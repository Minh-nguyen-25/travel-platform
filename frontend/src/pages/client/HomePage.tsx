import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { destinationService } from '@/services/destination.service';
import { categoryService } from '@/services/category.service';
import type { Destination } from '@/types/destination.types';
import type { Category } from '@/types/category.types';
import { ROUTES } from '@/constants';
import Loading from '@/components/common/Loading';

// Helper format giá tiền VNĐ
const formatCurrency = (price: number | string | undefined) => {
  const num = Number(price);
  if (isNaN(num) || num === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

// Icon map cho từng danh mục
const getCategoryIcon = (name: string) => {
  if (name.includes('Biển')) return '🏖️';
  if (name.includes('Núi')) return '⛰️';
  if (name.includes('Di tích') || name.includes('Lịch sử')) return '🏛️';
  if (name.includes('Ẩm thực')) return '🍜';
  if (name.includes('Văn hóa')) return '🎭';
  if (name.includes('Nghỉ dưỡng') || name.includes('Sinh thái')) return '🌿';
  return '📍';
};

export default function HomePage() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [topDestinations, setTopDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catRes, destRes] = await Promise.all([
          categoryService.getAll(),
          destinationService.getTopRated(6),
        ]);

        if (catRes.data?.success) {
          setCategories(catRes.data.data);
        }
        if (destRes.data?.success) {
          setTopDestinations(destRes.data.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`${ROUTES.DESTINATIONS}?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate(ROUTES.DESTINATIONS);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ─── 1. HERO BANNER ───────────────────────────────────────────── */}
      <section className="relative min-h-[540px] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image với hiệu ứng Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1920&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 py-16 w-full max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-medium mb-6">
            <span>✨</span> Khám phá hơn 100+ danh lam thắng cảnh Việt Nam
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Hành Trình Mơ Ước, <span className="text-primary-400">Trải Nghiệm Đích Thực</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow">
            Tìm kiếm địa điểm du lịch lý tưởng, xem đánh giá chi tiết và lên lịch trình khám phá cá nhân hóa cùng TravelPlatform.
          </p>

          {/* Form tìm kiếm nhanh */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-2.5 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto border border-white/20"
          >
            <div className="flex items-center gap-3 px-4 py-2 w-full text-gray-700">
              <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Bạn muốn đi đâu? (Hạ Long, Hội An, Phú Quốc...)"
                className="w-full text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white px-8 py-3.5 rounded-xl md:rounded-full font-semibold text-sm sm:text-base transition shadow-md flex-shrink-0 flex items-center justify-center gap-2"
            >
              <span>Tìm kiếm</span>
            </button>
          </form>

          {/* Gợi ý tìm kiếm phổ biến */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs sm:text-sm text-gray-300">
            <span className="text-gray-400">Gợi ý:</span>
            {['Vịnh Hạ Long', 'Hội An', 'Đà Lạt', 'Bà Nà Hills', 'Tràng An'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`${ROUTES.DESTINATIONS}?search=${encodeURIComponent(tag)}`)}
                className="hover:text-white hover:underline transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 2. DANH MỤC NỔI BẬT ────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Khám phá theo sở thích</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">Danh Mục Nổi Bật</h2>
            </div>
            <Link
              to={ROUTES.DESTINATIONS}
              className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
            >
              Xem tất cả địa điểm
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="py-10">
              <Loading message="Đang tải danh mục..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => navigate(`${ROUTES.DESTINATIONS}?categoryId=${category.id}`)}
                  className="group p-5 bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center text-decoration-none"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-primary-50 flex items-center justify-center text-2xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform mb-3">
                    {getCategoryIcon(category.name)}
                  </div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 text-sm mb-1 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {category._count?.destinations ?? 0} địa điểm
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── 3. TOP ĐỊA ĐIỂM ĐÁNH GIÁ CAO ───────────────────────────── */}
      <section className="py-16 bg-gray-50 flex-1">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Trải nghiệm tuyệt đỉnh</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">Top Địa Điểm Đánh Giá Cao</h2>
              <p className="text-sm text-gray-500 mt-1">Những điểm đến được du khách yêu thích và đánh giá cao nhất</p>
            </div>
            <Link
              to={`${ROUTES.DESTINATIONS}?sortBy=rating:desc`}
              className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
            >
              Xem thêm địa điểm hot
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12">
              <Loading message="Đang tải địa điểm..." />
            </div>
          ) : topDestinations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500">Chưa có địa điểm nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {topDestinations.map((dest) => {
                const primaryImage =
                  dest.images?.find((img) => img.isPrimary)?.imageUrl ||
                  dest.images?.[0]?.imageUrl ||
                  'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&auto=format&fit=crop';

                return (
                  <div
                    key={dest.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Ảnh và Rating Badge */}
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <img
                        src={primaryImage}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 text-xs font-bold text-gray-800">
                        <span className="text-yellow-500">★</span>
                        <span>{Number(dest.rating).toFixed(1)}</span>
                      </div>
                      {/* Category Tag */}
                      {dest.categories && dest.categories.length > 0 && (
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                          {dest.categories.slice(0, 2).map((c, idx) => (
                            <span
                              key={idx}
                              className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                            >
                              {c.category?.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Nội dung Card */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                          <Link to={ROUTES.DESTINATION_DETAIL(dest.id)}>{dest.name}</Link>
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 line-clamp-1">
                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span>{dest.address}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-2.5 line-clamp-2 leading-relaxed">
                          {dest.description || 'Chưa có mô tả chi tiết cho địa điểm này.'}
                        </p>
                      </div>

                      {/* Footer card: Giá vé & Nút xem */}
                      <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-gray-400 block">Giá vé tham quan</span>
                          <span className="text-sm font-bold text-primary-600">
                            {formatCurrency(dest.ticketPrice)}
                          </span>
                        </div>
                        <Link
                          to={ROUTES.DESTINATION_DETAIL(dest.id)}
                          className="bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>Xem chi tiết</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}