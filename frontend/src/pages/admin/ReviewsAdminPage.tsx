import axios from 'axios';
import { useEffect, useState } from 'react';
import { AdminPagination, AdminToast } from '@/components/admin/AdminFeedback';
import type { AdminToastValue } from '@/components/admin/AdminFeedback';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { adminContentService } from '@/services/admin-content.service';
import type { PaginationMeta } from '@/types/admin.types';
import type { Destination } from '@/types/destination.types';
import type { Review } from '@/types/review.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

type VisibilityFilter = 'all' | 'visible' | 'hidden';
type ModerationAction = { type: 'visibility' | 'delete'; review: Review } | null;
const initialPagination: PaginationMeta = { page: 1, limit: 15, total: 0, totalPages: 0 };

const formatDateTime = (value: string): string => new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
}).format(new Date(value));

const initials = (name: string): string => name.trim().split(/\s+/).slice(-2)
  .map((part) => part.charAt(0).toUpperCase()).join('');

const Stars = ({ rating }: { rating: number }) => (
  <span className="flex gap-0.5" aria-label={`${rating} trên 5 sao`}>
    {Array.from({ length: 5 }, (_, index) => <span key={index} className={index < rating ? 'text-amber-400' : 'text-slate-200'}>★</span>)}
  </span>
);

const ReviewSkeleton = () => (
  <tbody className="divide-y divide-slate-100">
    {Array.from({ length: 7 }, (_, index) => <tr key={index} className="animate-pulse">
      <td className="px-5 py-4"><div className="flex gap-3"><span className="h-10 w-10 rounded-xl bg-slate-100" /><div className="space-y-2"><span className="block h-3 w-28 rounded bg-slate-100" /><span className="block h-2.5 w-16 rounded bg-slate-100" /></div></div></td>
      <td className="px-5 py-4"><div className="space-y-2"><span className="block h-3 w-24 rounded bg-slate-100" /><span className="block h-2.5 w-64 rounded bg-slate-100" /></div></td>
      <td className="px-5 py-4"><span className="block h-3 w-36 rounded bg-slate-100" /></td>
      <td className="px-5 py-4"><span className="block h-6 w-20 rounded-full bg-slate-100" /></td>
      <td className="px-5 py-4"><span className="ml-auto block h-9 w-44 rounded-xl bg-slate-100" /></td>
    </tr>)}
  </tbody>
);

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('all');
  const [destinationId, setDestinationId] = useState('all');
  const [visibility, setVisibility] = useState<VisibilityFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [moderationAction, setModerationAction] = useState<ModerationAction>(null);
  const [busyReviewId, setBusyReviewId] = useState<number | null>(null);
  const [toast, setToast] = useState<AdminToastValue>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const controller = new AbortController();
    const loadDestinations = async () => {
      try {
        const result = await adminContentService.getDestinations(
          { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' }, controller.signal,
        );
        setDestinations(result.data);
      } catch (loadError) {
        if (!axios.isCancel(loadError)) {
          setToast({ type: 'error', message: getApiErrorMessage(loadError, 'Không thể tải bộ lọc địa điểm.') });
        }
      }
    };
    void loadDestinations();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadReviews = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await adminContentService.getReviews({
          page,
          limit: 15,
          search: search || undefined,
          destinationId: destinationId === 'all' ? undefined : Number(destinationId),
          rating: rating === 'all' ? undefined : Number(rating),
          isVisible: visibility === 'all' ? undefined : visibility === 'visible',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }, controller.signal);
        setReviews(result.data);
        setPagination(result.pagination);
      } catch (loadError) {
        if (axios.isCancel(loadError)) return;
        setError(getApiErrorMessage(loadError, 'Không thể tải danh sách đánh giá.'));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadReviews();
    return () => controller.abort();
  }, [destinationId, page, rating, reloadKey, search, visibility]);

  const confirmModeration = async () => {
    if (!moderationAction) return;
    const { review, type } = moderationAction;
    setBusyReviewId(review.id);
    try {
      if (type === 'delete') {
        await adminContentService.deleteReview(review.id);
        setToast({ type: 'success', message: 'Đã xóa vĩnh viễn đánh giá spam.' });
        setModerationAction(null);
        if (reviews.length === 1 && page > 1) setPage((value) => value - 1);
        else setReloadKey((value) => value + 1);
      } else {
        const nextVisibility = !review.isVisible;
        const updated = await adminContentService.setReviewVisibility(review.id, nextVisibility);
        setReviews((current) => current.map((item) => item.id === updated.id ? updated : item));
        setToast({ type: 'success', message: nextVisibility ? 'Đã hiện lại đánh giá.' : 'Đã ẩn đánh giá vi phạm.' });
        setModerationAction(null);
        if (visibility !== 'all') setReloadKey((value) => value + 1);
      }
    } catch (moderationError) {
      setToast({ type: 'error', message: getApiErrorMessage(moderationError, type === 'delete' ? 'Không thể xóa đánh giá.' : 'Không thể thay đổi trạng thái đánh giá.') });
    } finally {
      setBusyReviewId(null);
    }
  };

  const hasFilters = Boolean(searchInput || rating !== 'all' || destinationId !== 'all' || visibility !== 'all');
  const clearFilters = () => { setSearchInput(''); setSearch(''); setRating('all'); setDestinationId('all'); setVisibility('all'); setPage(1); };

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} />

      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" strokeLinejoin="round" /></svg></span>
          <div><h2 className="text-xl font-black text-slate-900">Quản trị đánh giá</h2><p className="mt-1 text-sm text-slate-500">{pagination.total.toLocaleString('vi-VN')} đánh giá từ người dùng</p></div>
        </div>
        <Button type="button" variant="secondary" onClick={() => setReloadKey((value) => value + 1)} disabled={isLoading} className="rounded-xl"><svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 0 0 6 6.5L4 11M5.5 15A7 7 0 0 0 18 17.5l2-4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Làm mới</Button>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 xl:grid-cols-[minmax(250px,1fr)_220px_160px_180px_auto]">
          <div className="relative min-w-0"><svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" strokeLinecap="round" /></svg><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Tìm nội dung, người dùng..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" /></div>
          <select value={destinationId} onChange={(event) => { setDestinationId(event.target.value); setPage(1); }} className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"><option value="all">Tất cả địa điểm</option>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}</select>
          <select value={rating} onChange={(event) => { setRating(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"><option value="all">Mọi mức sao</option>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} sao</option>)}</select>
          <select value={visibility} onChange={(event) => { setVisibility(event.target.value as VisibilityFilter); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"><option value="all">Mọi trạng thái</option><option value="visible">Đang hiển thị</option><option value="hidden">Đã ẩn</option></select>
          {hasFilters && <button type="button" onClick={clearFilters} className="h-11 rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800">Xóa lọc</button>}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        {error ? <div className="flex flex-col items-center px-6 py-16 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 font-black text-rose-500">!</span><h3 className="mt-4 font-extrabold text-slate-900">Không tải được dữ liệu</h3><p className="mt-2 text-sm text-slate-500">{error}</p><Button type="button" className="mt-5" onClick={() => setReloadKey((value) => value + 1)}>Thử lại</Button></div> : <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] table-fixed text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-normal text-slate-400"><tr><th className="w-48 px-5 py-4">Người đánh giá</th><th className="px-5 py-4">Nội dung</th><th className="w-52 px-5 py-4">Địa điểm</th><th className="w-28 px-5 py-4">Trạng thái</th><th className="w-52 px-5 py-4 text-right">Kiểm duyệt</th></tr></thead>
            {isLoading ? <ReviewSkeleton /> : <tbody className="divide-y divide-slate-100">
              {reviews.map((review) => <tr key={review.id} className={`transition hover:bg-slate-50/70 ${!review.isVisible ? 'bg-slate-50/50' : ''}`}>
                <td className="px-5 py-4"><div className="flex items-center gap-3">{review.user.avatarUrl ? <img src={review.user.avatarUrl} alt="" className="h-10 w-10 rounded-xl object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 text-xs font-black text-amber-700">{initials(review.user.fullName)}</span>}<div className="min-w-0"><p className="max-w-44 truncate font-extrabold text-slate-800">{review.user.fullName}</p><p className="mt-1 text-[10px] text-slate-400">User #{review.userId}</p></div></div></td>
                <td className="px-5 py-4"><div className="flex items-center gap-2"><Stars rating={review.rating} /><span className="text-xs font-black text-amber-600">{review.rating}.0</span></div><p className={`mt-1.5 max-w-[380px] truncate text-xs ${review.comment ? 'text-slate-600' : 'italic text-slate-400'}`}>{review.comment || 'Không có nội dung bình luận'}</p>{review.images.length > 0 && <div className="mt-2 flex items-center gap-1.5">{review.images.slice(0, 3).map((image) => <img key={image.id} src={image.imageUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />)}{review.images.length > 3 && <span className="text-[10px] font-bold text-slate-400">+{review.images.length - 3} ảnh</span>}</div>}</td>
                <td className="px-5 py-4"><p className="max-w-48 truncate text-xs font-extrabold text-slate-700">{review.destination.name}</p><p className="mt-1 text-[10px] text-slate-400">{formatDateTime(review.createdAt)}</p></td>
                <td className="px-5 py-4"><span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold ${review.isVisible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200/70 text-slate-600'}`}><span className={`h-1.5 w-1.5 rounded-full ${review.isVisible ? 'bg-emerald-500' : 'bg-slate-400'}`} />{review.isVisible ? 'Đang hiển thị' : 'Đã ẩn'}</span></td>
                <td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => setModerationAction({ type: 'visibility', review })} disabled={busyReviewId === review.id} className={`h-9 rounded-xl border px-3 text-xs font-extrabold transition disabled:opacity-40 ${review.isVisible ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>{review.isVisible ? 'Ẩn vi phạm' : 'Hiện lại'}</button><button type="button" onClick={() => setModerationAction({ type: 'delete', review })} disabled={busyReviewId === review.id} className="h-9 rounded-xl border border-rose-200 px-3 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40">Xóa spam</button></div></td>
              </tr>)}
              {reviews.length === 0 && <tr><td colSpan={5} className="px-6 py-16 text-center"><p className="font-bold text-slate-700">Không tìm thấy đánh giá</p><p className="mt-1 text-sm text-slate-400">Hãy thử thay đổi từ khóa hoặc bộ lọc kiểm duyệt.</p></td></tr>}
            </tbody>}
          </table>
        </div>}
        {!error && !isLoading && <AdminPagination pagination={pagination} page={page} onPageChange={setPage} />}
      </section>

      <Modal isOpen={moderationAction !== null} onClose={() => !busyReviewId && setModerationAction(null)} title={moderationAction?.type === 'delete' ? 'Xóa đánh giá spam' : moderationAction?.review.isVisible ? 'Ẩn đánh giá vi phạm' : 'Hiện lại đánh giá'} size="sm" closeOnBackdrop={!busyReviewId}>
        {moderationAction && <div><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${moderationAction.type === 'delete' ? 'bg-rose-50 text-rose-600' : moderationAction.review.isVisible ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{moderationAction.type === 'delete' ? <path d="M4 7h16M9 7V4h6v3m-8 0 1 14h8l1-14M10 11v6m4-6v6" strokeLinecap="round" strokeLinejoin="round" /> : <path d={moderationAction.review.isVisible ? 'M3 3l18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 4.2A10.4 10.4 0 0 1 12 4c5 0 9 5 9 8a9.8 9.8 0 0 1-2 3.5M6.6 6.6C4.4 8 3 10.3 3 12c0 3 4 8 9 8 1.4 0 2.7-.4 3.8-1' : 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'} strokeLinecap="round" strokeLinejoin="round" />}</svg></span><p className="mt-4 text-sm leading-6 text-slate-600">{moderationAction.type === 'delete' ? 'Đánh giá và toàn bộ ảnh đính kèm sẽ bị xóa vĩnh viễn. Điểm trung bình của địa điểm được tính lại tự động.' : moderationAction.review.isVisible ? 'Đánh giá sẽ bị ẩn khỏi trang địa điểm và không còn được tính vào điểm trung bình.' : 'Đánh giá sẽ xuất hiện trở lại và được tính vào điểm trung bình của địa điểm.'}</p><div className="mt-4 rounded-xl bg-slate-50 p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-extrabold text-slate-800">{moderationAction.review.user.fullName}</p><Stars rating={moderationAction.review.rating} /></div><p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{moderationAction.review.comment || 'Không có nội dung bình luận'}</p></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setModerationAction(null)} disabled={busyReviewId !== null}>Hủy</Button><Button type="button" variant={moderationAction.type === 'delete' ? 'danger' : 'primary'} onClick={() => void confirmModeration()} isLoading={busyReviewId === moderationAction.review.id}>{moderationAction.type === 'delete' ? 'Xóa vĩnh viễn' : moderationAction.review.isVisible ? 'Xác nhận ẩn' : 'Hiện lại'}</Button></div></div>}
      </Modal>
    </div>
  );
}
