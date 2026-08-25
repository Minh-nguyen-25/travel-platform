import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TripIcon, { type IconName } from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { tripService } from '@/services/trip.service';
import type { PublicItinerary, PublicTrip } from '@/types/trip.types';
import {
  formatCurrency,
  formatDate,
  formatDateRange,
  formatTime,
  getApiErrorMessage,
  getTravelModeLabel,
  getTripDuration,
} from '@/utils/trip.utils';

const travelIcon = (mode: PublicItinerary['travelMode']): IconName => ({
  WALKING: 'walk', DRIVING: 'car', TRANSIT: 'bus', CYCLING: 'bike',
} as const)[mode ?? 'WALKING'];

const primaryImage = (itinerary: PublicItinerary): string | null =>
  itinerary.destination.images.find((image) => image.isPrimary)?.imageUrl ??
  itinerary.destination.images[0]?.imageUrl ?? null;

function SharedSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="h-[430px] animate-pulse bg-primary-100" />
      <div className="container -mt-12 space-y-6"><div className="h-24 animate-pulse rounded-2xl bg-white shadow-sm" />{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl bg-white shadow-sm" />)}</div>
    </div>
  );
}

function SharedStop({ itinerary, index }: { itinerary: PublicItinerary; index: number }) {
  const imageUrl = primaryImage(itinerary);
  return (
    <div className="grid grid-cols-[54px_minmax(0,1fr)] gap-4 sm:grid-cols-[70px_minmax(0,1fr)]">
      <div className="pt-5 text-right"><p className="text-sm font-extrabold text-gray-900">{formatTime(itinerary.startTime) || '--:--'}</p>{itinerary.endTime && <p className="mt-1 text-[10px] text-gray-400">{formatTime(itinerary.endTime)}</p>}</div>
      <div className="relative">
        <span className="absolute -left-[25px] top-6 z-10 flex h-5 w-5 items-center justify-center rounded-full border-[5px] border-white bg-primary-600 shadow ring-2 ring-primary-100" />
        <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-primary-100 hover:shadow-md">
          <div className="flex flex-col sm:flex-row">
            <div className="relative h-40 flex-none overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 sm:h-auto sm:w-48">
              {imageUrl ? <img src={imageUrl} alt={itinerary.destination.name} className="h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><TripIcon name="map-pin" size={28} className="text-primary-300" /></div>}
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-gray-800 shadow-sm">Điểm {index + 1}</span>
            </div>
            <div className="min-w-0 flex-1 p-5">
              <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-extrabold text-gray-900">{itinerary.destination.name}</h3>{Number(itinerary.destination.rating) > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-1 text-[11px] font-bold text-accent-600"><TripIcon name="star" size={12} className="text-warning" />{Number(itinerary.destination.rating).toFixed(1)}</span>}</div>
              <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-gray-500"><TripIcon name="map-pin" size={14} className="mt-0.5 flex-none" />{itinerary.destination.address}</p>
              {itinerary.destination.categories.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{itinerary.destination.categories.slice(0, 3).map((category) => <span key={category.id} className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">{category.name}</span>)}</div>}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-100 pt-3 text-xs font-semibold text-gray-600"><span className="inline-flex items-center gap-1.5"><TripIcon name="clock" size={14} className="text-primary-500" />{itinerary.destination.visitDuration ? `${itinerary.destination.visitDuration} phút` : 'Linh hoạt'}</span><span className="inline-flex items-center gap-1.5"><TripIcon name="wallet" size={14} className="text-accent-500" />{Number(itinerary.estimatedCost) > 0 ? formatCurrency(itinerary.estimatedCost) : 'Chưa có chi phí'}</span></div>
              {itinerary.note && <p className="mt-3 rounded-lg bg-primary-50 px-3 py-2 text-xs leading-5 text-primary-800">{itinerary.note}</p>}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function SharedTripPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [trip, setTrip] = useState<PublicTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(1);
  const [copied, setCopied] = useState(false);

  const loadTrip = useCallback(async () => {
    if (!/^[a-f0-9]{64}$/.test(token)) {
      setError('Liên kết chia sẻ không hợp lệ hoặc đã bị cắt ngắn.'); setIsLoading(false); return;
    }
    setIsLoading(true); setError('');
    try {
      const data = await tripService.getSharedTrip(token);
      setTrip(data); setActiveDay(data.tripDays[0]?.dayNumber ?? 1);
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, 'Liên kết này không còn khả dụng. Chủ chuyến đi có thể đã thu hồi quyền chia sẻ.'));
    } finally { setIsLoading(false); }
  }, [token]);

  useEffect(() => { void loadTrip(); }, [loadTrip]);

  const totalStops = useMemo(() => trip?.tripDays.reduce((sum, day) => sum + day.itineraries.length, 0) ?? 0, [trip]);
  const coverImage = trip?.tripDays.flatMap((day) => day.itineraries).map(primaryImage).find((image): image is string => Boolean(image)) ?? null;

  const scrollToDay = (dayNumber: number) => {
    setActiveDay(dayNumber);
    document.getElementById(`shared-day-${dayNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };

  const shareTrip = async () => {
    if (!trip) return;
    if (navigator.share) {
      try { await navigator.share({ title: trip.name, text: `Cùng xem lịch trình ${trip.name}`, url: window.location.href }); } catch { /* dismissed */ }
    } else { await copyLink(); }
  };

  if (isLoading) return <SharedSkeleton />;
  if (!trip || error) {
    return (
      <div className="trip-page-bg flex min-h-[72vh] items-center justify-center px-4 py-16">
        <div className="max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl shadow-gray-200/60 sm:p-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"><TripIcon name="unlink" size={28} /></div><h1 className="mt-5 text-2xl font-extrabold text-gray-900">Liên kết không còn khả dụng</h1><p className="mt-3 text-sm leading-6 text-gray-500">{error || 'Không tìm thấy chuyến đi được chia sẻ.'}</p><div className="mt-6 flex justify-center gap-3"><Link to={ROUTES.HOME} className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50"><TripIcon name="arrow-left" size={16} />Về trang chủ</Link><button type="button" onClick={() => void loadTrip()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700"><TripIcon name="refresh" size={16} />Thử lại</button></div></div>
      </div>
    );
  }

  const budget = Number(trip.budget ?? 0);
  const spent = Number(trip.totalEstimatedCost ?? 0);

  return (
    <div className="trip-page-bg min-h-screen pb-20">
      <section className="relative min-h-[420px] overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white">
        {coverImage && <img src={coverImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/65 to-primary-800/30" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="container relative flex min-h-[420px] flex-col justify-end pb-16 pt-12">
          <div className="trip-print-hide mb-auto flex items-center justify-between gap-4"><Link to={ROUTES.HOME} className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-primary-100"><TripIcon name="globe" size={17} />TravelPlatform</Link><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">Lịch trình được chia sẻ</span></div>
          <div className="max-w-3xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-100"><TripIcon name="map-pin" size={15} />{trip.destinationCity}</p><h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">{trip.name}</h1>{trip.description && <p className="mt-4 max-w-2xl text-sm leading-6 text-primary-100 sm:text-base">{trip.description}</p>}<div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-primary-50"><span className="inline-flex items-center gap-2"><TripIcon name="calendar" size={17} />{formatDateRange(trip.startDate, trip.endDate)}</span><span className="inline-flex items-center gap-2"><TripIcon name="users" size={17} />{trip.numberOfPeople} người</span><span className="inline-flex items-center gap-2"><TripIcon name="route" size={17} />{totalStops} điểm dừng</span></div></div>
        </div>
      </section>

      <main className="container relative -mt-9">
        <div className="trip-print-hide flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-200/60 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><TripIcon name="eye" size={19} /></span><div><p className="text-sm font-extrabold text-gray-900">Bạn đang xem bản chỉ đọc</p><p className="text-xs text-gray-500">Lịch trình luôn đồng bộ với chủ chuyến đi.</p></div></div>
          <div className="flex gap-2"><button type="button" onClick={() => void copyLink()} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-xs font-bold text-gray-700 hover:bg-gray-50 sm:flex-none"><TripIcon name={copied ? 'check' : 'copy'} size={15} />{copied ? 'Đã sao chép' : 'Sao chép link'}</button><button type="button" onClick={() => void shareTrip()} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-xs font-bold text-white hover:bg-primary-700 sm:flex-none"><TripIcon name="share" size={15} />Chia sẻ</button><button type="button" onClick={() => window.print()} className="hidden h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 sm:flex" aria-label="In lịch trình"><TripIcon name="printer" size={16} /></button></div>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
          <aside className="trip-print-hide lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"><p className="px-2 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Các ngày</p><div className="flex gap-2 overflow-x-auto lg:flex-col">{trip.tripDays.map((day) => <button type="button" key={day.dayNumber} onClick={() => scrollToDay(day.dayNumber)} className={`min-w-[130px] rounded-xl px-3 py-3 text-left transition lg:min-w-0 ${activeDay === day.dayNumber ? 'bg-primary-600 text-white shadow-md shadow-primary-200' : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'}`}><span className={`block text-[10px] font-extrabold uppercase tracking-wider ${activeDay === day.dayNumber ? 'text-primary-100' : 'text-gray-400'}`}>Ngày {day.dayNumber}</span><span className="mt-1 block text-xs font-bold capitalize">{formatDate(day.date, { weekday: 'short', day: '2-digit', month: '2-digit' })}</span><span className={`mt-1 block text-[10px] ${activeDay === day.dayNumber ? 'text-primary-100' : 'text-gray-400'}`}>{day.itineraries.length} điểm dừng</span></button>)}</div></div>
          </aside>

          <div className="min-w-0 space-y-10">
            {trip.tripDays.map((day) => (
              <section key={day.dayNumber} id={`shared-day-${day.dayNumber}`} className="trip-print-section scroll-mt-28">
                <div className="mb-5"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-600">Ngày {day.dayNumber}</p><h2 className="mt-1 text-2xl font-extrabold capitalize text-gray-900">{formatDate(day.date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</h2>{day.note && <p className="mt-2 text-sm text-gray-500">{day.note}</p>}</div>
                {day.itineraries.length > 0 ? <div>{day.itineraries.map((itinerary, index) => <div key={`${day.dayNumber}-${itinerary.sequenceOrder}`}><SharedStop itinerary={itinerary} index={index} />{index < day.itineraries.length - 1 && <div className="ml-[71px] flex min-h-12 items-center border-l-2 border-dashed border-primary-200 pl-5 sm:ml-[87px]"><span className="-ml-8 mr-3 flex h-6 w-6 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-primary-600"><TripIcon name={travelIcon(day.itineraries[index + 1].travelMode)} size={13} /></span><p className="text-xs font-medium text-gray-500">{getTravelModeLabel(day.itineraries[index + 1].travelMode)}{day.itineraries[index + 1].travelDurationMinutes ? ` · ${day.itineraries[index + 1].travelDurationMinutes} phút` : ''}{day.itineraries[index + 1].travelDistanceKm ? ` · ${Number(day.itineraries[index + 1].travelDistanceKm).toLocaleString('vi-VN')} km` : ''}</p></div>}</div>)}</div> : <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center"><TripIcon name="compass" size={25} className="mx-auto text-gray-300" /><p className="mt-3 text-sm font-bold text-gray-700">Ngày này chưa có điểm dừng</p></div>}
              </section>
            ))}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Tổng quan chuyến đi</p><div className="mt-4 space-y-3 text-xs"><div className="flex items-center justify-between"><span className="text-gray-500">Thời lượng</span><span className="font-extrabold text-gray-900">{getTripDuration(trip.startDate, trip.endDate)} ngày</span></div><div className="flex items-center justify-between"><span className="text-gray-500">Điểm dừng</span><span className="font-extrabold text-gray-900">{totalStops}</span></div><div className="flex items-center justify-between"><span className="text-gray-500">Người tham gia</span><span className="font-extrabold text-gray-900">{trip.numberOfPeople}</span></div></div></div>
            <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm"><div className="bg-primary-600 px-5 py-4 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-primary-100">Chi phí dự kiến</p><p className="mt-2 text-xl font-extrabold text-white">{formatCurrency(spent)}</p></div><div className="p-5 text-xs"><div className="flex justify-between"><span className="text-gray-500">Ngân sách</span><span className="font-bold text-gray-800">{budget > 0 ? formatCurrency(budget) : 'Chưa đặt'}</span></div>{budget > 0 && <><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${spent > budget ? 'bg-error' : 'bg-primary-500'}`} style={{ width: `${Math.min(100, (spent / budget) * 100)}%` }} /></div><div className="mt-3 flex justify-between"><span className="text-gray-500">Còn lại</span><span className={`font-bold ${spent > budget ? 'text-error' : 'text-success'}`}>{formatCurrency(budget - spent)}</span></div></>}</div></div>
            <div className="trip-print-hide rounded-2xl bg-gradient-to-br from-primary-800 to-primary-600 p-5 text-white"><TripIcon name="sparkles" size={20} className="text-primary-100" /><p className="mt-3 text-sm font-extrabold text-white">Tạo hành trình của riêng bạn</p><p className="mt-1 text-xs leading-5 text-primary-100">Lưu điểm đến, kéo thả timeline và chia sẻ chỉ trong vài bước.</p><Link to={ROUTES.REGISTER} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-white hover:text-primary-100">Bắt đầu miễn phí <TripIcon name="arrow-right" size={14} /></Link></div>
          </aside>
        </div>
      </main>
    </div>
  );
}
