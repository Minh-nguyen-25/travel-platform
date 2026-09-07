import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Reveal from '@/components/common/Reveal';
import CategoryCard from '@/components/destination/CategoryCard';
import DestinationCard, { DestinationCardSkeleton } from '@/components/destination/DestinationCard';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { destinationService } from '@/services/destination.service';
import type { Category, Destination } from '@/types/destination.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

const HERO_IMAGE = '/images/vietnam-ha-giang-hero.jpg';

function CategorySkeleton() {
  return (
    <div className="skeleton-shimmer flex h-full flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm" aria-hidden="true">
      <div>
        <div className="h-12 w-12 rounded-xl bg-gray-100" />
        <div className="mt-4 h-5 w-2/3 rounded bg-gray-100" />
        <div className="mt-2 space-y-2">
          <div className="h-3.5 w-full rounded bg-gray-50" />
          <div className="h-3.5 w-4/5 rounded bg-gray-50" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="h-4 w-20 rounded bg-gray-100" />
        <div className="h-7 w-7 rounded-full bg-gray-100" />
      </div>
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

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `${ROUTES.DESTINATIONS}?search=${encodeURIComponent(query)}` : ROUTES.DESTINATIONS);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-sand-50">
      <section className="relative isolate flex min-h-[760px] items-end overflow-hidden bg-navy-950 text-white sm:min-h-[820px] lg:min-h-[min(920px,100svh)] lg:items-center">
        <img
          src={HERO_IMAGE}
          alt="Đèo núi Hà Giang trong ánh bình minh"
          className="hero-ken-burns absolute inset-0 -z-30 h-full w-full object-cover object-[68%_50%]"
          fetchPriority="high"
        />
        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-navy-950/95 via-navy-950/64 to-navy-950/5" />
        <div className="absolute inset-0 -z-20 bg-gradient-to-t from-navy-950/88 via-transparent to-navy-950/22" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-36 bg-gradient-to-t from-sand-50 to-transparent" />

        <div className="container relative grid items-center gap-12 pb-24 pt-32 lg:grid-cols-[minmax(0,1fr)_21rem] lg:pb-28 lg:pt-36 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="max-w-4xl">
            <div className="animate-hero-reveal inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[0.68rem] font-extrabold uppercase tracking-normal text-primary-100 backdrop-blur-md">
              <TripIcon name="compass" size={15} />
              TravelGo Vietnam
            </div>

            <div className="hero-headline-wrapper mt-6 max-w-4xl">
              <h1 className="flex flex-col text-[clamp(2.75rem,7.5vw,6.6rem)] text-white">
                <span className="hero-title-line font-display font-bold leading-[0.98] tracking-normal text-white pb-[0.04em]">
                  Chạm vào
                </span>
                <span className="hero-title-line font-display font-bold leading-[0.98] tracking-normal text-primary-100 pb-[0.04em]">
                  Việt Nam.
                </span>
                <span className="hero-title-line font-accent font-semibold leading-[1.18] tracking-normal text-accent-300 text-[0.56em] mt-[0.22em] pb-[0.08em]">
                  Theo cách của riêng bạn.
                </span>
              </h1>
            </div>

            <p className="mt-7 max-w-2xl animate-hero-reveal text-sm leading-7 text-white/72 [animation-delay:300ms] sm:text-base lg:text-lg lg:leading-8">
              Từ cung đường trong mây đến phố cổ lên đèn — khám phá nơi bạn muốn đến, lưu điều khiến bạn rung động và tạo một hành trình thật sự thuộc về mình.
            </p>

            <div className="mt-8 flex animate-hero-reveal flex-wrap gap-3 [animation-delay:390ms]">
              <Link to={ROUTES.PREFERENCES} className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-accent-500 px-5 text-sm font-extrabold text-white shadow-xl shadow-accent-900/20 transition hover:-translate-y-1 hover:bg-accent-600 hover:text-white">
                <TripIcon name="sparkles" size={17} />
                Tạo lịch trình
                <TripIcon name="arrow-right" size={16} className="transition group-hover:translate-x-1" />
              </Link>
              <Link to={ROUTES.DESTINATIONS} className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 text-sm font-extrabold text-white backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/20 hover:text-white">
                <TripIcon name="globe" size={17} />Khám phá ngay
              </Link>
            </div>

            <form onSubmit={submitSearch} className="mt-9 flex max-w-2xl animate-hero-reveal flex-col gap-2 rounded-2xl border border-white/20 bg-white/95 p-2 shadow-float [animation-delay:480ms] sm:flex-row">
              <label htmlFor="home-destination-search" className="sr-only">Tìm kiếm địa điểm</label>
              <div className="relative min-w-0 flex-1">
                <TripIcon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" />
                <input
                  id="home-destination-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-12 w-full rounded-xl border-0 bg-transparent pl-12 pr-4 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary-200"
                  placeholder="Hôm nay bạn muốn đi đâu?"
                  maxLength={200}
                />
              </div>
              <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-700 px-6 text-sm font-extrabold text-white transition hover:bg-primary-800 active:scale-[0.98]">
                Tìm cảm hứng <TripIcon name="arrow-right" size={16} />
              </button>
            </form>
          </div>

          <aside className="animate-soft-float hidden overflow-hidden rounded-[2rem] border border-white/20 bg-navy-950/45 p-5 text-white shadow-float backdrop-blur-xl lg:block" aria-label="Cách TravelGo tạo hành trình">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-normal text-primary-200">Hành trình thông minh</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><TripIcon name="route" size={18} /></span>
            </div>
            <h2 className="mt-5 font-sans text-xl font-extrabold leading-snug text-white">Từ cảm hứng đến lịch trình trong vài phút.</h2>
            <div className="mt-5 space-y-3">
              {[
                ['heart', 'Chọn gu của bạn'],
                ['sparkles', 'Để AI tối ưu'],
                ['suitcase', 'Lưu và lên đường'],
              ].map(([icon, label], index) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-300/15 text-primary-100"><TripIcon name={icon as 'heart' | 'sparkles' | 'suitcase'} size={16} /></span>
                  <div><p className="text-[0.62rem] font-bold uppercase tracking-normal text-white/45">Bước {index + 1}</p><p className="mt-0.5 text-xs font-extrabold text-white">{label}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-[0.68rem] font-semibold text-white/55"><TripIcon name="check" size={14} className="text-secondary-300" />Dữ liệu thật, kế hoạch của riêng bạn</div>
          </aside>
        </div>

        <a href="#inspiration" className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.6rem] font-extrabold uppercase tracking-normal text-navy-900/55 hover:text-primary-800 lg:flex">
          Cuộn để khám phá
          <span className="flex h-9 w-6 justify-center rounded-full border border-navy-900/25 p-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-700" /></span>
        </a>
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

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <CategorySkeleton key={index} />)
              : categories.map((category, index) => (
                  <Reveal key={category.id} delay={index * 50} className="h-full">
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
                  <DestinationCard key={destination.id} destination={destination} priority={index < 2} className={destinationGridClass(index)} />
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
                  <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">Chọn một điểm đến. Phần còn lại, TravelGo sẽ giúp bạn biến thành một hành trình đáng nhớ.</p>
                </div>
                <Link to={ROUTES.PREFERENCES} className="group inline-flex h-12 w-fit flex-none items-center gap-2 rounded-2xl bg-accent-500 px-6 text-sm font-extrabold text-white shadow-xl transition hover:-translate-y-1 hover:bg-accent-600 hover:text-white whitespace-nowrap">Bắt đầu chuyến đi <TripIcon name="arrow-right" size={17} className="transition group-hover:translate-x-1" /></Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
