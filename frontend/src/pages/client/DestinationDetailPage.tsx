import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import DestinationGallery from '@/components/destination/DestinationGallery';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import ReviewSection from '@/components/review/ReviewSection';
import TripIcon, { type IconName } from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { destinationService } from '@/services/destination.service';
import type { Destination } from '@/types/destination.types';
import {
  formatTicketPrice,
  formatVisitDuration,
  getDirectionsUrl,
  getMapUrl,
} from '@/utils/destination.utils';
import { getApiErrorMessage } from '@/utils/trip.utils';

const InteractiveItineraryMap = lazy(() => import('@/components/map/InteractiveItineraryMap'));

interface InfoRowProps {
  icon: IconName;
  label: string;
  children: ReactNode;
}

function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="flex gap-3 border-b border-gray-100 py-4 last:border-0">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <TripIcon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">{label}</p>
        <div className="mt-1 text-sm font-semibold leading-6 text-gray-800">{children}</div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container animate-pulse py-10">
      <div className="h-4 w-56 rounded bg-gray-100" />
      <div className="mt-7 h-10 w-2/3 rounded bg-gray-100" />
      <div className="mt-4 h-5 w-1/2 rounded bg-gray-100" />
      <div className="mt-8 aspect-[16/7] rounded-3xl bg-primary-100" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3"><div className="h-7 w-48 rounded bg-gray-100" /><div className="h-4 rounded bg-gray-100" /><div className="h-4 rounded bg-gray-100" /><div className="h-4 w-4/5 rounded bg-gray-100" /></div>
        <div className="h-80 rounded-3xl bg-gray-100" />
      </div>
    </div>
  );
}

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const destinationId = Number(id);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [destinationId]);

  useEffect(() => {
    let active = true;
    const loadDestination = async () => {
      setIsLoading(true);
      setError('');
      setDestination(null);
      if (!Number.isInteger(destinationId) || destinationId <= 0) {
        setError('Mã địa điểm không hợp lệ.');
        setIsLoading(false);
        return;
      }

      try {
        const result = await destinationService.getDestination(destinationId);
        if (active) setDestination(result);
      } catch (requestError: unknown) {
        if (active) {
          setError(getApiErrorMessage(requestError, 'Không thể tải thông tin địa điểm.'));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadDestination();
    return () => { active = false; };
  }, [destinationId, retryKey]);

  const refreshDestination = useCallback(async () => {
    if (!Number.isInteger(destinationId) || destinationId <= 0) return;
    try {
      const result = await destinationService.getDestination(destinationId);
      setDestination(result);
    } catch {
      // Review đã lưu thành công; giữ nội dung hiện tại nếu lần làm mới rating tạm thời lỗi.
    }
  }, [destinationId]);

  const mapStops = useMemo(() => destination ? [{
    id: destination.id,
    name: destination.name,
    address: destination.address,
    latitude: destination.latitude,
    longitude: destination.longitude,
  }] : [], [destination]);

  if (isLoading) return <DetailSkeleton />;

  if (error || !destination) {
    return (
      <div className="container flex min-h-[34rem] items-center justify-center py-16">
        <div className="max-w-lg rounded-3xl border border-gray-100 bg-white px-7 py-12 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-error"><TripIcon name="alert-circle" size={26} /></span>
          <h1 className="mt-5 text-2xl font-black text-gray-900">Không tìm thấy địa điểm</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">{error || 'Địa điểm không tồn tại hoặc đã ngừng hoạt động.'}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to={ROUTES.DESTINATIONS} className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 hover:text-primary-700">
              <TripIcon name="arrow-left" size={16} /> Về trang khám phá
            </Link>
            {Number.isInteger(destinationId) && destinationId > 0 && (
              <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700">
                <TripIcon name="refresh" size={16} /> Thử lại
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const rating = Number(destination.rating);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white pb-20">
      <div className="container pt-7 sm:pt-9">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500" aria-label="Đường dẫn trang">
          <Link to={ROUTES.HOME} className="text-gray-500 hover:text-primary-700">Trang chủ</Link>
          <TripIcon name="chevron-right" size={13} />
          <Link to={ROUTES.DESTINATIONS} className="text-gray-500 hover:text-primary-700">Khám phá</Link>
          <TripIcon name="chevron-right" size={13} />
          <span className="max-w-52 truncate text-gray-800" aria-current="page">{destination.name}</span>
        </nav>

        <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              {destination.categories.map((category) => (
                <Link
                  key={category.id}
                  to={`${ROUTES.DESTINATIONS}?categoryId=${category.id}`}
                  className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-extrabold text-primary-700 hover:bg-primary-100"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">{destination.name}</h1>
            <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm leading-6 text-gray-500 sm:text-base">
              <TripIcon name="map-pin" size={18} className="mt-0.5 flex-none text-primary-500" />
              {destination.address}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FavoriteButton destinationId={destination.id} showLabel />
            {rating > 0 && (
              <a href="#reviews" className="flex w-fit items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-gray-900 hover:text-gray-900">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning text-white shadow-md shadow-amber-200">
                  <TripIcon name="star" size={20} className="fill-white" />
                </span>
                <div><p className="text-xl font-black text-gray-900">{rating.toFixed(1)}</p><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Đánh giá</p></div>
              </a>
            )}
          </div>
        </header>

        <div className="mt-8">
          <DestinationGallery destinationName={destination.name} images={destination.images} />
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-12">
          <div className="space-y-10">
            <section>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-600">Về địa điểm</p>
              <h2 className="mt-2 text-2xl font-black text-gray-900">Trải nghiệm tại {destination.name}</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                {destination.description ?? 'Thông tin mô tả cho địa điểm này đang được cập nhật.'}
              </p>
            </section>

            <section>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary-600">Vị trí</p>
                  <h2 className="mt-2 text-2xl font-black text-gray-900">Xem trên bản đồ</h2>
                </div>
                <a
                  href={getMapUrl(destination)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-extrabold text-primary-700"
                >
                  Mở OpenStreetMap <TripIcon name="external-link" size={15} />
                </a>
              </div>
              <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl border border-gray-100 bg-primary-50" role="status" aria-label="Đang tải bản đồ" />}>
                <InteractiveItineraryMap
                  stops={mapStops}
                  routeEnabled={false}
                  showSummary={false}
                  height="20rem"
                  maxFitZoom={16}
                  title={`Vị trí ${destination.name}`}
                  ariaLabel={`Bản đồ vị trí ${destination.name}`}
                />
              </Suspense>
            </section>
          </div>

          <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-gray-900/5 lg:sticky lg:top-24">
            <h2 className="text-lg font-black text-gray-900">Thông tin tham quan</h2>
            <div className="mt-2">
              <InfoRow icon="map-pin" label="Địa chỉ">{destination.address}</InfoRow>
              <InfoRow icon="wallet" label="Giá vé">
                <span className={Number(destination.ticketPrice) > 0 ? '' : 'text-success'}>{formatTicketPrice(destination.ticketPrice)}</span>
              </InfoRow>
              <InfoRow icon="clock" label="Giờ mở cửa">{destination.openingHoursNote ?? 'Đang cập nhật'}</InfoRow>
              <InfoRow icon="walk" label="Thời gian gợi ý">{formatVisitDuration(destination.visitDuration)}</InfoRow>
              {destination.phoneNumber && (
                <InfoRow icon="info" label="Liên hệ">
                  <a href={`tel:${destination.phoneNumber}`} className="text-gray-800 hover:text-primary-700">{destination.phoneNumber}</a>
                </InfoRow>
              )}
            </div>

            <a
              href={getDirectionsUrl(destination)}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-primary-200 transition hover:-translate-y-0.5 hover:bg-primary-700 hover:text-white"
            >
              <TripIcon name="route" size={18} /> Chỉ đường đến đây
            </a>
            <p className="mt-3 text-center text-[11px] leading-5 text-gray-400">Mở Google Maps trong tab mới với tọa độ chính xác của địa điểm.</p>
          </aside>
        </div>

        <ReviewSection
          destinationId={destination.id}
          destinationName={destination.name}
          averageRating={rating}
          onReviewChanged={refreshDestination}
        />
      </div>
    </div>
  );
}
