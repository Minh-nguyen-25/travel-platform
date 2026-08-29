import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryCard from '@/components/destination/CategoryCard';
import DestinationCard, { DestinationCardSkeleton } from '@/components/destination/DestinationCard';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';
import { destinationService } from '@/services/destination.service';
import type { Category, Destination } from '@/types/destination.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2200&q=88';

function CategorySkeleton() {
  return (
    <div className="rounded-3xl border border-white bg-white p-5 shadow-sm" aria-hidden="true">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-primary-100" />
      <div className="mt-5 h-5 w-2/3 animate-pulse rounded bg-gray-100" />
      <div className="mt-3 h-10 animate-pulse rounded bg-gray-50" />
      <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [topDestinations, setTopDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError(getApiErrorMessage(requestError, 'Chưa thể tải dữ liệu khám phá. Vui lòng thử lại sau.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadHomeData();
    return () => { active = false; };
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `${ROUTES.DESTINATIONS}?search=${encodeURIComponent(query)}` : ROUTES.DESTINATIONS);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <section className="relative isolate min-h-[590px] overflow-hidden bg-gray-900 text-white">
        <img
          src={HERO_IMAGE}
          alt="Phong cảnh du lịch Việt Nam"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-950/90 via-gray-950/65 to-primary-900/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />

        <div className="container flex min-h-[590px] items-center py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-100 backdrop-blur">
              <TripIcon name="compass" size={15} />
              Đi xa theo cách của bạn
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Mỗi hành trình bắt đầu từ một nơi đáng nhớ
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-200 sm:text-lg">
              Khám phá những điểm đến nổi bật, tìm trải nghiệm hợp gu và bắt đầu kế hoạch cho chuyến đi tiếp theo.
            </p>

            <form
              onSubmit={submitSearch}
              className="mt-8 flex w-full min-w-0 max-w-2xl flex-col gap-2 rounded-2xl border border-white/20 bg-white p-2 shadow-2xl shadow-gray-950/30 sm:flex-row"
            >
              <label htmlFor="home-destination-search" className="sr-only">Tìm kiếm địa điểm</label>
              <div className="relative min-w-0 flex-1">
                <TripIcon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="home-destination-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-12 w-full rounded-xl border-0 bg-white pl-12 pr-4 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary-200"
                  placeholder="Bạn muốn đi đâu?"
                  maxLength={200}
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-sm font-extrabold text-white shadow-lg shadow-primary-900/20 transition hover:bg-primary-700"
              >
                Khám phá ngay
                <TripIcon name="arrow-right" size={17} />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-gray-200 sm:text-sm">
              <span className="inline-flex items-center gap-2"><TripIcon name="check" size={16} className="text-primary-300" />Thông tin chọn lọc</span>
              <span className="inline-flex items-center gap-2"><TripIcon name="check" size={16} className="text-primary-300" />Tìm kiếm linh hoạt</span>
              <span className="inline-flex items-center gap-2"><TripIcon name="check" size={16} className="text-primary-300" />Lên lịch trình thông minh</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary-600">Tìm đúng cảm hứng</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Danh mục nổi bật</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">Chọn một phong cách du lịch và bắt đầu khám phá những địa điểm phù hợp.</p>
            </div>
            <Link to={ROUTES.DESTINATIONS} className="inline-flex items-center gap-2 text-sm font-extrabold text-primary-700">
              Xem tất cả địa điểm <TripIcon name="arrow-right" size={16} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => <CategorySkeleton key={index} />)
              : categories.map((category, index) => (
                  <CategoryCard key={category.id} category={category} index={index} />
                ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent-600">Được du khách yêu thích</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Top địa điểm đánh giá cao</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">Những lựa chọn nổi bật để bạn dễ dàng tìm được điểm dừng chân tiếp theo.</p>
            </div>
            <Link
              to={`${ROUTES.DESTINATIONS}?sortBy=rating&sortOrder=desc`}
              className="inline-flex items-center gap-2 text-sm font-extrabold text-primary-700"
            >
              Khám phá thêm <TripIcon name="arrow-right" size={16} />
            </Link>
          </div>

          {error && !isLoading && (
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700" role="alert">
              <TripIcon name="alert-circle" size={19} className="mt-0.5 flex-none" />
              <p>{error}</p>
            </div>
          )}

          <div className="trip-stagger mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <DestinationCardSkeleton key={index} />)
              : topDestinations.map((destination, index) => (
                  <DestinationCard key={destination.id} destination={destination} priority={index < 3} />
                ))}
          </div>
        </div>
      </section>

      <section className="pb-20 pt-4 sm:pb-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-[2rem] bg-gray-900 px-6 py-10 text-white shadow-xl sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-12">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary-500/25 blur-3xl" />
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-primary-300">
                <TripIcon name="sparkles" size={16} /> AI Planner
              </span>
              <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Có điểm đến rồi? Để AI giúp bạn xếp lịch trình.</h2>
              <p className="mt-3 text-sm leading-6 text-gray-300">Tạo lịch trình theo số ngày, ngân sách và sở thích cá nhân chỉ trong vài bước.</p>
            </div>
            <Link
              to={ROUTES.PREFERENCES}
              className="relative mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-extrabold text-gray-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-50 hover:text-primary-700 lg:mt-0"
            >
              Bắt đầu lập kế hoạch <TripIcon name="arrow-right" size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
