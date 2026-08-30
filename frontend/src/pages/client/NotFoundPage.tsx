import { Link } from 'react-router-dom';
import TripIcon from '@/components/trip/TripIcon';
import { ROUTES } from '@/constants';

export default function NotFoundPage() {
  return (
    <div className="relative isolate flex min-h-[calc(100vh-4.5rem)] items-center overflow-hidden bg-sand-50 px-4 py-16">
      <div className="absolute left-[8%] top-[12%] -z-10 h-72 w-72 rounded-full bg-primary-100/70 blur-3xl" />
      <div className="absolute bottom-[8%] right-[6%] -z-10 h-72 w-72 rounded-full bg-accent-100/70 blur-3xl" />

      <div className="container grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="text-center lg:text-left">
          <p className="eyebrow justify-center lg:justify-start"><TripIcon name="compass" size={15} />Lạc khỏi bản đồ</p>
          <p className="display-title mt-4 select-none text-[clamp(6rem,18vw,12rem)] leading-none text-primary-100">404</p>
          <h1 className="display-title -mt-4 text-4xl text-navy-900 sm:text-5xl">Cung đường này chưa được mở.</h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-500 lg:mx-0">
            Có thể trang đã đổi địa chỉ, hoặc bạn vừa rẽ vào một lối đi chưa có trên bản đồ TravelPlatform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link to={ROUTES.HOME} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary-700 px-5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-1 hover:bg-primary-800 hover:text-white"><TripIcon name="arrow-left" size={17} />Về trang chủ</Link>
            <Link to={ROUTES.DESTINATIONS} className="inline-flex h-12 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-sm font-extrabold text-gray-700 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:text-primary-800"><TripIcon name="globe" size={17} />Khám phá điểm đến</Link>
          </div>
        </div>

        <div className="not-found-visual relative mx-auto aspect-[4/5] w-full max-w-[30rem] overflow-hidden rounded-[2.5rem] border-8 border-white shadow-float sm:aspect-square">
          <img src="/images/vietnam-ninh-binh-discovery.jpg" alt="Cảnh sông núi Ninh Bình phủ sương sớm" className="not-found-visual__image absolute inset-0 h-full w-full object-cover object-[62%_50%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-transparent to-primary-900/15" />
          <svg className="absolute inset-0 h-full w-full text-white/70" viewBox="0 0 500 500" fill="none" aria-hidden="true">
            <path d="M38 405C109 318 156 354 216 252C276 149 328 296 454 76" stroke="currentColor" strokeWidth="3" strokeDasharray="8 12" />
          </svg>
          <span className="not-found-visual__pin absolute left-[34%] top-[42%] flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-xl shadow-accent-900/20"><TripIcon name="map-pin" size={34} /></span>
          <span className="absolute bottom-[10%] right-[10%] flex h-14 w-14 rotate-12 items-center justify-center rounded-2xl bg-navy-900 text-primary-100 shadow-xl"><TripIcon name="plane" size={25} /></span>
          <span className="absolute right-[10%] top-[10%] flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-secondary-700 shadow-lg backdrop-blur"><TripIcon name="compass" size={20} /></span>
        </div>
      </div>
    </div>
  );
}
