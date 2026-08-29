import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DestinationCard, { DestinationCardSkeleton } from '@/components/destination/DestinationCard';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { favoriteService } from '@/services/favorite.service';
import type { Pagination } from '@/types/destination.types';
import type { SavedDestination } from '@/types/review.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

const emptyPagination: Pagination = { page: 1, limit: 12, total: 0, totalPages: 0 };

const readPage = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export default function FavoritesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams.get('page'));
  const [favorites, setFavorites] = useState<SavedDestination[]>([]);
  const [pagination, setPagination] = useState<Pagination>(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    let active = true;
    const loadFavorites = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await favoriteService.getFavorites(page, 12);
        if (!active) return;
        setFavorites(result.data);
        setPagination(result.pagination);
        if (page > 1 && result.data.length === 0 && result.pagination.totalPages < page) {
          const next = new URLSearchParams(searchParams);
          if (result.pagination.totalPages > 1) next.set('page', String(result.pagination.totalPages));
          else next.delete('page');
          setSearchParams(next, { replace: true });
        }
      } catch (requestError: unknown) {
        if (!active) return;
        setFavorites([]);
        setPagination(emptyPagination);
        setError(getApiErrorMessage(requestError, 'Không thể tải danh sách yêu thích.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadFavorites();
    return () => { active = false; };
  }, [page, retryKey, searchParams, setSearchParams]);

  const changePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) next.delete('page');
    else next.set('page', String(nextPage));
    setSearchParams(next);
  };

  const handleFavoriteChange = (destinationId: number, isFavorite: boolean) => {
    if (isFavorite) return;
    setFavorites((current) => current.filter(({ destination }) => destination.id !== destinationId));
    setPagination((current) => {
      const total = Math.max(0, current.total - 1);
      return { ...current, total, totalPages: Math.ceil(total / current.limit) };
    });
    setFeedback('Đã bỏ địa điểm khỏi danh sách yêu thích.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 pb-20">
      <section className="border-b border-primary-100 bg-gradient-to-br from-primary-50 via-white to-red-50/50">
        <div className="container py-12 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm">
                <TripIcon name="heart" size={22} className="fill-current" />
              </span>
              <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary-600">Bộ sưu tập của bạn</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">Địa điểm yêu thích</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Lưu lại những nơi truyền cảm hứng và quay lại khi bạn sẵn sàng lên kế hoạch.
              </p>
            </div>
            {!isLoading && !error && (
              <div className="w-fit rounded-2xl border border-white bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
                <p className="text-2xl font-black text-gray-900">{pagination.total}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Địa điểm đã lưu</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="container py-10">
        {feedback && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700" role="status">
            <span className="flex items-center gap-2"><TripIcon name="check" size={17} />{feedback}</span>
            <button type="button" onClick={() => setFeedback('')} className="rounded-lg p-1 hover:bg-emerald-100" aria-label="Đóng thông báo"><TripIcon name="x" size={14} /></button>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Đang tải địa điểm yêu thích">
            {Array.from({ length: 8 }, (_, index) => <DestinationCardSkeleton key={index} />)}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-red-100 bg-white px-7 py-12 text-center shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500"><TripIcon name="alert-circle" size={25} /></span>
            <h2 className="mt-5 text-xl font-black text-gray-900">Không thể tải danh sách</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>
            <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-extrabold text-white hover:bg-primary-700">
              <TripIcon name="refresh" size={16} /> Thử lại
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-gray-200 bg-white px-7 py-14 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-300"><TripIcon name="heart" size={30} /></span>
            <h2 className="mt-6 text-2xl font-black text-gray-900">Danh sách đang chờ những chuyến đi</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Nhấn biểu tượng trái tim tại trang chi tiết để lưu những địa điểm bạn muốn ghé thăm.
            </p>
            <Link to={ROUTES.DESTINATIONS} className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-extrabold text-white shadow-md shadow-primary-200 hover:bg-primary-700 hover:text-white">
              <TripIcon name="compass" size={17} /> Khám phá địa điểm
            </Link>
          </div>
        ) : (
          <>
            <div className="trip-stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favorites.map(({ destination }) => (
                <div key={destination.id} className="relative min-w-0">
                  <DestinationCard destination={destination} />
                  <FavoriteButton
                    destinationId={destination.id}
                    initialIsFavorite
                    className="absolute right-3 top-3 z-10"
                    onChange={(isFavorite) => handleFavoriteChange(destination.id, isFavorite)}
                  />
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Phân trang địa điểm yêu thích">
                <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-sm font-extrabold text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                  <TripIcon name="chevron-left" size={15} /> Trước
                </button>
                <span className="px-2 text-sm font-bold text-gray-500">{pagination.page} / {pagination.totalPages}</span>
                <button type="button" disabled={page >= pagination.totalPages} onClick={() => changePage(page + 1)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-sm font-extrabold text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                  Sau <TripIcon name="chevron-right" size={15} />
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}
