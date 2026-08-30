import { Link } from 'react-router-dom';
import TripIcon, { type IconName } from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import type { Category } from '@/types/destination.types';

const visuals: Array<{ icon: IconName; background: string; iconClass: string }> = [
  { icon: 'globe', background: 'from-cyan-50 to-blue-50', iconClass: 'bg-cyan-500 shadow-cyan-200' },
  { icon: 'compass', background: 'from-emerald-50 to-lime-50', iconClass: 'bg-emerald-500 shadow-emerald-200' },
  { icon: 'map-pin', background: 'from-amber-50 to-orange-50', iconClass: 'bg-amber-500 shadow-amber-200' },
  { icon: 'wallet', background: 'from-rose-50 to-orange-50', iconClass: 'bg-rose-500 shadow-rose-200' },
  { icon: 'sparkles', background: 'from-violet-50 to-indigo-50', iconClass: 'bg-violet-500 shadow-violet-200' },
];

interface CategoryCardProps {
  category: Category;
  index: number;
}

export default function CategoryCard({ category, index }: CategoryCardProps) {
  const visual = visuals[index % visuals.length];
  const query = new URLSearchParams({ categoryId: String(category.id) }).toString();

  return (
    <Link
      to={`${ROUTES.DESTINATIONS}?${query}`}
      className={`travel-card-shine group relative h-full overflow-hidden rounded-3xl border border-white bg-gradient-to-br ${visual.background} p-5 text-gray-900 shadow-soft transition duration-500 ease-travel hover:-translate-y-1.5 hover:text-gray-900 hover:shadow-float`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${visual.iconClass}`}>
        <TripIcon name={visual.icon} size={22} />
      </span>
      <h3 className="mt-5 text-base font-extrabold text-gray-900">{category.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-gray-500">
        {category.description ?? 'Khám phá các địa điểm phù hợp với sở thích của bạn.'}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-500">
        <span>{category.destinationCount} địa điểm</span>
        <TripIcon name="arrow-right" size={15} className="transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
