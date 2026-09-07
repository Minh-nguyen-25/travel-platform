import { Link } from 'react-router-dom';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import type { TripStatus, TripSummary } from '@/types/trip.types';
import {
  formatCurrency,
  formatDateRange,
  getTripDuration,
  getTripStatus,
  getTripStatusLabel,
} from '@/utils/trip.utils';

interface TripCardProps {
  trip: TripSummary;
  onDelete: (trip: TripSummary) => void;
  onShare: (trip: TripSummary) => void | Promise<void>;
}

const coverThemes = [
  'from-primary-800 via-primary-600 to-primary-400',
  'from-primary-900 via-primary-700 to-accent-400',
  'from-primary-700 via-primary-500 to-primary-300',
  'from-gray-900 via-primary-800 to-primary-500',
];

const statusClasses: Record<TripStatus, string> = {
  upcoming: 'bg-primary-50 text-primary-700 border-primary-100',
  ongoing: 'bg-green-50 text-green-700 border-green-100',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function TripCard({ trip, onDelete, onShare }: TripCardProps) {
  const status = getTripStatus(trip);
  const duration = getTripDuration(trip.startDate, trip.endDate);
  const initials = trip.destinationCity
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-xl hover:shadow-gray-200/70">
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${coverThemes[trip.id % coverThemes.length]}`}>
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/15" />
        <div className="absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-white/10 blur-sm" />
        <svg className="absolute bottom-0 right-0 h-28 w-48 text-white/10" viewBox="0 0 180 100" fill="none" aria-hidden="true">
          <path d="M5 92c28-40 43-12 66-53 20-35 39 25 66-19 11-18 26-15 38-8" stroke="currentColor" strokeWidth="2" strokeDasharray="5 7" />
          <circle cx="71" cy="39" r="5" fill="currentColor" /><circle cx="137" cy="20" r="5" fill="currentColor" />
        </svg>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-normal ${statusClasses[status]}`}>
            {getTripStatusLabel(status)}
          </span>
          <div className="flex gap-2">
            {trip.isAiGenerated && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm" title="Lịch trình AI">
                <TripIcon name="sparkles" size={15} />
              </span>
            )}
            {trip.isPublic && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm" title="Đang chia sẻ">
                <TripIcon name="eye" size={15} />
              </span>
            )}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-normal text-primary-100">Điểm đến</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{trip.destinationCity}</p>
          </div>
          <span className="text-3xl font-black tracking-tight text-white/20">{initials}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={ROUTES.TRIP_DETAIL(trip.id)} className="line-clamp-1 text-lg font-extrabold text-gray-900 hover:text-primary-700">
              {trip.name}
            </Link>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <TripIcon name="calendar" size={14} className="text-primary-500" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
          <span className="rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-500">{duration} ngày</span>
        </div>

        {trip.description && <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-gray-500">{trip.description}</p>}

        <div className="mt-4 grid grid-cols-3 gap-2 border-y border-gray-100 py-3 text-center">
          <div>
            <p className="text-sm font-extrabold text-gray-900">{trip.dayCount}</p>
            <p className="mt-0.5 text-[10px] font-medium text-gray-400">ngày có lịch</p>
          </div>
          <div className="border-x border-gray-100">
            <p className="text-sm font-extrabold text-gray-900">{trip.numberOfPeople}</p>
            <p className="mt-0.5 text-[10px] font-medium text-gray-400">người</p>
          </div>
          <div>
            <p className="truncate text-sm font-extrabold text-gray-900">{trip.budget ? formatCurrency(trip.budget) : '—'}</p>
            <p className="mt-0.5 text-[10px] font-medium text-gray-400">ngân sách</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link to={ROUTES.TRIP_DETAIL(trip.id)} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 hover:text-white">
            Xem lịch trình <TripIcon name="arrow-right" size={15} />
          </Link>
          <button type="button" onClick={() => void onShare(trip)} className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700" aria-label={`Chia sẻ ${trip.name}`} title="Chia sẻ">
            <TripIcon name="share" size={16} />
          </button>
          <button type="button" onClick={() => onDelete(trip)} className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600" aria-label={`Xóa ${trip.name}`} title="Xóa">
            <TripIcon name="trash" size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
