import axios from 'axios';
import { useEffect, useState } from 'react';
import { AdminPagination, AdminToast } from '@/components/admin/AdminFeedback';
import type { AdminToastValue } from '@/components/admin/AdminFeedback';
import DestinationFormModal from '@/components/admin/DestinationFormModal';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { adminContentService } from '@/services/admin-content.service';
import type { DestinationUpsertPayload } from '@/types/admin-content.types';
import type { PaginationMeta } from '@/types/admin.types';
import type { Category, Destination } from '@/types/destination.types';
import { formatCurrency, getApiErrorMessage } from '@/utils/trip.utils';

type StatusFilter = 'all' | 'active' | 'inactive';
const initialPagination: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 0 };

const formatDate = (value: string): string => new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric',
}).format(new Date(value));

const primaryImage = (destination: Destination): string | undefined =>
  destination.images.find(({ isPrimary }) => isPrimary)?.imageUrl ?? destination.images[0]?.imageUrl;

const DestinationSkeleton = () => (
  <tbody className="divide-y divide-slate-100">
    {Array.from({ length: 6 }, (_, index) => <tr key={index} className="animate-pulse">
      <td className="px-5 py-4"><div className="flex gap-3"><span className="h-14 w-20 rounded-xl bg-slate-100" /><div className="space-y-2 pt-1"><span className="block h-3 w-36 rounded bg-slate-100" /><span className="block h-2.5 w-48 rounded bg-slate-100" /></div></div></td>
      <td className="px-5 py-4"><span className="block h-6 w-24 rounded-full bg-slate-100" /></td>
      <td className="px-5 py-4"><span className="block h-3 w-20 rounded bg-slate-100" /></td>
      <td className="px-5 py-4"><span className="block h-6 w-20 rounded-full bg-slate-100" /></td>
      <td className="px-5 py-4"><span className="ml-auto block h-9 w-36 rounded-xl bg-slate-100" /></td>
    </tr>)}
  </tbody>
);

export default function DestinationsAdminPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [formDestination, setFormDestination] = useState<Destination | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [visibilityTarget, setVisibilityTarget] = useState<Destination | null>(null);
  const [busyDestinationId, setBusyDestinationId] = useState<number | null>(null);
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
    const loadCategories = async () => {
      try {
        const result = await adminContentService.getCategories(
          { page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' }, controller.signal,
        );
        setCategories(result.data);
      } catch (loadError) {
        if (!axios.isCancel(loadError)) {
          setToast({ type: 'error', message: getApiErrorMessage(loadError, 'Không thể tải danh mục.') });
        }
      }
    };
    void loadCategories();
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    const loadDestinations = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await adminContentService.getDestinations({
          page,
          limit: 10,
          search: search || undefined,
          categoryIds: categoryId === 'all' ? undefined : [Number(categoryId)],
          isActive: status === 'all' ? undefined : status === 'active',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }, controller.signal);
        setDestinations(result.data);
        setPagination(result.pagination);
      } catch (loadError) {
        if (axios.isCancel(loadError)) return;
        setError(getApiErrorMessage(loadError, 'Không thể tải danh sách địa điểm.'));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadDestinations();
    return () => controller.abort();
  }, [categoryId, page, reloadKey, search, status]);

  const openCreateForm = () => { setFormDestination(null); setIsFormOpen(true); };
  const openEditForm = (destination: Destination) => { setFormDestination(destination); setIsFormOpen(true); };

  const submitDestination = async (payload: DestinationUpsertPayload) => {
    setIsSaving(true);
    try {
      const updated = formDestination
        ? await adminContentService.updateDestination(formDestination.id, payload)
        : await adminContentService.createDestination(payload);
      setDestinations((current) => formDestination
        ? current.map((item) => item.id === updated.id ? updated : item)
        : current,
      );
      setToast({
        type: 'success',
        message: formDestination ? `Đã cập nhật ${updated.name}.` : `Đã thêm ${updated.name}.`,
      });
      setIsFormOpen(false);
      setFormDestination(null);
      setReloadKey((value) => value + 1);
    } catch (saveError) {
      setToast({ type: 'error', message: getApiErrorMessage(saveError, 'Không thể lưu địa điểm.') });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmVisibility = async () => {
    if (!visibilityTarget) return;
    const nextStatus = !visibilityTarget.isActive;
    setBusyDestinationId(visibilityTarget.id);
    try {
      const updated = await adminContentService.setDestinationVisibility(visibilityTarget.id, nextStatus);
      setDestinations((current) => current.map((item) => item.id === updated.id ? updated : item));
      setToast({ type: 'success', message: `${nextStatus ? 'Đã hiện' : 'Đã ẩn'} địa điểm ${visibilityTarget.name}.` });
      setVisibilityTarget(null);
      if (status !== 'all') setReloadKey((value) => value + 1);
    } catch (visibilityError) {
      setToast({ type: 'error', message: getApiErrorMessage(visibilityError, 'Không thể cập nhật trạng thái địa điểm.') });
    } finally {
      setBusyDestinationId(null);
    }
  };

  const hasFilters = Boolean(searchInput || categoryId !== 'all' || status !== 'all');
  const clearFilters = () => { setSearchInput(''); setSearch(''); setCategoryId('all'); setStatus('all'); setPage(1); };

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} />

      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg></span>
          <div><h2 className="text-xl font-black text-slate-900">Quản lý địa điểm</h2><p className="mt-1 text-sm text-slate-500">{pagination.total.toLocaleString('vi-VN')} địa điểm trong hệ thống</p></div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="secondary" onClick={() => setReloadKey((value) => value + 1)} disabled={isLoading} className="rounded-xl"><svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 0 0 6 6.5L4 11M5.5 15A7 7 0 0 0 18 17.5l2-4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Làm mới</Button>
          <Button type="button" onClick={openCreateForm} className="rounded-xl"><span className="text-lg leading-none">+</span> Thêm địa điểm</Button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_190px_auto]">
          <div className="relative min-w-0"><svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" strokeLinecap="round" /></svg><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Tìm tên, địa chỉ..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" /></div>
          <select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"><option value="all">Tất cả danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
          <select value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"><option value="all">Tất cả trạng thái</option><option value="active">Đang hiển thị</option><option value="inactive">Đang ẩn</option></select>
          {hasFilters && <button type="button" onClick={clearFilters} className="h-11 rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800">Xóa lọc</button>}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        {error ? <div className="flex flex-col items-center px-6 py-16 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 font-black text-rose-500">!</span><h3 className="mt-4 font-extrabold text-slate-900">Không tải được dữ liệu</h3><p className="mt-2 max-w-md text-sm text-slate-500">{error}</p><Button type="button" className="mt-5" onClick={() => setReloadKey((value) => value + 1)}>Thử lại</Button></div> : <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Địa điểm</th><th className="px-5 py-4">Danh mục</th><th className="px-5 py-4">Giá & đánh giá</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead>
            {isLoading ? <DestinationSkeleton /> : <tbody className="divide-y divide-slate-100">
              {destinations.map((destination) => {
                const image = primaryImage(destination);
                return <tr key={destination.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4"><div className="flex items-center gap-3">{image ? <img src={image} alt="" className="h-14 w-20 rounded-xl object-cover" /> : <span className="flex h-14 w-20 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m21 15-4-4L5 20" /></svg></span>}<div className="min-w-0"><p className="max-w-72 truncate font-extrabold text-slate-800">{destination.name}</p><p className="mt-1 max-w-80 truncate text-xs text-slate-500">{destination.address}</p><p className="mt-1 text-[10px] text-slate-400">Cập nhật {formatDate(destination.updatedAt)} · {destination.images.length} ảnh</p></div></div></td>
                  <td className="px-5 py-4"><div className="flex max-w-56 flex-wrap gap-1.5">{destination.categories.slice(0, 2).map((category) => <span key={category.id} className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-700">{category.name}</span>)}{destination.categories.length > 2 && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">+{destination.categories.length - 2}</span>}</div></td>
                  <td className="px-5 py-4"><p className="font-extrabold text-slate-700">{formatCurrency(destination.ticketPrice)}</p><p className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-500"><span>★</span> {Number(destination.rating).toFixed(1)}</p></td>
                  <td className="px-5 py-4"><span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold ${destination.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}><span className={`h-1.5 w-1.5 rounded-full ${destination.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />{destination.isActive ? 'Đang hiển thị' : 'Đang ẩn'}</span></td>
                  <td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEditForm(destination)} className="h-9 rounded-xl border border-blue-200 px-3 text-xs font-extrabold text-blue-600 transition hover:bg-blue-50">Chỉnh sửa</button><button type="button" onClick={() => setVisibilityTarget(destination)} disabled={busyDestinationId === destination.id} className={`h-9 rounded-xl border px-3 text-xs font-extrabold transition disabled:opacity-40 ${destination.isActive ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>{destination.isActive ? 'Ẩn' : 'Hiện'}</button></div></td>
                </tr>;
              })}
              {destinations.length === 0 && <tr><td colSpan={5} className="px-6 py-16 text-center"><p className="font-bold text-slate-700">Không tìm thấy địa điểm</p><p className="mt-1 text-sm text-slate-400">Hãy thử thay đổi từ khóa hoặc bộ lọc.</p></td></tr>}
            </tbody>}
          </table>
        </div>}
        {!error && !isLoading && <AdminPagination pagination={pagination} page={page} onPageChange={setPage} />}
      </section>

      <DestinationFormModal isOpen={isFormOpen} destination={formDestination} categories={categories} isSaving={isSaving} onClose={() => { setIsFormOpen(false); setFormDestination(null); }} onSubmit={submitDestination} />

      <Modal isOpen={visibilityTarget !== null} onClose={() => !busyDestinationId && setVisibilityTarget(null)} title={visibilityTarget?.isActive ? 'Ẩn địa điểm' : 'Hiện địa điểm'} size="sm" closeOnBackdrop={!busyDestinationId}>
        {visibilityTarget && <div><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${visibilityTarget.isActive ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={visibilityTarget.isActive ? 'M3 3l18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 4.2A10.4 10.4 0 0 1 12 4c5 0 9 5 9 8a9.8 9.8 0 0 1-2 3.5M6.6 6.6C4.4 8 3 10.3 3 12c0 3 4 8 9 8 1.4 0 2.7-.4 3.8-1' : 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'} strokeLinecap="round" strokeLinejoin="round" /></svg></span><p className="mt-4 text-sm leading-6 text-slate-600">{visibilityTarget.isActive ? 'Địa điểm sẽ biến mất khỏi trang khám phá nhưng dữ liệu vẫn được giữ lại để có thể hiện lại sau.' : 'Địa điểm sẽ xuất hiện trở lại trên trang khám phá và kết quả tìm kiếm.'}</p><div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-extrabold text-slate-800">{visibilityTarget.name}</div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setVisibilityTarget(null)} disabled={busyDestinationId !== null}>Hủy</Button><Button type="button" variant={visibilityTarget.isActive ? 'danger' : 'primary'} onClick={() => void confirmVisibility()} isLoading={busyDestinationId === visibilityTarget.id}>{visibilityTarget.isActive ? 'Xác nhận ẩn' : 'Hiện địa điểm'}</Button></div></div>}
      </Modal>
    </div>
  );
}
