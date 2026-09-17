import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { destinationService } from '@/services/destination.service';
import { categoryService } from '@/services/category.service';
import type { Destination } from '@/types/destination.types';
import type { Category } from '@/types/category.types';
import { ROUTES } from '@/constants';
import Loading from '@/components/common/Loading';

const formatCurrency = (price: number | string | undefined) => {
  const num = Number(price);
  if (isNaN(num) || num === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export default function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
  const sortBy = (searchParams.get('sortBy') as any) || 'createdAt:desc';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  // Data state
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Local search keyword state for input
  const [keywordInput, setKeywordInput] = useState(search);

  // Load categories once
  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    });
  }, []);

  // Fetch destinations when URL params change
  const fetchDestinations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await destinationService.getAll({
        page,
        limit: 9,
        search: search || undefined,
        categoryId,
        minPrice,
        maxPrice,
        minRating,
        sortBy,
      });

      if (res.data?.success) {
        setDestinations(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách địa điểm:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryId, minPrice, maxPrice, minRating, sortBy]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Helper update search params
  const updateFilter = (updates: Record<string, string | number | undefined | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });
    // Reset về page 1 nếu thay đổi bộ lọc khác page
    if (!('page' in updates)) {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ search: keywordInput.trim() || undefined });
  };

  const handleResetFilters = () => {
    setKeywordInput('');
    setSearchParams(new URLSearchParams());
  };

  // Price range helper
  const handlePriceSelect = (range: string) => {
    if (range === 'all') {
      updateFilter({ minPrice: undefined, maxPrice: undefined });
    } else if (range === 'free') {
      updateFilter({ minPrice: 0, maxPrice: 0 });
    } else if (range === 'under100') {
      updateFilter({ minPrice: 1, maxPrice: 100000 });
    } else if (range === '100to500') {
      updateFilter({ minPrice: 100000, maxPrice: 500000 });
    } else if (range === 'over500') {
      updateFilter({ minPrice: 500000, maxPrice: undefined });
    }
  };

  const currentPriceRange = () => {
    if (minPrice === 0 && maxPrice === 0) return 'free';
    if (minPrice === 1 && maxPrice === 100000) return 'under100';
    if (minPrice === 100000 && maxPrice === 500000) return '100to500';
    if (minPrice === 500000 && maxPrice === undefined) return 'over500';
    return 'all';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Khám Phá Địa Điểm Du Lịch</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tìm kiếm và lọc các điểm đến hấp dẫn trên khắp Việt Nam
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ─── CỘT TRÁI: BỘ LỌC ĐA NĂNG ─────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Bộ Lọc</span>
                </h2>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* 1. Tìm kiếm từ khóa */}
              <div className="py-4 border-b border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Từ khóa
                </label>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Tên hoặc địa chỉ..."
                    className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 pr-9 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              </div>

              {/* 2. Danh mục */}
              <div className="py-4 border-b border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                  Danh mục
                </label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => updateFilter({ categoryId: undefined })}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${
                      categoryId === undefined
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>Tất cả danh mục</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => updateFilter({ categoryId: cat.id })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                        categoryId === cat.id
                          ? 'bg-primary-50 text-primary-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat._count?.destinations !== undefined && (
                        <span className="text-xs text-gray-400">({cat._count.destinations})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Khoảng giá */}
              <div className="py-4 border-b border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                  Giá vé tham quan
                </label>
                <div className="space-y-2 text-sm text-gray-600">
                  {[
                    { key: 'all', label: 'Tất cả mức giá' },
                    { key: 'free', label: 'Miễn phí vé' },
                    { key: 'under100', label: 'Dưới 100.000 đ' },
                    { key: '100to500', label: '100.000 đ - 500.000 đ' },
                    { key: 'over500', label: 'Trên 500.000 đ' },
                  ].map((p) => (
                    <label key={p.key} className="flex items-center gap-2.5 cursor-pointer hover:text-gray-900">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={currentPriceRange() === p.key}
                        onChange={() => handlePriceSelect(p.key)}
                        className="text-primary-600 focus:ring-primary-500 rounded-full"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Đánh giá tối thiểu */}
              <div className="pt-4">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                  Đánh giá
                </label>
                <div className="space-y-2 text-sm text-gray-600">
                  {[
                    { val: undefined, label: 'Tất cả đánh giá' },
                    { val: 4.5, label: 'Từ 4.5 sao trở lên ★' },
                    { val: 4.0, label: 'Từ 4.0 sao trở lên ★' },
                  ].map((r, idx) => (
                    <label key={idx} className="flex items-center gap-2.5 cursor-pointer hover:text-gray-900">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === r.val}
                        onChange={() => updateFilter({ minRating: r.val })}
                        className="text-primary-600 focus:ring-primary-500 rounded-full"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── CỘT PHẢI: KẾT QUẢ & PHÂN TRANG ───────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Thanh công cụ: Đếm số lượng & Sắp xếp */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Tìm thấy <span className="font-bold text-gray-900">{pagination.total}</span> địa điểm
                {search && (
                  <span>
                    {' '}cho từ khóa "<span className="font-semibold text-primary-600">{search}</span>"
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-gray-500">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => updateFilter({ sortBy: e.target.value })}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white text-gray-700"
                >
                  <option value="createdAt:desc">Mới nhất</option>
                  <option value="rating:desc">Đánh giá cao nhất</option>
                  <option value="ticketPrice:asc">Giá: Thấp đến Cao</option>
                  <option value="ticketPrice:desc">Giá: Cao đến Thấp</option>
                  <option value="name:asc">Tên: A - Z</option>
                </select>
              </div>
            </div>

            {/* Danh sách địa điểm */}
            {isLoading ? (
              <div className="py-20 bg-white rounded-2xl border border-gray-100 text-center">
                <Loading message="Đang tìm kiếm địa điểm phù hợp..." />
              </div>
            ) : destinations.length === 0 ? (
              <div className="py-16 bg-white rounded-2xl border border-gray-100 shadow-sm text-center px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-2xl mb-4 text-gray-400">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Không tìm thấy địa điểm nào</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  Hãy thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm của bạn để có nhiều kết quả hơn.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {destinations.map((dest) => {
                  const primaryImage =
                    dest.images?.find((img) => img.isPrimary)?.imageUrl ||
                    dest.images?.[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&auto=format&fit=crop';

                  return (
                    <div
                      key={dest.id}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* Ảnh & Rating */}
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        <img
                          src={primaryImage}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 text-xs font-bold text-gray-800">
                          <span className="text-yellow-500">★</span>
                          <span>{Number(dest.rating).toFixed(1)}</span>
                        </div>
                        {dest.categories && dest.categories.length > 0 && (
                          <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1">
                            {dest.categories.slice(0, 2).map((c, i) => (
                              <span
                                key={i}
                                className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md"
                              >
                                {c.category?.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Thông tin card */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base group-hover:text-primary-600 transition-colors line-clamp-1">
                            <Link to={ROUTES.DESTINATION_DETAIL(dest.id)}>{dest.name}</Link>
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 line-clamp-1">
                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{dest.address}</span>
                          </p>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                            {dest.description || 'Chưa có mô tả chi tiết.'}
                          </p>
                        </div>

                        {/* Footer card */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-400 block">Giá vé</span>
                            <span className="text-xs font-bold text-primary-600">
                              {formatCurrency(dest.ticketPrice)}
                            </span>
                          </div>
                          <Link
                            to={ROUTES.DESTINATION_DETAIL(dest.id)}
                            className="bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>Chi tiết</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {/* Phân trang (Pagination) */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => updateFilter({ page: page - 1 })}
                  className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Trước
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateFilter({ page: p })}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                      page === p
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => updateFilter({ page: page + 1 })}
                  className="px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
