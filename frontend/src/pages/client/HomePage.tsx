import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Reveal from '@/components/common/Reveal';
import DestinationSearch from '@/components/destination/DestinationSearch';
import useHomeScrollMotion from '@/hooks/useHomeScrollMotion';
import './HomePage.css';
import CategoryCard from '@/components/destination/CategoryCard';
import DestinationCard, { DestinationCardSkeleton } from '@/components/destination/DestinationCard';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { destinationService } from '@/services/destination.service';
import type { Category, Destination } from '@/types/destination.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

const HERO_IMAGE = '/images/destinations/ha-giang.jpg';

function CategorySkeleton() {
  return (
    <div className="skeleton-shimmer rounded-3xl border border-white bg-white p-5 shadow-soft" aria-hidden="true">
      <div className="h-12 w-12 rounded-2xl bg-primary-100" />
      <div className="mt-5 h-5 w-2/3 rounded bg-gray-100" />
      <div className="mt-3 h-10 rounded bg-gray-50" />
      <div className="mt-4 h-4 w-1/2 rounded bg-gray-100" />
    </div>
  );
}

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
    return () => { active = false; };
  }, [retryKey]);

  const submitSearch = (query: string) => {
    navigate(query ? `${ROUTES.DESTINATIONS}?search=${encodeURIComponent(query)}` : ROUTES.DESTINATIONS);
  };
  return (
    <div ref={pageRef} className="home-page min-h-screen bg-sand-50">
      <div ref={progressRef} className="home-scroll-progress" aria-hidden="true" />
      <section ref={heroRef} className="home-hero">
        <div className="home-hero__backdrop" aria-hidden="true" />
        <div className="container relative">
          <div className="home-hero__grid">
            <div className="home-hero__copy">
              <p className="home-hero__eyebrow"><span />ĐI ĐỂ THẤY. ĐI ĐỂ NHỚ.</p>
              <h1 className="display-title home-hero__title text-white">
                <span className="hero-title-line">Việt Nam,</span>
                <span className="hero-title-line text-primary-100">đi để thấy,</span>
                <span className="hero-title-line accent-script text-accent-300">ở lại để yêu.</span>
              </h1>
              <p className="home-hero__description">Một sớm giữa núi rừng. Một chiều bên phố cổ. Tìm nơi khiến bạn muốn lên đường — và viết nên hành trình của riêng mình.</p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <Link to={ROUTES.PREFERENCES} className="home-primary-link"><TripIcon name="sparkles" size={17} />Lên kế hoạch cùng AI<TripIcon name="arrow-right" size={17} /></Link>
                <a href="#home-search" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white">Tìm địa điểm<TripIcon name="arrow-down" size={16} /></a>
              </div>
              <div className="home-hero__note"><TripIcon name="route" size={18} /><span>Chọn điểm đến. Lưu điều bạn thích.<br /><strong>Để mỗi chuyến đi mang dấu ấn của bạn.</strong></span></div>
            </div>
            <div className="home-hero__visual">
              <div className="home-hero__photo">
                <img src={HERO_IMAGE} alt="Cung đường uốn lượn giữa núi rừng Hà Giang" fetchPriority="high" className="home-hero__image" />
                <div className="home-hero__photo-veil" />
                <span className="home-hero__photo-tag"><TripIcon name="map-pin" size={14} />HÀ GIANG · VIỆT NAM</span>
                <div className="home-hero__caption"><p>Những cung đường<br />dẫn đến tự do.</p><Link to={`${ROUTES.DESTINATIONS}?search=${encodeURIComponent('Hà Giang')}`} aria-label="Khám phá Hà Giang"><TripIcon name="arrow-right" size={23} /></Link></div>
              </div>
              <div className="home-hero__postcard">
                <img src="/images/destinations/hoi-an.jpg" alt="Phố cổ Hội An, ảnh chụp thực tế" width="76" height="88" />
                <div><p>Một nhịp đi khác</p><strong>Chậm lại ở Hội An</strong><Link to={`${ROUTES.DESTINATIONS}?search=${encodeURIComponent('Hội An')}`}>Ghé thăm phố cổ <TripIcon name="arrow-right" size={13} /></Link></div>
              </div>
              <span className="home-hero__index" aria-hidden="true">01 / KHÁM PHÁ</span>
            </div>
          </div>
          <div id="home-search" className="home-search-dock">
            <div className="home-search-dock__heading"><TripIcon name="compass" size={22} /><div><h2>Chuyến đi tiếp theo, bạn muốn đến đâu?</h2><p>Tìm theo địa điểm, thành phố hoặc trải nghiệm bạn yêu thích.</p></div></div>
            <DestinationSearch value={search} onChange={setSearch} onSearch={submitSearch} buttonLabel="Khám phá ngay" />
            <div className="home-search-dock__suggestions"><span>Thử khám phá:</span>{['Hà Giang', 'Hội An', 'Đà Lạt', 'Ninh Bình'].map((place) => <Link key={place} to={`${ROUTES.DESTINATIONS}?search=${encodeURIComponent(place)}`}><TripIcon name="map-pin" size={12} />{place}</Link>)}</div>
          </div>
        </div>
      </section>

      <section className="home-escapes bg-sand-50">
        <div className="container">
          <Reveal className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="eyebrow"><TripIcon name="globe" size={15} />Mỗi nơi, một câu chuyện</p><h2 className="display-title mt-4 text-4xl text-navy-900 sm:text-5xl">Đổi khung cảnh. Đổi nhịp sống.</h2></div>
            <Link to={ROUTES.DESTINATIONS} className="inline-flex items-center gap-2 text-sm font-extrabold text-primary-800">Tất cả điểm đến<TripIcon name="arrow-right" size={16} /></Link>
          </Reveal>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              { place: 'Ninh Bình', image: '/images/destinations/ninh-binh.jpg', title: 'Giữa miền non nước', subtitle: 'Một khoảng xanh để thở sâu.', label: 'THIÊN NHIÊN' },
              { place: 'Hội An', image: '/images/destinations/hoi-an.jpg', title: 'Chạm vào ký ức', subtitle: 'Phố nhỏ, những câu chuyện dài.', label: 'VĂN HÓA' },
              { place: 'Đà Lạt', image: '/images/destinations/da-lat.jpg', title: 'Hẹn với bình yên', subtitle: 'Đi tìm một sáng mai thật chậm.', label: 'NGHỈ DƯỠNG' },
            ].map((escape, index) => <Reveal key={escape.place} delay={index * 100} variant="scale">
              <Link to={`${ROUTES.DESTINATIONS}?search=${encodeURIComponent(escape.place)}`} className="home-escape-card group">
                <img src={escape.image} alt={`Khung cảnh ${escape.place}`} loading="lazy" />
                <span className="home-escape-card__label">{escape.label}</span>
                <div className="home-escape-card__copy"><span>{escape.place}</span><h3>{escape.title}</h3><p>{escape.subtitle}</p></div>
                <span className="home-escape-card__arrow"><TripIcon name="arrow-right" size={20} /></span>
              </Link>
            </Reveal>)}
          </div>
        </div>
      </section>
      <section id="inspiration" className="section bg-sand-50">
        <div className="container">
          <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow"><TripIcon name="compass" size={15} />Tìm đúng nhịp điệu</p>
              <h2 className="display-title mt-4 max-w-2xl text-4xl text-navy-900 sm:text-5xl">Bạn đang tìm một chuyến đi như thế nào?</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-gray-500">Biển xanh, rừng sâu, di sản hay một góc phố đầy hương vị — bắt đầu từ cảm xúc bạn muốn mang theo.</p>
          </Reveal>

          <div className="travel-bento mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => <CategorySkeleton key={index} />)
              : categories.map((category, index) => (
                  <Reveal key={category.id} delay={index * 70} className="h-full">
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

      <section className="section relative overflow-hidden bg-white">
        <div className="absolute -left-52 top-28 h-96 w-96 rounded-full bg-primary-50 blur-3xl" />
        <div className="container relative">
          <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-accent-600"><TripIcon name="star" size={15} />Được cộng đồng yêu thích</p>
              <h2 className="display-title mt-4 max-w-2xl text-4xl text-navy-900 sm:text-5xl">Những nơi khiến người ta muốn xách ba lô lên.</h2>
            </div>
            <Link to={`${ROUTES.DESTINATIONS}?sortBy=rating&sortOrder=desc`} className="group inline-flex items-center gap-2 text-sm font-extrabold text-primary-800">
              Xem bản đồ cảm hứng <TripIcon name="arrow-right" size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {error && !isLoading && (
            <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-accent-100 bg-accent-50/60 p-5 text-center sm:flex-row sm:text-left" role="alert">
              <div className="flex items-start gap-3"><span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white text-accent-600"><TripIcon name="alert-circle" size={19} /></span><div><p className="font-extrabold text-gray-900">Có vẻ chuyến đi này đang nghỉ chân.</p><p className="mt-1 text-sm text-gray-600">{error}</p></div></div>
              <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="inline-flex h-10 flex-none items-center gap-2 rounded-xl bg-primary-700 px-4 text-sm font-extrabold text-white hover:bg-primary-800"><TripIcon name="refresh" size={16} />Thử lại</button>
            </div>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-12">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <div key={index} className={destinationGridClass(index)}><DestinationCardSkeleton /></div>)
              : topDestinations.map((destination, index) => (
                  <Reveal key={destination.id} delay={(index % 3) * 90} variant="up" className={destinationGridClass(index)}><DestinationCard destination={destination} priority={index < 2} /></Reveal>
                ))}
          </div>

          {!isLoading && !error && topDestinations.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed border-gray-200 bg-sand-50 px-6 py-14 text-center">
              <TripIcon name="map-pin" size={30} className="mx-auto text-primary-300" />
              <h3 className="mt-4 text-xl font-bold text-gray-900">Điểm đến mới đang trên đường cập bến</h3>
              <Link to={ROUTES.DESTINATIONS} className="mt-5 inline-flex items-center gap-2 font-bold text-primary-700">Khám phá toàn bộ kho địa điểm <TripIcon name="arrow-right" size={15} /></Link>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-sand-100/65">
        <div className="container">
          <Reveal className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="eyebrow text-secondary-700"><TripIcon name="route" size={15} />Một hành trình thật dễ bắt đầu</p>
              <h2 className="display-title mt-4 text-4xl text-navy-900 sm:text-5xl">Từ “muốn đi” đến “đã có kế hoạch”.</h2>
              <p className="mt-5 text-sm leading-7 text-gray-600">Không cần bắt đầu bằng một bảng kế hoạch trống. Hãy bắt đầu bằng nơi bạn muốn đến và cảm giác bạn muốn có.</p>
              <Link to={ROUTES.PREFERENCES} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-navy-900 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-1 hover:bg-primary-900 hover:text-white"><TripIcon name="sparkles" size={17} />Thử AI Planner</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { number: '01', icon: 'heart' as const, title: 'Nói điều bạn thích', text: 'Ngân sách, nhịp đi, hoạt động và phong cách trải nghiệm.' },
                { number: '02', icon: 'route' as const, title: 'Nhận lịch trình', text: 'Từng ngày rõ ràng, quãng đường hợp lý và chi phí dự kiến.' },
                { number: '03', icon: 'suitcase' as const, title: 'Tinh chỉnh & lên đường', text: 'Kéo thả điểm dừng, chia sẻ và giữ mọi thứ trong một nơi.' },
              ].map((step, index) => (
                <Reveal key={step.number} delay={index * 90} className="h-full">
                  <article className="group h-full rounded-3xl border border-white bg-white p-5 shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-float">
                    <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><TripIcon name={step.icon} size={20} /></span><span className="font-display text-3xl font-bold text-sand-300">{step.number}</span></div>
                    <h3 className="mt-6 text-xl font-bold text-navy-900">{step.title}</h3>
                    <p className="mt-3 text-xs leading-6 text-gray-500">{step.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-sand-50 pb-20 pt-4 sm:pb-28">
        <div className="container">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[2.25rem] bg-navy-950 px-6 py-14 text-white shadow-float sm:px-10 lg:px-16 lg:py-16">
              <img src={HERO_IMAGE} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_58%] opacity-35" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/88 to-primary-900/45" />
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="eyebrow text-accent-300"><TripIcon name="plane" size={15} />Chuyến đi tiếp theo</p>
                  <h2 className="display-title mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">Của bạn sẽ bắt đầu ở đâu?</h2>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">Chọn một điểm đến. Phần còn lại, TravelPlatform sẽ giúp bạn biến thành một hành trình đáng nhớ.</p>
                </div>
                <Link to={ROUTES.PREFERENCES} className="group inline-flex h-12 w-fit flex-none items-center gap-2 rounded-2xl bg-accent-500 px-6 text-sm font-extrabold text-white shadow-xl transition hover:-translate-y-1 hover:bg-accent-600 hover:text-white">Bắt đầu chuyến đi <TripIcon name="arrow-right" size={17} className="transition group-hover:translate-x-1" /></Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
