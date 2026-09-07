import { Link } from 'react-router-dom';
import TripIcon, { type IconName } from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import type { Category } from '@/types/destination.types';

interface VisualConfig {
  icon: IconName;
  iconBg: string;
  badgeBg: string;
  accentBorder: string;
}

const categoryVisuals: VisualConfig[] = [
  {
    icon: 'globe',
    iconBg: 'bg-teal-600 text-white shadow-teal-700/20',
    badgeBg: 'bg-teal-50 text-teal-700',
    accentBorder: 'hover:border-teal-300',
  },
  {
    icon: 'compass',
    iconBg: 'bg-emerald-600 text-white shadow-emerald-700/20',
    badgeBg: 'bg-emerald-50 text-emerald-700',
    accentBorder: 'hover:border-emerald-300',
  },
  {
    icon: 'map-pin',
    iconBg: 'bg-amber-600 text-white shadow-amber-700/20',
    badgeBg: 'bg-amber-50 text-amber-700',
    accentBorder: 'hover:border-amber-300',
  },
  {
    icon: 'wallet',
    iconBg: 'bg-rose-500 text-white shadow-rose-700/20',
    badgeBg: 'bg-rose-50 text-rose-700',
    accentBorder: 'hover:border-rose-300',
  },
  {
    icon: 'sparkles',
    iconBg: 'bg-violet-600 text-white shadow-violet-700/20',
    badgeBg: 'bg-violet-50 text-violet-700',
    accentBorder: 'hover:border-violet-300',
  },
  {
    icon: 'heart',
    iconBg: 'bg-blue-600 text-white shadow-blue-700/20',
    badgeBg: 'bg-blue-50 text-blue-700',
    accentBorder: 'hover:border-blue-300',
  },
  {
    icon: 'route',
    iconBg: 'bg-orange-600 text-white shadow-orange-700/20',
    badgeBg: 'bg-orange-50 text-orange-700',
    accentBorder: 'hover:border-orange-300',
  },
  {
    icon: 'suitcase',
    iconBg: 'bg-slate-700 text-white shadow-slate-700/20',
    badgeBg: 'bg-slate-100 text-slate-700',
    accentBorder: 'hover:border-slate-300',
  },
];

interface CategoryCardProps {
  category: Category;
  index: number;
}

export default function CategoryCard({ category, index }: CategoryCardProps) {
  const visual = categoryVisuals[index % categoryVisuals.length];
  const query = new URLSearchParams({ categoryId: String(category.id) }).toString();

  return (
    <Link
      to={`${ROUTES.DESTINATIONS}?${query}`}
      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${visual.accentBorder}`}
    >
      {/* Khối nội dung trên: Icon, Tên danh mục, Mô tả */}
      <div>
        {/* Category Icon */}
        <div className="mb-4">
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-md ${visual.iconBg}`}>
            <TripIcon name={visual.icon} size={22} />
          </span>
        </div>

        {/* Tên danh mục */}
        <h3 className="text-lg font-bold text-navy-900 transition-colors group-hover:text-primary-700">
          {category.name}
        </h3>

        {/* Mô tả danh mục */}
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
          {category.description || 'Khám phá các điểm đến hấp dẫn và hoạt động phù hợp theo chủ đề này.'}
        </p>
      </div>

      {/* Khối đáy: Số lượng địa điểm & Mũi tên điều hướng */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs">
        <span className="font-semibold text-gray-600 transition-colors group-hover:text-primary-800">
          {typeof category.destinationCount === 'number'
            ? `${category.destinationCount} địa điểm`
            : 'Khám phá ngay'}
        </span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sand-100 text-gray-400 transition-all duration-200 group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:translate-x-1">
          <TripIcon name="arrow-right" size={14} />
        </span>
      </div>
    </Link>
  );
}
