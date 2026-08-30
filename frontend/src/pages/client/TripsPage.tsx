import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditorialPageHero from '@/components/common/EditorialPageHero';
import Modal from '@/components/common/Modal';
import CreateTripModal from '@/components/trip/CreateTripModal';
import TripCard from '@/components/trip/TripCard';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { tripService } from '@/services/trip.service';
import type { TripStatus, TripSummary } from '@/types/trip.types';
import { getApiErrorMessage, getTripStatus } from '@/utils/trip.utils';

type StatusFilter = 'all' | TripStatus;
type Toast = { tone: 'success' | 'error'; message: string };

const filterLabels: Record<StatusFilter, string> = {
  all: 'Tất cả', upcoming: 'Sắp tới', ongoing: 'Đang đi', completed: 'Đã qua',
};

function TripGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-44 animate-pulse bg-primary-100" />
          <div className="space-y-4 p-5"><div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" /><div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" /><div className="h-16 animate-pulse rounded-xl bg-gray-50" /><div className="h-10 animate-pulse rounded-xl bg-gray-100" /></div>
        </div>
      ))}
    </div>
  );
}

export default function TripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TripSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sharingId, setSharingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const loadTrips = useCallback(async () => {
    setIsLoading(true); setError('');
    try {
      const result = await tripService.getTrips({ page: 1, limit: 100 });
      setTrips(result.data);
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, 'Không thể tải danh sách chuyến đi.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadTrips(); }, [loadTrips]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const counts = useMemo(() => trips.reduce<Record<StatusFilter, number>>((result, trip) => {
    result.all += 1; result[getTripStatus(trip)] += 1; return result;
  }, { all: 0, upcoming: 0, ongoing: 0, completed: 0 }), [trips]);

  const visibleTrips = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN');
    return trips.filter((trip) => {
      const matchesStatus = statusFilter === 'all' || getTripStatus(trip) === statusFilter;
      const matchesQuery = !normalizedQuery || `${trip.name} ${trip.destinationCity}`.toLocaleLowerCase('vi-VN').includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, trips]);

  const copyShareLink = async (trip: TripSummary) => {
    setSharingId(trip.id);
    try {
      const token = trip.isPublic && trip.shareToken
        ? trip.shareToken
        : (await tripService.enableShare(trip.id)).shareToken;
      const url = `${window.location.origin}${ROUTES.SHARED_TRIP(token)}`;
      await navigator.clipboard.writeText(url);
      setTrips((current) => current.map((item) => item.id === trip.id ? { ...item, isPublic: true, shareToken: token } : item));
      setToast({ tone: 'success', message: 'Đã sao chép link chia sẻ.' });
    } catch (requestError: unknown) {
      setToast({ tone: 'error', message: getApiErrorMessage(requestError, 'Không thể tạo link chia sẻ.') });
    } finally {
      setSharingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await tripService.deleteTrip(pendingDelete.id);
      setTrips((current) => current.filter((trip) => trip.id !== pendingDelete.id));
      setPendingDelete(null);
      setToast({ tone: 'success', message: 'Đã xóa chuyến đi.' });
    } catch (requestError: unknown) {
      setToast({ tone: 'error', message: getApiErrorMessage(requestError, 'Không thể xóa chuyến đi.') });
    } finally {
      setIsDeleting(false);
    }
  };

  const publicCount = trips.filter((trip) => trip.isPublic).length;

  return (
    <div className="trip-page-bg min-h-screen pb-20">
      <EditorialPageHero
        eyebrow="Không gian hành trình của bạn"
        title={<>Chuyến đi của <span className="text-accent-300">tôi.</span></>}
        description="Từ ý tưởng đầu tiên đến từng điểm dừng — mọi hành trình đáng nhớ đều bắt đầu ở đây."
        image="/images/vietnam-dalat-roadtrip.jpg"
        imageAlt="Du khách xem bản đồ bên cung đường xuyên rừng thông Đà Lạt"
        icon="suitcase"
        motion="drift"
        imagePosition="object-[64%_50%]"
        compact
        aside={(
          <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex h-12 w-fit items-center gap-2 rounded-2xl bg-accent-500 px-5 text-sm font-extrabold text-white shadow-xl shadow-navy-950/25 transition hover:-translate-y-1 hover:bg-accent-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15"><TripIcon name="plus" size={17} /></span>
            Tạo chuyến đi mới
          </button>
        )}
      >
          <div className="grid max-w-2xl grid-cols-3 gap-3">
            {[
              { icon: 'suitcase' as const, value: trips.length, label: 'Tổng chuyến đi' },
              { icon: 'calendar' as const, value: counts.upcoming + counts.ongoing, label: 'Sắp diễn ra' },
              { icon: 'share' as const, value: publicCount, label: 'Đang chia sẻ' },
            ].map(({ icon, value, label }) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-3 shadow-sm backdrop-blur-md sm:flex sm:items-center sm:gap-3 sm:p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12 text-primary-100"><TripIcon name={icon} size={17} /></span>
                <div className="mt-2 sm:mt-0"><p className="text-xl font-black text-white">{value}</p><p className="text-[10px] font-semibold text-white/58 sm:text-xs">{label}</p></div>
              </div>
            ))}
          </div>
      </EditorialPageHero>

      <main className="container py-9">
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {(Object.keys(filterLabels) as StatusFilter[]).map((filter) => (
              <button type="button" key={filter} onClick={() => setStatusFilter(filter)} className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${statusFilter === filter ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:bg-primary-50 hover:text-primary-700'}`}>
                {filterLabels[filter]} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${statusFilter === filter ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-400'}`}>{counts[filter]}</span>
              </button>
            ))}
          </div>
          <label className="relative block sm:w-72">
            <TripIcon name="search" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm chuyến đi, thành phố..." className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-9 text-xs outline-none transition focus:border-primary-300 focus:bg-white focus:ring-4 focus:ring-primary-50" />
            {query && <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label="Xóa tìm kiếm"><TripIcon name="x" size={14} /></button>}
          </label>
        </div>

        <div className="mt-7">
          {isLoading ? <TripGridSkeleton /> : error ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-error"><TripIcon name="alert-circle" size={25} /></div><h2 className="mt-4 text-lg font-extrabold text-gray-900">Chưa thể tải chuyến đi</h2><p className="mt-2 text-sm text-gray-500">{error}</p><button type="button" onClick={() => void loadTrips()} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700"><TripIcon name="refresh" size={16} />Thử lại</button></div>
          ) : visibleTrips.length > 0 ? (
            <div className="trip-stagger grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{visibleTrips.map((trip) => <div key={trip.id} className={sharingId === trip.id ? 'pointer-events-none opacity-70' : ''}><TripCard trip={trip} onDelete={setPendingDelete} onShare={copyShareLink} /></div>)}</div>
          ) : trips.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-primary-200 bg-white px-6 py-16 text-center"><div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary-50" /><div className="relative"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-200"><TripIcon name="plane" size={28} /></div><h2 className="mt-5 text-2xl font-extrabold text-gray-900">Hành trình đầu tiên đang chờ</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Tạo một chuyến đi, chọn ngày và bắt đầu xếp những địa điểm bạn muốn khám phá.</p><button type="button" onClick={() => setIsCreateOpen(true)} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-bold text-white shadow-lg shadow-primary-200 hover:bg-primary-700"><TripIcon name="plus" size={17} />Tạo chuyến đi đầu tiên</button></div></div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center"><TripIcon name="search" size={28} className="mx-auto text-gray-300" /><h2 className="mt-4 text-lg font-extrabold text-gray-900">Không tìm thấy chuyến đi phù hợp</h2><p className="mt-2 text-sm text-gray-500">Thử đổi từ khóa hoặc trạng thái.</p><button type="button" onClick={() => { setQuery(''); setStatusFilter('all'); }} className="mt-4 text-sm font-bold text-primary-600 hover:text-primary-700">Xóa bộ lọc</button></div>
          )}
        </div>
      </main>

      <CreateTripModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreated={(created) => { setIsCreateOpen(false); navigate(ROUTES.TRIP_DETAIL(created.id)); }} />
      <Modal isOpen={pendingDelete !== null} onClose={() => !isDeleting && setPendingDelete(null)} title="Xóa chuyến đi?" size="sm" closeOnBackdrop={!isDeleting}>
        <div className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-error"><TripIcon name="trash" size={21} /></div><p className="mt-4 text-sm leading-6 text-gray-600">Bạn sắp xóa <strong className="font-bold text-gray-900">{pendingDelete?.name}</strong> cùng toàn bộ lịch trình. Thao tác này không thể hoàn tác.</p><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => setPendingDelete(null)} disabled={isDeleting} className="h-10 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50">Giữ lại</button><button type="button" onClick={() => void confirmDelete()} disabled={isDeleting} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-error text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"><TripIcon name={isDeleting ? 'loader' : 'trash'} size={15} className={isDeleting ? 'animate-spin' : ''} />{isDeleting ? 'Đang xóa...' : 'Xóa chuyến đi'}</button></div></div>
      </Modal>
      {toast && <div className={`trip-toast fixed bottom-6 right-4 z-[60] flex max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl sm:right-6 ${toast.tone === 'success' ? 'border-primary-100' : 'border-red-100'}`} role="status"><span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${toast.tone === 'success' ? 'bg-primary-50 text-success' : 'bg-red-50 text-error'}`}><TripIcon name={toast.tone === 'success' ? 'check' : 'alert-circle'} size={16} /></span><p className="text-sm font-semibold text-gray-700">{toast.message}</p><button type="button" onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-700" aria-label="Đóng"><TripIcon name="x" size={14} /></button></div>}
    </div>
  );
}
