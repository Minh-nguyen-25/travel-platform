import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import EditorialPageHero from '@/components/common/EditorialPageHero';
import DestinationCard, { DestinationCardSkeleton } from '@/components/destination/DestinationCard';
import TripIcon from '@/components/trip/TripIcon';
import { destinationService } from '@/services/destination.service';
import type {
  Category,
  Destination,
  DestinationListParams,
  Pagination,
} from '@/types/destination.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

interface FilterDraft {
  categoryIds: number[];
  categoryMatch: 'any' | 'all';
  minPrice: string;
  maxPrice: string;
  minRating: string;
}

const emptyPagination: Pagination = { page: 1, limit: 12, total: 0, totalPages: 0 };

const toPositiveNumber = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const parseCategoryIds = (params: URLSearchParams): number[] => {
  const values = [params.get('categoryIds'), params.get('categoryId')]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(','))
    .map(Number)
    .filter((value) => Number.isInteger(value) && value > 0);
  return [...new Set(values)];
};

const pageItems = (current: number, total: number): Array<number | 'ellipsis'> => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page > 0 && page <= total).sort((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push('ellipsis');
    result.push(page);
  });
  return result;
};

export default function DestinationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryKey = searchParams.toString();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get('search') ?? '');
  const [filterDraft, setFilterDraft] = useState<FilterDraft>({
    categoryIds: parseCategoryIds(searchParams),
    categoryMatch: searchParams.get('categoryMatch') === 'all' ? 'all' : 'any',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    minRating: searchParams.get('minRating') ?? '',
  });

  const query = useMemo<DestinationListParams>(() => {
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    return {
      page: Math.max(1, Number(searchParams.get('page')) || 1),
      limit: 12,
      search: searchParams.get('search')?.trim() || undefined,
      categoryIds: parseCategoryIds(searchParams),
      categoryMatch: searchParams.get('categoryMatch') === 'all' ? 'all' : 'any',
      minPrice: toPositiveNumber(searchParams.get('minPrice')),
      maxPrice: toPositiveNumber(searchParams.get('maxPrice')),
      minRating: toPositiveNumber(searchParams.get('minRating')),
      sortBy: sortBy === 'name' || sortBy === 'rating' || sortBy === 'ticketPrice'
        ? sortBy
        : 'createdAt',
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
    };
  }, [searchParams]);

  useEffect(() => {
    setKeyword(searchParams.get('search') ?? '');
    setFilterDraft({
      categoryIds: parseCategoryIds(searchParams),
      categoryMatch: searchParams.get('categoryMatch') === 'all' ? 'all' : 'any',
      minPrice: searchParams.get('minPrice') ?? '',
      maxPrice: searchParams.get('maxPrice') ?? '',
      minRating: searchParams.get('minRating') ?? '',
    });
  }, [queryKey, searchParams]);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      try {
        const result = await destinationService.getCategories({ page: 1, limit: 100 });
        if (active) setCategories(result.data);
      } catch {
        if (active) setCategories([]);
      } finally {
        if (active) setCategoriesLoading(false);
      }
    };
    void loadCategories();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadDestinations = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await destinationService.getDestinations(query);
        if (!active) return;
        setDestinations(result.data);
        setPagination(result.pagination);
      } catch (requestError: unknown) {
        if (!active) return;
        setDestinations([]);
        setPagination(emptyPagination);
        setError(getApiErrorMessage(requestError, 'Không thể tải danh sách địa điểm.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadDestinations();
    return () => { active = false; };
  }, [query, retryKey]);

  const updateUrl = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateUrl({ search: keyword.trim() || undefined, page: undefined });
  };

  const toggleCategory = (categoryId: number) => {
    setFilterDraft((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((id) => id !== categoryId)
        : [...current.categoryIds, categoryId],
    }));
  };

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    next.delete('categoryId');
    if (filterDraft.categoryIds.length) next.set('categoryIds', filterDraft.categoryIds.join(','));
    else next.delete('categoryIds');
    if (filterDraft.categoryIds.length > 1 && filterDraft.categoryMatch === 'all') {
      next.set('categoryMatch', 'all');
    } else {
      next.delete('categoryMatch');
    }
    if (filterDraft.minPrice) next.set('minPrice', filterDraft.minPrice);
    else next.delete('minPrice');
    if (filterDraft.maxPrice) next.set('maxPrice', filterDraft.maxPrice);
    else next.delete('maxPrice');
    if (filterDraft.minRating) next.set('minRating', filterDraft.minRating);
    else next.delete('minRating');
    next.delete('page');
    setSearchParams(next);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    const next = new URLSearchParams();
    if (searchParams.get('search')) next.set('search', searchParams.get('search') as string);
    if (searchParams.get('sortBy')) next.set('sortBy', searchParams.get('sortBy') as string);
    if (searchParams.get('sortOrder')) next.set('sortOrder', searchParams.get('sortOrder') as string);
    setSearchParams(next);
    setFiltersOpen(false);
  };

  const changeSort = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    updateUrl({ sortBy, sortOrder, page: undefined });
  };

  const setPage = (page: number) => {
    updateUrl({ page: page > 1 ? String(page) : undefined });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const activeFilterCount = query.categoryIds?.length
    ? query.categoryIds.length
      + Number(query.minPrice !== undefined)
      + Number(query.maxPrice !== undefined)
      + Number(query.minRating !== undefined)
    : Number(query.minPrice !== undefined)
      + Number(query.maxPrice !== undefined)
      + Number(query.minRating !== undefined);
  const sortValue = `${query.sortBy}-${query.sortOrder}`;

  const filterPanel = (
    <form onSubmit={applyFilters} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
          <TripIcon name="filter" size={18} className="text-primary-600" /> Bộ lọc
        </h2>
        {activeFilterCount > 0 && (
          <button type="button" onClick={resetFilters} className="text-xs font-bold text-primary-600 hover:text-primary-800">
            Xóa bộ lọc
          </button>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-extrabold text-gray-800">Danh mục</legend>
        <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
          {categoriesLoading && Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 animate-pulse rounded-xl bg-gray-100" />
          ))}
          {!categoriesLoading && categories.map((category) => (
            <label key={category.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm transition hover:bg-gray-50">
              <span className="flex items-center gap-2.5 text-gray-700">
                <input
                  type="checkbox"
                  checked={filterDraft.categoryIds.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="font-medium">{category.name}</span>
              </span>
              <span className="text-xs font-semibold text-gray-400">{category.destinationCount}</span>
            </label>
          ))}
        </div>
        {filterDraft.categoryIds.length > 1 && (
          <div className="mt-3 grid grid-cols-2 rounded-xl bg-gray-50 p-1 text-xs font-bold">
            {(['any', 'all'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterDraft((current) => ({ ...current, categoryMatch: mode }))}
                className={`rounded-lg px-2 py-2 transition ${filterDraft.categoryMatch === mode ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'}`}
              >
                {mode === 'any' ? 'Một trong số' : 'Tất cả'}
              </button>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-extrabold text-gray-800">Khoảng giá vé</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-gray-500">
            Từ
            <input
              type="number"
              min="0"
              step="1000"
              value={filterDraft.minPrice}
              onChange={(event) => setFilterDraft((current) => ({ ...current, minPrice: event.target.value }))}
              placeholder="0 ₫"
              className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </label>
          <label className="text-xs font-semibold text-gray-500">
            Đến
            <input
              type="number"
              min="0"
              step="1000"
              value={filterDraft.maxPrice}
              onChange={(event) => setFilterDraft((current) => ({ ...current, maxPrice: event.target.value }))}
              placeholder="Bất kỳ"
              className="mt-1.5 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-extrabold text-gray-800">Đánh giá tối thiểu</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { value: '', label: 'Tất cả' },
            { value: '3', label: '3.0+' },
            { value: '4', label: '4.0+' },
            { value: '4.5', label: '4.5+' },
          ].map((option) => (
            <button
              key={option.value || 'all'}
              type="button"
              onClick={() => setFilterDraft((current) => ({ ...current, minRating: option.value }))}
              className={`inline-flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-bold transition ${
                filterDraft.minRating === option.value
                  ? 'border-warning bg-amber-50 text-amber-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {option.value && <TripIcon name="star" size={13} className="fill-warning text-warning" />}
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary-600 text-sm font-extrabold text-white shadow-md shadow-primary-100 transition hover:bg-primary-700">
        Áp dụng bộ lọc
      </button>
    </form>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 pb-20">
      <EditorialPageHero
        eyebrow="Khám phá Việt Nam"
        title={<>Tìm một nơi khiến bạn <span className="text-primary-100">muốn lên đường.</span></>}
        description="Tìm theo tên, địa chỉ, phong cách trải nghiệm, mức giá và đánh giá — rồi để Việt Nam dẫn bạn đến bất ngờ tiếp theo."
        image="/images/vietnam-ninh-binh-discovery.jpg"
        imageAlt="Thuyền nhỏ giữa sông và núi đá vôi Ninh Bình lúc bình minh"
        icon="compass"
        motion="pan"
        imagePosition="object-[64%_50%]"
        compact
      >
          <form onSubmit={submitSearch} className="flex w-full min-w-0 max-w-3xl gap-2 rounded-2xl border border-white/25 bg-white/95 p-2 shadow-float backdrop-blur-xl">
            <div className="relative min-w-0 flex-1">
              <TripIcon name="search" size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <label htmlFor="destination-search" className="sr-only">Từ khóa tìm kiếm</label>
              <input
                id="destination-search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tên địa điểm, thành phố hoặc trải nghiệm..."
                maxLength={200}
                className="h-11 w-full rounded-xl border-0 pl-11 pr-3 text-sm font-medium outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-extrabold text-white transition hover:bg-primary-700 sm:px-6">
              <span className="hidden sm:inline">Tìm kiếm</span><TripIcon name="search" size={17} />
            </button>
          </form>
      </EditorialPageHero>

      <div className="container py-8">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-extrabold text-gray-700 shadow-sm"
          >
            <TripIcon name="filter" size={17} /> Bộ lọc
            {activeFilterCount > 0 && <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}
          </button>
          <select
            value={sortValue}
            onChange={(event) => changeSort(event.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 outline-none focus:border-primary-500"
            aria-label="Sắp xếp địa điểm"
          >
            <option value="createdAt-desc">Mới nhất</option>
            <option value="rating-desc">Đánh giá cao</option>
            <option value="ticketPrice-asc">Giá thấp trước</option>
            <option value="ticketPrice-desc">Giá cao trước</option>
            <option value="name-asc">Tên A–Z</option>
          </select>
        </div>

        <div className="mt-6 grid min-w-0 items-start gap-7 lg:mt-0 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="sticky top-24 hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm lg:block">
            {filterPanel}
          </aside>

          <main className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {isLoading ? 'Đang tìm địa điểm...' : `${pagination.total} địa điểm phù hợp`}
                </p>
                {query.search && <p className="mt-1 text-xs text-gray-500">Kết quả cho “{query.search}”</p>}
              </div>
              <select
                value={sortValue}
                onChange={(event) => changeSort(event.target.value)}
                className="hidden h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 outline-none focus:border-primary-500 lg:block"
                aria-label="Sắp xếp địa điểm"
              >
                <option value="createdAt-desc">Mới nhất</option>
                <option value="rating-desc">Đánh giá cao</option>
                <option value="ticketPrice-asc">Giá thấp trước</option>
                <option value="ticketPrice-desc">Giá cao trước</option>
                <option value="name-asc">Tên A–Z</option>
              </select>
            </div>

            {error && !isLoading && (
              <div className="rounded-3xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm" role="alert">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-error"><TripIcon name="alert-circle" size={23} /></span>
                <h2 className="mt-4 text-lg font-extrabold text-gray-900">Chưa thể tải địa điểm</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{error}</p>
                <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700">
                  <TripIcon name="refresh" size={16} /> Thử lại
                </button>
              </div>
            )}

            {!error && (
              <div className="trip-stagger grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {isLoading
                  ? Array.from({ length: 9 }).map((_, index) => <DestinationCardSkeleton key={index} />)
                  : destinations.map((destination) => <DestinationCard key={destination.id} destination={destination} />)}
              </div>
            )}

            {!isLoading && !error && destinations.length === 0 && (
              <div className="rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500"><TripIcon name="compass" size={26} /></span>
                <h2 className="mt-4 text-xl font-extrabold text-gray-900">Chưa tìm thấy địa điểm phù hợp</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Hãy thử từ khóa rộng hơn hoặc bỏ bớt một vài điều kiện lọc.</p>
                <button type="button" onClick={resetFilters} className="mt-5 text-sm font-extrabold text-primary-700">Xóa bộ lọc và thử lại</button>
              </div>
            )}

            {!isLoading && !error && pagination.totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Phân trang địa điểm">
                <button
                  type="button"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-primary-200 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang trước"
                ><TripIcon name="chevron-left" size={17} /></button>
                {pageItems(pagination.page, pagination.totalPages).map((item, index) => item === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="flex h-10 w-8 items-center justify-center text-gray-400">…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item)}
                    className={`h-10 min-w-10 rounded-xl px-3 text-sm font-extrabold transition ${item === pagination.page ? 'bg-primary-600 text-white shadow-md shadow-primary-100' : 'border border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:text-primary-700'}`}
                    aria-current={item === pagination.page ? 'page' : undefined}
                  >{item}</button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-primary-200 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang sau"
                ><TripIcon name="chevron-right" size={17} /></button>
              </nav>
            )}
          </main>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Bộ lọc địa điểm">
          <button type="button" className="absolute inset-0 bg-gray-950/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} aria-label="Đóng bộ lọc" />
          <div className="trip-modal-enter absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <p className="text-lg font-extrabold text-gray-900">Lọc địa điểm</p>
              <button type="button" onClick={() => setFiltersOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600" aria-label="Đóng"><TripIcon name="x" size={18} /></button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
