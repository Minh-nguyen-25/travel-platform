import { Link } from 'react-router-dom';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { getCategoryVisual } from '@/data/home-visuals';
import type { Category } from '@/types/destination.types';

interface CategoryCardProps {
  category: Category;
  index: number;
}

export default function CategoryCard({ category, index }: CategoryCardProps) {
  const visual = getCategoryVisual(category.name, index);
  const query = new URLSearchParams({ categoryId: String(category.id) }).toString();

  return (
    <Link
      to={`${ROUTES.DESTINATIONS}?${query}`}
      className="category-image-card group"
    >
      <img src={visual.image} alt="" loading="lazy" className="category-image-card__image" />
      <span className="category-image-card__veil" aria-hidden="true" />
      <span className="category-image-card__icon" aria-hidden="true"><TripIcon name={visual.icon} size={21} /></span>
      <span className="category-image-card__edition" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div className="category-image-card__content">
        <h3>{category.name}</h3>
        <p className="line-clamp-2">
          {category.description || 'Khám phá các điểm đến hấp dẫn và hoạt động phù hợp theo chủ đề này.'}
        </p>
        <span className="category-image-card__meta">
          <span className="category-image-card__count"><TripIcon name="map-pin" size={12} />{typeof category.destinationCount === 'number' ? `${category.destinationCount} địa điểm` : 'Khám phá ngay'}</span>
          <span className="category-image-card__arrow" aria-hidden="true"><TripIcon name="arrow-right" size={17} /></span>
        </span>
      </div>
    </Link>
  );
}
