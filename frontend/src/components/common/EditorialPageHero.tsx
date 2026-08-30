import type { ReactNode } from 'react';
import TripIcon, { type IconName } from '@/components/trip/TripIcon';

export type EditorialHeroMotion = 'pan' | 'drift' | 'focus' | 'orbit' | 'glide' | 'rise' | 'route';

interface EditorialPageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  image: string;
  imageAlt: string;
  icon?: IconName;
  motion?: EditorialHeroMotion;
  imagePosition?: string;
  children?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
}

export default function EditorialPageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  icon = 'compass',
  motion = 'pan',
  imagePosition = 'object-center',
  children,
  aside,
  compact = false,
}: EditorialPageHeroProps) {
  return (
    <section className={`editorial-hero editorial-hero--${motion} ${compact ? 'editorial-hero--compact' : ''}`}>
      <img
        src={image}
        alt={imageAlt}
        className={`editorial-hero__media ${imagePosition}`}
        loading="eager"
        decoding="async"
      />
      <div className="editorial-hero__veil" />
      <div className="editorial-hero__light" aria-hidden="true" />
      <div className="editorial-hero__orbit" aria-hidden="true" />

      <div className="container relative grid min-w-0 items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="editorial-hero__content min-w-0 max-w-3xl">
          <p className="editorial-hero__eyebrow">
            <TripIcon name={icon} size={15} />
            {eyebrow}
          </p>
          <h1 className="display-title mt-5 text-[clamp(2.65rem,6vw,5.8rem)] text-white">{title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">{description}</p>
          {children && <div className="mt-7">{children}</div>}
        </div>

        {aside && <div className="editorial-hero__aside">{aside}</div>}
      </div>
    </section>
  );
}
