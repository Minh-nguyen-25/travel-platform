import { lazy, Suspense, useState } from 'react';
import TripIcon from '@/components/trip/TripIcon';
import type {
  AiItineraryGenerationResult,
  GeneratedItineraryActivity,
} from '@/types/ai.types';
import type { TravelMode } from '@/types/trip.types';
import {
  formatCurrency,
  formatDate,
  getTravelModeLabel,
} from '@/utils/trip.utils';

const InteractiveItineraryMap = lazy(
  () => import('@/components/map/InteractiveItineraryMap'),
);

interface AiItineraryResultProps {
  result: AiItineraryGenerationResult;
  isSaving: boolean;
  saveError: string;
  onEdit: () => void;
  onRegenerate: () => void;
  onSave: () => void;
}

const travelIcon: Record<TravelMode, 'walk' | 'car' | 'bus' | 'bike'> = {
  WALKING: 'walk',
  DRIVING: 'car',
  TRANSIT: 'bus',
  CYCLING: 'bike',
};

function RouteConnector({ activity }: { activity: GeneratedItineraryActivity }) {
  const details = [
    activity.travelDurationMinutes !== null ? `${activity.travelDurationMinutes} phút` : null,
    activity.travelDistanceKm !== null
      ? `${activity.travelDistanceKm.toLocaleString('vi-VN')} km`
      : null,
  ].filter((value): value is string => value !== null);

  return (
    <div className="ml-[17px] flex min-h-11 items-center border-l-2 border-dashed border-primary-200 pl-7 sm:ml-[23px]">
      <span className="-ml-[39px] mr-3 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-primary-600">
        <TripIcon name={travelIcon[activity.travelMode]} size={13} />
      </span>
      <p className="text-[11px] font-semibold text-gray-500">
        {getTravelModeLabel(activity.travelMode)}
        {details.length > 0 && ` · ${details.join(' · ')}`}
      </p>
    </div>
  );
}

function ActivityCard({
  activity,
  index,
}: {
  activity: GeneratedItineraryActivity;
  index: number;
}) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-xs font-black text-white shadow-md shadow-primary-100 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-sm">
        {index + 1}
      </span>
      <article className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-primary-100 hover:shadow-md sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold text-primary-600">
              <TripIcon name="clock" size={14} />
              <time>{activity.startTime}</time>
              <span aria-hidden="true">–</span>
              <time>{activity.endTime}</time>
            </p>
            <h4 className="mt-1.5 text-base font-extrabold text-gray-900 sm:text-lg">
              {activity.destinationName}
            </h4>
            <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-gray-500">
              <TripIcon name="map-pin" size={13} className="mt-0.5 flex-none text-gray-400" />
              {activity.address}
            </p>
          </div>
          <span className="inline-flex w-fit flex-none items-center gap-1.5 rounded-full bg-accent-50 px-2.5 py-1.5 text-xs font-extrabold text-accent-600">
            <TripIcon name="wallet" size={13} />
            {formatCurrency(activity.estimatedCost)}
          </span>
        </div>

        {activity.note && (
          <p className="mt-3 border-t border-gray-100 pt-3 text-sm leading-6 text-gray-600">
            {activity.note}
          </p>
        )}
      </article>
    </div>
  );
}

export default function AiItineraryResult({
  result,
  isSaving,
  saveError,
  onEdit,
  onRegenerate,
  onSave,
}: AiItineraryResultProps) {
  const { itinerary, metadata, tripDraft, warnings } = result;
  const [selectedMapDayNumber, setSelectedMapDayNumber] = useState(
    itinerary.days[0]?.dayNumber ?? 1,
  );
  const selectedMapDay = itinerary.days.find(
    (day) => day.dayNumber === selectedMapDayNumber,
  ) ?? itinerary.days[0];
  const mapTravelMode = selectedMapDay?.activities[1]?.travelMode
    ?? selectedMapDay?.activities[0]?.travelMode
    ?? null;

  return (
    <section aria-labelledby="ai-result-title" className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 px-5 py-7 text-white shadow-xl shadow-primary-200 sm:px-8 sm:py-9">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-white/5" />
        <div className="absolute -bottom-28 left-1/3 h-52 w-52 rounded-full bg-accent-400/15 blur-2xl" />
        <div className="relative">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                <TripIcon name="sparkles" size={14} />
                Gợi ý bởi {metadata.provider === 'openai' ? 'OpenAI' : 'Google Gemini'}
              </span>
              <h2 id="ai-result-title" className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                {itinerary.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-primary-50 sm:text-base">
                {itinerary.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-10 w-fit flex-none items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <TripIcon name="edit" size={15} />
              Chỉnh yêu cầu
            </button>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
              <dt className="text-[10px] font-bold uppercase tracking-normal text-primary-100">Điểm đến</dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-sm font-extrabold">
                <TripIcon name="map-pin" size={15} />{itinerary.destinationCity}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
              <dt className="text-[10px] font-bold uppercase tracking-normal text-primary-100">Thời lượng</dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-sm font-extrabold">
                <TripIcon name="calendar" size={15} />{itinerary.days.length} ngày
              </dd>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
              <dt className="text-[10px] font-bold uppercase tracking-normal text-primary-100">Số người</dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-sm font-extrabold">
                <TripIcon name="users" size={15} />{itinerary.numberOfPeople} người
              </dd>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
              <dt className="text-[10px] font-bold uppercase tracking-normal text-primary-100">Chi phí dự kiến</dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-sm font-extrabold">
                <TripIcon name="wallet" size={15} />{formatCurrency(itinerary.totalEstimatedCost)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5" role="status">
          <div className="flex items-start gap-3">
            <TripIcon name="alert-circle" size={18} className="mt-0.5 flex-none text-warning" />
            <div>
              <p className="text-sm font-extrabold text-amber-900">Một vài chặng chưa có dữ liệu tuyến đường</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-amber-800">
                {warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedMapDay && (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-lg font-extrabold text-gray-900">
                Xem hành trình trên bản đồ
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Chọn từng ngày để xem các điểm dừng và tuyến đường tương ứng.
              </p>
            </div>
            <div
              className="flex max-w-full gap-2 overflow-x-auto pb-1"
              role="group"
              aria-label="Chọn ngày hiển thị trên bản đồ"
            >
              {itinerary.days.map((day) => {
                const selected = day.dayNumber === selectedMapDay.dayNumber;
                return (
                  <button
                    key={day.dayNumber}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedMapDayNumber(day.dayNumber)}
                    className={`h-9 flex-none rounded-xl border px-3 text-xs font-extrabold transition focus:outline-none focus:ring-4 focus:ring-primary-50 ${selected
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:text-primary-700'
                    }`}
                  >
                    Ngày {day.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>

          <Suspense
            fallback={(
              <div
                className="flex h-96 items-center justify-center rounded-3xl border border-gray-100 bg-white text-sm font-bold text-gray-500 shadow-sm"
                role="status"
              >
                <TripIcon name="loader" size={18} className="mr-2 animate-spin text-primary-600" />
                Đang tải bản đồ tương tác...
              </div>
            )}
          >
            <InteractiveItineraryMap
              stops={selectedMapDay.activities}
              travelMode={mapTravelMode}
              height="24rem"
              title={`Bản đồ ngày ${selectedMapDay.dayNumber}: ${selectedMapDay.theme}`}
              ariaLabel={`Bản đồ tương tác cho ngày ${selectedMapDay.dayNumber}`}
            />
          </Suspense>
        </div>
      )}

      <div className="space-y-5">
        {itinerary.days.map((day) => (
          <article key={day.dayNumber} className="overflow-hidden rounded-3xl border border-gray-100 bg-gray-50/70 shadow-sm">
            <header className="flex flex-col gap-3 border-b border-gray-100 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 flex-none flex-col items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                  <span className="text-[9px] font-bold uppercase">Ngày</span>
                  <span className="text-lg font-black leading-none">{day.dayNumber}</span>
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">{day.theme}</h3>
                  {day.date && (
                    <p className="mt-0.5 text-xs font-semibold text-gray-500">
                      {formatDate(day.date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-extrabold text-gray-600">
                {day.activities.length} điểm · {formatCurrency(day.estimatedCost)}
              </span>
            </header>

            <div className="px-4 py-5 sm:px-7 sm:py-6">
              {day.note && (
                <p className="mb-5 rounded-xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-xs leading-5 text-primary-800">
                  {day.note}
                </p>
              )}
              <ol>
                {day.activities.map((activity, index) => (
                  <li
                    key={`${day.dayNumber}-${activity.destinationId}-${activity.sequenceOrder}`}
                    className="list-none"
                  >
                    {index > 0 && <RouteConnector activity={activity} />}
                    <ActivityCard activity={activity} index={index} />
                  </li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </div>

      <div className="sticky bottom-4 z-20 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-2xl shadow-gray-900/10 backdrop-blur-md sm:p-4">
        {saveError && (
          <p className="mb-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs leading-5 text-error" role="alert">
            <TripIcon name="alert-circle" size={15} className="mt-0.5 flex-none" />
            {saveError}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onEdit}
              disabled={isSaving}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60 sm:flex-none"
            >
              <TripIcon name="arrow-left" size={15} />
              Quay lại
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isSaving}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 text-sm font-bold text-primary-700 hover:bg-primary-100 disabled:opacity-60 sm:flex-none"
            >
              <TripIcon name="refresh" size={15} />
              Tạo lại
            </button>
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || tripDraft === null}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-sm font-extrabold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <TripIcon name={isSaving ? 'loader' : 'suitcase'} size={17} className={isSaving ? 'animate-spin' : ''} />
            {isSaving ? 'Đang lưu chuyến đi...' : 'Lưu vào chuyến đi của tôi'}
          </button>
        </div>
        {!tripDraft && (
          <p className="mt-2 text-xs text-error">Cần ngày khởi hành để lưu lịch trình này.</p>
        )}
      </div>

      <p className="text-center text-[11px] leading-5 text-gray-400">
        Lịch trình AI có thể cần điều chỉnh theo thời tiết và giờ mở cửa thực tế. Mô hình: {metadata.model}.
      </p>
    </section>
  );
}
