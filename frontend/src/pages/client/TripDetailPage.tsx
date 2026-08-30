import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AddPlaceModal from '@/components/trip/AddPlaceModal';
import EditorialPageHero from '@/components/common/EditorialPageHero';
import Modal from '@/components/common/Modal';
import ShareTripModal from '@/components/trip/ShareTripModal';
import TripIcon from '@/components/trip/TripIcon';
import TripTimeline from '@/components/trip/TripTimeline';
import { ROUTES } from '@/constants';
import { tripService } from '@/services/trip.service';
import type { Itinerary, TripDetail } from '@/types/trip.types';
import { formatCurrency, formatDateRange, getApiErrorMessage } from '@/utils/trip.utils';

type Toast = { tone: 'success' | 'error'; message: string };

const dayFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
});
const shortDayFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC',
});
const parseDateOnly = (value: string) => new Date(`${value}T00:00:00.000Z`);

const inclusiveDates = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  for (
    let current = parseDateOnly(startDate);
    current <= parseDateOnly(endDate);
    current = new Date(current.getTime() + 86_400_000)
  ) {
    dates.push(current.toISOString().slice(0, 10));
  }
  return dates;
};

function PlannerSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="h-72 animate-pulse bg-gradient-to-br from-primary-100 to-primary-50" />
      <div className="container -mt-16 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-white shadow-sm" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
      </div>
    </div>
  );
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Itinerary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitializingDays, setIsInitializingDays] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const loadTrip = useCallback(async (showSkeleton = false) => {
    if (!Number.isInteger(tripId) || tripId <= 0) {
      setPageError('Mã chuyến đi không hợp lệ.');
      setIsLoading(false);
      return;
    }
    if (showSkeleton) setIsLoading(true);
    setPageError('');
    try {
      const data = await tripService.getTrip(tripId);
      setTrip(data);
      setSelectedDayId((current) => {
        if (current && data.tripDays.some((day) => day.id === current)) return current;
        return data.tripDays[0]?.id ?? null;
      });
    } catch (error: unknown) {
      setPageError(getApiErrorMessage(error, 'Không thể tải lịch trình chuyến đi.'));
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => { void loadTrip(true); }, [loadTrip]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedDay = useMemo(
    () => trip?.tripDays.find((day) => day.id === selectedDayId) ?? null,
    [selectedDayId, trip],
  );
  const totalStops = useMemo(
    () => trip?.tripDays.reduce((total, day) => total + day.itineraries.length, 0) ?? 0,
    [trip],
  );

  const handleReorder = async (itineraryIds: number[]) => {
    if (!selectedDay) return;
    const reordered = await tripService.reorderItineraries(tripId, selectedDay.id, itineraryIds);
    setTrip((current) => current ? {
      ...current,
      tripDays: current.tripDays.map((day) =>
        day.id === selectedDay.id ? { ...day, itineraries: reordered } : day,
      ),
    } : current);
    setToast({ tone: 'success', message: 'Đã lưu thứ tự lịch trình.' });
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !selectedDay) return;
    setIsDeleting(true);
    try {
      await tripService.deleteItinerary(tripId, selectedDay.id, pendingDelete.id);
      setPendingDelete(null);
      await loadTrip();
      setToast({ tone: 'success', message: 'Đã xóa điểm dừng khỏi lịch trình.' });
    } catch (error: unknown) {
      setToast({ tone: 'error', message: getApiErrorMessage(error, 'Không thể xóa điểm dừng.') });
    } finally {
      setIsDeleting(false);
    }
  };

  const initializeDays = async () => {
    if (!trip) return;
    setIsInitializingDays(true);
    try {
      for (const date of inclusiveDates(trip.startDate, trip.endDate)) {
        await tripService.createTripDay(trip.id, { date });
      }
      await loadTrip();
      setToast({ tone: 'success', message: 'Đã khởi tạo các ngày cho lịch trình.' });
    } catch (error: unknown) {
      await loadTrip();
      setToast({ tone: 'error', message: getApiErrorMessage(error, 'Chưa thể khởi tạo đầy đủ lịch trình.') });
    } finally {
      setIsInitializingDays(false);
    }
  };

  if (isLoading) return <PlannerSkeleton />;
  if (!trip || pageError) {
    return (
      <div className="trip-page-bg min-h-[72vh] px-4 py-20">
        <div className="mx-auto max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl shadow-gray-200/60">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <TripIcon name="alert-circle" size={29} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-gray-900">Không mở được chuyến đi</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">{pageError || 'Chuyến đi không tồn tại.'}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to={ROUTES.TRIPS} className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50">
              <TripIcon name="arrow-left" size={16} /> Về My Trips
            </Link>
            <button type="button" onClick={() => void loadTrip(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700">
              <TripIcon name="refresh" size={16} /> Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const budget = Number(trip.budget ?? 0);
  const spent = Number(trip.totalEstimatedCost ?? 0);
  const budgetPercent = budget > 0 ? Math.min(100, Math.max(0, (spent / budget) * 100)) : 0;
  const tripCoverImage = trip.tripDays
    .flatMap((day) => day.itineraries)
    .flatMap((itinerary) => itinerary.destination.images)
    .find((image) => image.isPrimary)?.imageUrl
    ?? trip.tripDays.flatMap((day) => day.itineraries).flatMap((itinerary) => itinerary.destination.images)[0]?.imageUrl
    ?? '/images/vietnam-dalat-roadtrip.jpg';

  return (
    <div className="trip-page-bg min-h-screen pb-20">
      <EditorialPageHero
        eyebrow={trip.destinationCity}
        title={trip.name}
        description={trip.description ?? 'Một hành trình đang được bạn viết tiếp, từng ngày và từng điểm dừng.'}
        image={tripCoverImage}
        imageAlt={`Ảnh đại diện chuyến đi ${trip.name}`}
        icon="route"
        motion="route"
        imagePosition="object-center"
        compact
        aside={(
          <button type="button" onClick={() => setIsShareOpen(true)} className="inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-white px-5 text-sm font-extrabold text-primary-800 shadow-float transition hover:-translate-y-1 hover:bg-primary-50">
            <TripIcon name="share" size={17} /> Chia sẻ chuyến đi
          </button>
        )}
      >
        <Link to={ROUTES.TRIPS} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-100 transition hover:-translate-x-1 hover:text-white">
          <TripIcon name="arrow-left" size={17} /> Chuyến đi của tôi
        </Link>
        <div className="flex flex-wrap gap-2">
          {trip.isAiGenerated && <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-400/20 px-3 py-1.5 text-xs font-bold text-accent-100 backdrop-blur"><TripIcon name="sparkles" size={14} /> AI gợi ý</span>}
          {trip.isPublic && <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-primary-50 backdrop-blur"><TripIcon name="eye" size={14} /> Đang chia sẻ</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-primary-100">
          <span className="inline-flex items-center gap-2"><TripIcon name="calendar" size={17} />{formatDateRange(trip.startDate, trip.endDate)}</span>
          <span className="inline-flex items-center gap-2"><TripIcon name="users" size={17} />{trip.numberOfPeople} người</span>
          <span className="inline-flex items-center gap-2"><TripIcon name="route" size={17} />{totalStops} điểm dừng</span>
        </div>
      </EditorialPageHero>

      <main className="container relative -mt-14">
        {trip.tripDays.length > 0 ? (
          <nav className="rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/60" aria-label="Chọn ngày trong lịch trình">
            <div className="flex gap-2 overflow-x-auto">
              {trip.tripDays.map((day) => {
                const isActive = selectedDayId === day.id;
                return (
                  <button type="button" key={day.id} onClick={() => setSelectedDayId(day.id)} className={`min-w-[138px] flex-1 rounded-xl px-4 py-3 text-left transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'}`}>
                    <span className={`block text-[10px] font-extrabold uppercase tracking-widest ${isActive ? 'text-primary-100' : 'text-gray-400'}`}>Ngày {day.dayNumber}</span>
                    <span className="mt-1 block whitespace-nowrap text-sm font-bold capitalize">{shortDayFormatter.format(parseDateOnly(day.date))}</span>
                    <span className={`mt-1 block text-[11px] font-medium ${isActive ? 'text-primary-100' : 'text-gray-400'}`}>{day.itineraries.length} điểm dừng</span>
                  </button>
                );
              })}
            </div>
          </nav>
        ) : (
          <div className="rounded-3xl border border-primary-100 bg-white p-8 text-center shadow-xl shadow-gray-200/60 sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"><TripIcon name="calendar" size={29} /></div>
            <h2 className="mt-5 text-2xl font-extrabold text-gray-900">Khởi tạo lịch trình theo ngày</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">Tạo tự động các ngày từ {formatDateRange(trip.startDate, trip.endDate)} để bắt đầu thêm địa điểm.</p>
            <button type="button" onClick={() => void initializeDays()} disabled={isInitializingDays} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-bold text-white shadow-lg shadow-primary-200 transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:opacity-60">
              <TripIcon name={isInitializingDays ? 'loader' : 'sparkles'} size={17} className={isInitializingDays ? 'animate-spin' : ''} />
              {isInitializingDays ? 'Đang khởi tạo...' : 'Tạo lịch trình theo ngày'}
            </button>
          </div>
        )}

        {selectedDay && (
          <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_310px]">
            <section className="min-w-0">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-600">Ngày {selectedDay.dayNumber}</p>
                  <h2 className="mt-2 text-2xl font-extrabold capitalize text-gray-900">{dayFormatter.format(parseDateOnly(selectedDay.date))}</h2>
                  {selectedDay.note && <p className="mt-2 text-sm text-gray-500">{selectedDay.note}</p>}
                </div>
                <button type="button" onClick={() => setIsAddPlaceOpen(true)} className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-bold text-white shadow-md shadow-primary-200 transition hover:-translate-y-0.5 hover:bg-primary-700">
                  <TripIcon name="plus" size={16} /> Thêm địa điểm
                </button>
              </div>
              <TripTimeline
                day={selectedDay}
                isMutating={isDeleting}
                onAdd={() => setIsAddPlaceOpen(true)}
                onDelete={(itinerary) => setPendingDelete(itinerary)}
                onReorder={handleReorder}
                onReorderError={(message) => setToast({ tone: 'error', message })}
              />
            </section>

            <aside className="space-y-5 lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-5 py-4 text-white">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-primary-100">Ngân sách chuyến đi</p><TripIcon name="wallet" size={18} className="text-primary-100" /></div>
                  <p className="mt-2 text-2xl font-extrabold text-white">{budget > 0 ? formatCurrency(budget) : 'Chưa đặt'}</p>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs"><span className="font-medium text-gray-500">Đã dự kiến</span><span className="font-extrabold text-gray-900">{formatCurrency(spent)}</span></div>
                  {budget > 0 && (
                    <>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full transition-all duration-700 ${spent > budget ? 'bg-error' : 'bg-primary-500'}`} style={{ width: `${budgetPercent}%` }} /></div>
                      <div className="mt-3 flex items-center justify-between text-xs"><span className="text-gray-500">Còn lại</span><span className={`font-bold ${spent > budget ? 'text-error' : 'text-success'}`}>{formatCurrency(budget - spent)}</span></div>
                    </>
                  )}
                  <div className="mt-5 border-t border-gray-100 pt-4"><div className="flex items-center justify-between text-xs"><span className="text-gray-500">Riêng ngày {selectedDay.dayNumber}</span><span className="font-bold text-gray-800">{formatCurrency(selectedDay.totalEstimatedCost)}</span></div></div>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Tổng quan</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-primary-50 p-3"><TripIcon name="calendar" size={17} className="text-primary-600" /><p className="mt-3 text-xl font-extrabold text-gray-900">{trip.tripDays.length}</p><p className="text-[11px] font-medium text-gray-500">ngày có lịch</p></div>
                  <div className="rounded-xl bg-accent-50 p-3"><TripIcon name="map-pin" size={17} className="text-accent-500" /><p className="mt-3 text-xl font-extrabold text-gray-900">{totalStops}</p><p className="text-[11px] font-medium text-gray-500">điểm dừng</p></div>
                </div>
                {trip.description && <div className="mt-4 border-t border-gray-100 pt-4"><p className="text-xs font-bold text-gray-700">Ghi chú chuyến đi</p><p className="mt-2 line-clamp-4 text-xs leading-5 text-gray-500">{trip.description}</p></div>}
              </div>
              <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4"><div className="flex gap-3"><span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm"><TripIcon name="info" size={17} /></span><p className="text-xs leading-5 text-primary-800">Kéo thả chỉ thay đổi thứ tự trong ngày đang chọn. Dữ liệu được lưu ngay sau khi thả.</p></div></div>
            </aside>
          </div>
        )}
      </main>

      <AddPlaceModal isOpen={isAddPlaceOpen} tripId={trip.id} day={selectedDay} onClose={() => setIsAddPlaceOpen(false)} onAdded={async () => { await loadTrip(); setToast({ tone: 'success', message: 'Đã thêm địa điểm vào lịch trình.' }); }} />
      <ShareTripModal isOpen={isShareOpen} tripId={trip.id} tripName={trip.name} isPublic={trip.isPublic} shareToken={trip.shareToken} onClose={() => setIsShareOpen(false)} onChanged={(state) => { setTrip((current) => current ? { ...current, ...state } : current); setToast({ tone: 'success', message: state.isPublic ? 'Đã bật chia sẻ công khai.' : 'Đã thu hồi liên kết chia sẻ.' }); }} />

      <Modal isOpen={pendingDelete !== null} onClose={() => !isDeleting && setPendingDelete(null)} title="Xóa điểm dừng?" size="sm" closeOnBackdrop={!isDeleting}>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"><TripIcon name="trash" size={21} /></div>
          <p className="mt-4 text-sm leading-6 text-gray-600"><strong className="font-bold text-gray-900">{pendingDelete?.destination.name}</strong> sẽ bị xóa khỏi ngày này.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setPendingDelete(null)} disabled={isDeleting} className="h-10 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Giữ lại</button>
            <button type="button" onClick={() => void confirmDelete()} disabled={isDeleting} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-error text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"><TripIcon name={isDeleting ? 'loader' : 'trash'} size={15} className={isDeleting ? 'animate-spin' : ''} />{isDeleting ? 'Đang xóa...' : 'Xóa điểm dừng'}</button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className={`trip-toast fixed bottom-6 right-4 z-[60] flex max-w-sm items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl sm:right-6 ${toast.tone === 'success' ? 'border-green-100' : 'border-red-100'}`} role="status">
          <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${toast.tone === 'success' ? 'bg-green-50 text-success' : 'bg-red-50 text-error'}`}><TripIcon name={toast.tone === 'success' ? 'check' : 'alert-circle'} size={16} /></span>
          <p className="text-sm font-semibold text-gray-700">{toast.message}</p>
          <button type="button" onClick={() => setToast(null)} className="ml-1 text-gray-400 hover:text-gray-700" aria-label="Đóng thông báo"><TripIcon name="x" size={15} /></button>
        </div>
      )}
    </div>
  );
}
