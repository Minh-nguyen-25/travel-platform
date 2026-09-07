import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import GrowthChart from '@/components/admin/GrowthChart';
import Button from '@/components/common/Button';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/admin.service';
import type {
  AnalyticsMetric,
  AnalyticsOverview,
  PopularDestination,
} from '@/types/admin.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

interface KpiCardProps {
  label: string;
  metric: AnalyticsMetric;
  detail: string;
  icon: ReactNode;
  theme: string;
}

const KpiCard = ({ label, metric, detail, icon, theme }: KpiCardProps) => {
  const growth = metric.growthPercentage;
  const positive = growth === null || growth >= 0;
  return (
    <article className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${theme}`}>{icon}</span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {growth === null ? 'Mới' : `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`}
        </span>
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{metric.total.toLocaleString('vi-VN')}</p>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-400">Trong kỳ</span>
        <span className="font-extrabold text-slate-700">+{metric.currentPeriod.toLocaleString('vi-VN')} · {detail}</span>
      </div>
    </article>
  );
};

const KpiSkeleton = () => (
  <div className="animate-pulse rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
    <div className="flex justify-between"><span className="h-11 w-11 rounded-2xl bg-slate-100" /><span className="h-6 w-14 rounded-full bg-slate-100" /></div>
    <span className="mt-5 block h-3 w-28 rounded bg-slate-100" /><span className="mt-3 block h-8 w-24 rounded bg-slate-100" /><span className="mt-5 block h-px bg-slate-100" /><span className="mt-3 block h-3 w-full rounded bg-slate-100" />
  </div>
);

interface RankingCardProps {
  title: string;
  subtitle: string;
  items: PopularDestination[];
  metric: (item: PopularDestination) => ReactNode;
  metricLabel: string;
  accent: 'blue' | 'amber';
}

const RankingCard = ({ title, subtitle, items, metric, metricLabel, accent }: RankingCardProps) => (
  <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
      <div>
        <h3 className="font-black text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
        {accent === 'blue' ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" strokeLinejoin="round" /></svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3 2.8 5.67 6.2.9-4.5 4.38 1.06 6.18L12 17.2l-5.56 2.93 1.06-6.18L3 9.57l6.2-.9L12 3Z" strokeLinejoin="round" /></svg>
        )}
      </span>
    </div>
    <div className="divide-y divide-slate-100">
      {items.slice(0, 5).map((item, index) => (
        <div key={item.id} className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6">
          <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-xl text-xs font-black ${index < 3 ? (accent === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700') : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-slate-800">{item.name}</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.categories.map((category) => category.name).join(' · ') || item.address}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-black ${accent === 'blue' ? 'text-blue-700' : 'text-amber-700'}`}>{metric(item)}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{metricLabel}</p>
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="px-6 py-12 text-center text-sm text-slate-400">Chưa có dữ liệu xếp hạng.</div>}
    </div>
  </section>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [periodDays, setPeriodDays] = useState(30);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadOverview = async () => {
      setIsLoading(true);
      setError('');
      try {
        setOverview(await adminService.getAnalytics(periodDays, controller.signal));
      } catch (loadError) {
        if (axios.isCancel(loadError)) return;
        setError(getApiErrorMessage(loadError, 'Không thể tải dữ liệu tổng quan.'));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadOverview();
    return () => controller.abort();
  }, [periodDays, reloadKey]);

  const favoriteRanking = useMemo(
    () => [...(overview?.popularDestinations ?? [])].sort((left, right) => right.favoriteCount - left.favoriteCount || right.engagementCount - left.engagementCount),
    [overview],
  );
  const ratingRanking = useMemo(
    () => [...(overview?.popularDestinations ?? [])].sort((left, right) => (right.averageReviewRating ?? right.rating) - (left.averageReviewRating ?? left.rating) || right.reviewCount - left.reviewCount),
    [overview],
  );

  const generatedTime = overview
    ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }).format(new Date(overview.generatedAt))
    : '';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-6 py-7 text-white shadow-xl shadow-blue-900/15 sm:px-8">
        <div className="absolute -right-10 -top-24 h-60 w-60 rounded-full border-[42px] border-white/10" />
        <div className="absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-normal text-blue-100">TravelGo Analytics</p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Chào {user?.fullName?.split(' ').slice(-1)[0] ?? 'Admin'}, đây là bức tranh hôm nay.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Theo dõi tăng trưởng người dùng, hoạt động cộng đồng và những điểm đến đang được quan tâm nhất.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[7, 30, 90].map((days) => (
              <button key={days} type="button" onClick={() => setPeriodDays(days)} className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${periodDays === days ? 'bg-white text-blue-700 shadow-lg' : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'}`}>{days} ngày</button>
            ))}
          </div>
        </div>
      </section>

      {error && !overview ? (
        <section className="flex flex-col items-center rounded-3xl border border-rose-200 bg-white px-6 py-16 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 font-black text-rose-600">!</span>
          <h3 className="mt-4 font-black text-slate-900">Không tải được Dashboard</h3>
          <p className="mt-2 max-w-md text-sm text-slate-500">{error}</p>
          <Button type="button" className="mt-5" onClick={() => setReloadKey((value) => value + 1)}>Thử lại</Button>
        </section>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading && !overview ? Array.from({ length: 4 }, (_, index) => <KpiSkeleton key={index} />) : overview && (
              <>
                <KpiCard label="Tổng người dùng" metric={overview.summary.users} detail={`${overview.summary.users.active} hoạt động`} theme="bg-blue-50 text-blue-600" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" /></svg>} />
                <KpiCard label="Địa điểm" metric={overview.summary.destinations} detail={`${overview.summary.destinations.active} hiển thị`} theme="bg-emerald-50 text-emerald-600" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>} />
                <KpiCard label="Chuyến đi" metric={overview.summary.trips} detail={`${overview.summary.trips.aiGenerated} từ AI`} theme="bg-violet-50 text-violet-600" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" strokeLinejoin="round" /><path d="M9 3v15M15 6v15" /></svg>} />
                <KpiCard label="Đánh giá" metric={overview.summary.reviews} detail={`${overview.summary.reviews.visible} hiển thị`} theme="bg-amber-50 text-amber-600" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3 2.8 5.67 6.2.9-4.5 4.38 1.06 6.18L12 17.2l-5.56 2.93 1.06-6.18L3 9.57l6.2-.9L12 3Z" strokeLinejoin="round" /></svg>} />
              </>
            )}
          </div>

          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-slate-900">Tăng trưởng theo ngày</h3>
                <p className="mt-1 text-xs text-slate-500">Người dùng mới, chuyến đi được tạo và đánh giá trong {periodDays} ngày</p>
              </div>
              <div className="flex items-center gap-3">
                {generatedTime && <span className="text-[11px] text-slate-400">Cập nhật {generatedTime}</span>}
                <button type="button" onClick={() => setReloadKey((value) => value + 1)} disabled={isLoading} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50" aria-label="Làm mới dữ liệu">
                  <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 0 0 6 6.5L4 11M5.5 15A7 7 0 0 0 18 17.5l2-4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
            {isLoading && !overview ? <div className="h-72 animate-pulse rounded-2xl bg-slate-50" /> : <GrowthChart data={overview?.dailyActivity ?? []} />}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <RankingCard title="Được yêu thích nhất" subtitle="Xếp hạng theo lượt lưu của người dùng" items={favoriteRanking} metric={(item) => item.favoriteCount.toLocaleString('vi-VN')} metricLabel="lượt lưu" accent="blue" />
            <RankingCard title="Đánh giá cao nhất" subtitle="Điểm trung bình từ các đánh giá hiển thị" items={ratingRanking} metric={(item) => `★ ${(item.averageReviewRating ?? item.rating).toFixed(1)}`} metricLabel="điểm trung bình" accent="amber" />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Dữ liệu được tính trực tiếp từ hoạt động trong hệ thống.</span>
            <div className="flex gap-4"><Link to={ROUTES.ADMIN_USERS} className="font-bold text-blue-600">Quản lý người dùng →</Link><Link to={ROUTES.ADMIN_DESTINATIONS} className="font-bold text-blue-600">Quản lý địa điểm →</Link></div>
          </div>
        </>
      )}
    </div>
  );
}
