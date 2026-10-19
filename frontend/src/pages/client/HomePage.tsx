import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Reveal from '@/components/common/Reveal';
import CategoryCard from '@/components/destination/CategoryCard';
import DestinationCard, { DestinationCardSkeleton } from '@/components/destination/DestinationCard';
import DestinationSearch from '@/components/destination/DestinationSearch';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { getDestinationPhotoCredit } from '@/data/destination-photo-credits';
import { HOME_REGIONS } from '@/data/home-visuals';
import useHomeScrollMotion from '@/hooks/useHomeScrollMotion';
import { destinationService } from '@/services/destination.service';
import type { Category, Destination } from '@/types/destination.types';
import { getApiErrorMessage } from '@/utils/trip.utils';
import './HomePage.css';

const HERO_IMAGE = '/images/destinations/ha-giang.jpg';

const QUICK_SEARCH_SUGGESTIONS = ['Hà Giang', 'Hội An', 'Đà Lạt', 'Ninh Bình'];

function CategorySkeleton() {
  return (
    <div className="skeleton-shimmer relative min-h-[300px] overflow-hidden rounded-[1.4rem] bg-primary-100" aria-hidden="true">
      <div className="absolute inset-x-5 bottom-5 space-y-3">
        <div className="h-6 w-2/3 rounded bg-white/60" />
        <div className="h-3.5 w-full rounded bg-white/40" />
        <div className="h-3.5 w-4/5 rounded bg-white/40" />
      </div>
    </div>
  );
}

const categoryGridClass = (index: number): string => {
  if (index === 0 || index === 1) {
    return 'col-span-1 sm:col-span-1 lg:col-span-3';
  }
  if (index === 4) {
    return 'col-span-1 sm:col-span-2 lg:col-span-2';
  }
  return 'col-span-1 sm:col-span-1 lg:col-span-2';
};

const destinationGridClass = (index: number): string => {
  if (index === 0) return 'lg:col-span-7';
  if (index === 1) return 'lg:col-span-5';
  return 'lg:col-span-3';
};

export default function HomePage() {
  const navigate = useNavigate();
  const { pageRef, heroRef, progressRef } = useHomeScrollMotion();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [topDestinations, setTopDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const heroCredit = getDestinationPhotoCredit(HERO_IMAGE);

  useEffect(() => {
    let active = true;

    const loadHomeData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [categoryResult, destinationResult] = await Promise.all([
          destinationService.getCategories({ page: 1, limit: 5, sortBy: 'name', sortOrder: 'asc' }),
          destinationService.getDestinations({
            page: 1,
            limit: 6,
            minRating: 4,
            sortBy: 'rating',
            sortOrder: 'desc',
          }),
        ]);
        if (!active) return;
        setCategories(categoryResult.data);
        setTopDestinations(destinationResult.data);
      } catch (requestError: unknown) {
        if (!active) return;
        setCategories([]);
        setTopDestinations([]);
        setError(getApiErrorMessage(requestError, 'Kho cảm hứng đang nghỉ chân một chút. Vui lòng thử lại.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadHomeData();
    return () => {
      active = false;
    };
  }, [retryKey]);

  const submitSearch = (query: string) => {
    const trimmed = query.trim();
    navigate(trimmed ? `${ROUTES.DESTINATIONS}?search=${encodeURIComponent(trimmed)}` : ROUTES.DESTINATIONS);
  };

  return (
    <div ref={pageRef} className="travel-home min-h-screen overflow-x-hidden bg-sand-50">
      <div ref={progressRef} className="home-scroll-progress" aria-hidden="true" />

      {/* Hero Section */}
      <section ref={heroRef} className="home-hero">
        <img src={HERO_IMAGE} alt="Cung đường đèo uốn lượn giữa núi đá Hà Giang" fetchPriority="high" className="home-hero__image" />
        <div className="home-hero__veil" aria-hidden="true" />
        <div className="home-hero__contours" aria-hidden="true" />
        <div className="container home-hero__content">
          <div className="home-hero__copy">
            <div className="home-hero__eyebrow">
              <span className="home-hero__eyebrow-dot" aria-hidden="true" />
              <span>Khám phá Việt Nam</span>
            </div>
            <h1 className="home-hero__title">
              Đi để thấy Việt Nam
              <span className="home-hero__title-highlight">đẹp đến nhường nào.</span>
            </h1>
            <p className="home-hero__description">Khám phá điểm đến, trải nghiệm văn hóa và xây dựng lịch trình phù hợp với chính bạn.</p>

            <div id="home-search" className="home-hero__search">
              <DestinationSearch value={search} onChange={setSearch} onSearch={submitSearch} buttonLabel="Tìm kiếm" />
            </div>

            <div className="home-hero__suggestions">
              <span>Gợi ý:</span>
              {QUICK_SEARCH_SUGGESTIONS.map((place) => (
                <Link key={place} to={`${ROUTES.DESTINATIONS}?search=${encodeURIComponent(place)}`}>{place}</Link>
              ))}
            </div>

            <div className="home-hero__actions">
              <Link to={ROUTES.PREFERENCES} className="home-hero__cta-primary">
                <TripIcon name="sparkles" size={17} />
                <span>Tạo lịch trình thông minh</span>
                <TripIcon name="arrow-right" size={16} />
              </Link>
              <span className="home-hero__note"><TripIcon name="route" size={16} />Điểm đến thật · Lịch trình của riêng bạn</span>
            </div>
          </div>
        </div>
        <div className="home-hero__location"><TripIcon name="map-pin" size={14} /><span>Hà Giang, Việt Nam</span></div>
        {heroCredit && (
          <div className="home-hero__attribution">
            Ảnh: <a href={heroCredit.sourceUrl} target="_blank" rel="noopener noreferrer">{heroCredit.author}</a>
            {' '}· <a href={heroCredit.licenseUrl} target="_blank" rel="noopener noreferrer">{heroCredit.license}</a>
          </div>
        )}
      </section>

      {/* Categories Bento Grid */}
      <section id="inspiration" className="home-inspiration bg-sand-50 py-16 sm:py-20 lg:py-24">
        <div className="container">
          <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow"><TripIcon name="compass" size={15} />Khám phá theo cảm hứng</p>
              <h2 className="display-title mt-4 text-4xl text-navy-900 sm:text-5xl">Bạn muốn chuyến đi như thế nào?</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-gray-500">Chọn một cảm hứng và bắt đầu hành trình khám phá Việt Nam theo cách của bạn.</p>
          </Reveal>

          <div className="travel-bento mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className={`h-full ${categoryGridClass(index)}`}>
                    <CategorySkeleton />
                  </div>
                ))
              : categories.map((category, index) => (
                  <Reveal key={category.id} delay={index * 70} className={`h-full ${categoryGridClass(index)}`}>
                    <CategoryCard category={category} index={index} />
                  </Reveal>
                ))}
          </div>

          {!isLoading && !error && categories.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-primary-200 bg-white px-6 py-12 text-center">
              <TripIcon name="compass" size={28} className="mx-auto text-primary-300" />
              <p className="mt-3 font-bold text-gray-700">Các chủ đề khám phá đang được chuẩn bị.</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Destinations */}
      <section className="section relative overflow-hidden bg-white">
        <div className="absolute -left-52 top-28 h-96 w-96 rounded-full bg-primary-50 blur-3xl" />
        <div className="container relative">
          <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-accent-600"><TripIcon name="star" size={15} />Được cộng đồng yêu thích</p>
              <h2 className="display-title mt-4 max-w-2xl text-4xl text-navy-900 sm:text-5xl">Điểm đến được yêu thích.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500">Những nơi bạn không nên bỏ lỡ khi khám phá Việt Nam.</p>
            </div>
            <Link to={`${ROUTES.DESTINATIONS}?sortBy=rating&sortOrder=desc`} className="group inline-flex items-center gap-2 text-sm font-extrabold text-primary-800">
              Xem bản đồ cảm hứng <TripIcon name="arrow-right" size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {error && !isLoading && (
            <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-accent-100 bg-accent-50/60 p-5 text-center sm:flex-row sm:text-left" role="alert">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white text-accent-600">
                  <TripIcon name="alert-circle" size={19} />
                </span>
                <div>
                  <p className="font-extrabold text-gray-900">Có vẻ chuyến đi này đang nghỉ chân.</p>
                  <p className="mt-1 text-sm text-gray-600">{error}</p>
                </div>
              </div>
              <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="inline-flex h-10 flex-none items-center gap-2 rounded-xl bg-primary-700 px-4 text-sm font-extrabold text-white hover:bg-primary-800">
                <TripIcon name="refresh" size={16} />Thử lại
              </button>
            </div>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-12">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className={destinationGridClass(index)}>
                    <DestinationCardSkeleton />
                  </div>
                ))
              : topDestinations.map((destination, index) => (
                  <Reveal key={destination.id} delay={(index % 3) * 90} variant="up" className={destinationGridClass(index)}>
                    <DestinationCard destination={destination} priority={index < 2} />
                  </Reveal>
                ))}
          </div>

          {!isLoading && !error && topDestinations.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-gray-200 bg-sand-50 px-6 py-14 text-center">
              <TripIcon name="map-pin" size={30} className="mx-auto text-primary-300" />
              <h3 className="mt-4 text-xl font-bold text-gray-900">Điểm đến mới đang trên đường cập bến</h3>
              <Link to={ROUTES.DESTINATIONS} className="mt-5 inline-flex items-center gap-2 font-bold text-primary-700">
                Khám phá toàn bộ kho địa điểm <TripIcon name="arrow-right" size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Explore Vietnam by region */}
      <section id="regions" className="home-regions section bg-sand-50">
        <div className="container">
          <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-secondary-700"><TripIcon name="globe" size={15} />Ba miền, muôn sắc Việt</p>
              <h2 className="display-title mt-4 text-4xl text-navy-900 sm:text-5xl">Việt Nam có gì để khám phá?</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-gray-500">Đi dọc dải đất hình chữ S, mỗi miền mở ra một nhịp sống và một câu chuyện rất riêng.</p>
          </Reveal>

          <div className="home-regions__grid">
            {HOME_REGIONS.map((region, index) => (
              <Reveal key={region.name} delay={index * 100} variant="scale" className="h-full">
                <Link to={ROUTES.DESTINATIONS} className="home-region-card group">
                  <img src={region.image} alt={`Khung cảnh tiêu biểu ${region.name}`} loading="lazy" />
                  <span className="home-region-card__veil" aria-hidden="true" />
                  <span className="home-region-card__number">0{index + 1}</span>
                  <div className="home-region-card__copy">
                    <span>{region.kicker}</span>
                    <h3>{region.name}</h3>
                    <p>{region.description}</p>
                    <div className="home-region-card__tags">{region.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  </div>
                  <span className="home-region-card__arrow"><TripIcon name="arrow-right" size={18} /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Smart itinerary CTA */}
      <section id="smart-itinerary" className="home-planner bg-sand-50 pb-20 sm:pb-28">
        <div className="container">
          <Reveal>
            <div className="home-planner__panel">
              <img src="/images/vietnam-ai-planner.jpg" alt="" loading="lazy" className="home-planner__image" />
              <div className="home-planner__veil" aria-hidden="true" />
              <div className="home-planner__layout">
                <div className="home-planner__copy">
                  <p className="eyebrow text-accent-300"><TripIcon name="sparkles" size={15} />Lịch trình thông minh</p>
                  <h2 className="display-title">Để chúng tôi giúp bạn lên lịch trình.</h2>
                  <p>Cho chúng tôi biết bạn muốn đi đâu, bao lâu và yêu thích điều gì. TravelGo sẽ gợi ý một hành trình vừa vặn để bạn tiếp tục tinh chỉnh.</p>
                  <Link to={ROUTES.PREFERENCES} className="home-planner__cta">
                    <TripIcon name="sparkles" size={18} />Tạo lịch trình cho tôi<TripIcon name="arrow-right" size={17} />
                  </Link>
                </div>
                <div className="home-planner__signals" aria-label="Thông tin dùng để tạo lịch trình">
                  {[
                    { icon: 'map-pin' as const, label: 'Điểm đến', text: 'Nơi bạn muốn khám phá' },
                    { icon: 'calendar' as const, label: 'Thời gian', text: 'Số ngày và thời điểm' },
                    { icon: 'heart' as const, label: 'Sở thích', text: 'Trải nghiệm bạn yêu' },
                    { icon: 'wallet' as const, label: 'Ngân sách', text: 'Mức chi tiêu phù hợp' },
                  ].map((item) => (
                    <div key={item.label} className="home-planner__signal">
                      <span><TripIcon name={item.icon} size={19} /></span>
                      <div><strong>{item.label}</strong><small>{item.text}</small></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
