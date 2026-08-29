import { useState } from 'react';
import { Link } from 'react-router-dom';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import type { Destination } from '@/types/destination.types';
import { formatTicketPrice, getDestinationImage } from '@/utils/destination.utils';

interface DestinationCardProps {
  destination: Destination;
  priority?: boolean;
}

export default function DestinationCard({ destination, priority = false }: DestinationCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getDestinationImage(destination);
  const rating = Number(destination.rating);

  return (
    <Link
      to={ROUTES.DESTINATION_DETAIL(destination.id)}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white text-gray-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary-100 hover:text-gray-900 hover:shadow-xl hover:shadow-primary-900/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={destination.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary-300">
            <TripIcon name="image" size={42} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-900/50 to-transparent" />
        {destination.categories[0] && (
          <span className="absolute left-4 top-4 max-w-[70%] truncate rounded-full border border-white/40 bg-white/90 px-3 py-1.5 text-xs font-extrabold text-primary-700 shadow-sm backdrop-blur">
            {destination.categories[0].name}
          </span>
        )}
        {rating > 0 && (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-gray-900/80 px-2.5 py-1 text-xs font-extrabold text-white backdrop-blur">
            <TripIcon name="star" size={13} className="fill-warning text-warning" />
            {rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold leading-snug text-gray-900 transition group-hover:text-primary-700">
          {destination.name}
        </h3>
        <p className="mt-2 flex items-start gap-1.5 text-sm leading-5 text-gray-500">
          <TripIcon name="map-pin" size={15} className="mt-0.5 flex-none text-primary-500" />
          <span className="line-clamp-2">{destination.address}</span>
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Giá vé từ</p>
            <p className={`mt-0.5 text-sm font-extrabold ${Number(destination.ticketPrice) > 0 ? 'text-gray-900' : 'text-success'}`}>
              {formatTicketPrice(destination.ticketPrice)}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
            <TripIcon name="arrow-right" size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function DestinationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-primary-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-10 animate-pulse border-t border-gray-100 bg-gray-50" />
      </div>
    </div>
  );
}
