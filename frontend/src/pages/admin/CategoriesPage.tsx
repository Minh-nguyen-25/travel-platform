import axios from 'axios';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AdminPagination, AdminToast } from '@/components/admin/AdminFeedback';
import type { AdminToastValue } from '@/components/admin/AdminFeedback';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { adminContentService } from '@/services/admin-content.service';
import type { CategoryUpsertPayload } from '@/types/admin-content.types';
import type { PaginationMeta } from '@/types/admin.types';
import type { Category } from '@/types/destination.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

const initialPagination: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 0 };
const inputClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100';

const formatDate = (value: string): string => new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric',
}).format(new Date(value));

const CategorySkeleton = () => (
  <tbody className="divide-y divide-slate-100">
    {Array.from({ length: 6 }, (_, index) => <tr key={index} className="animate-pulse">
      <td className="px-5 py-4"><div className="space-y-2"><span className="block h-3 w-36 rounded bg-slate-100" /><span className="block h-2.5 w-64 rounded bg-slate-100" /></div></td>
      <td className="px-5 py-4"><span className="block h-8 w-20 rounded-xl bg-slate-100" /></td>
      <td className="px-5 py-4"><span className="block h-3 w-24 rounded bg-slate-100" /></td>
      <td className="px-5 py-4"><span className="ml-auto block h-9 w-36 rounded-xl bg-slate-100" /></td>
    </tr>)}
  </tbody>
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name'>('createdAt');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [busyCategoryId, setBusyCategoryId] = useState<number | null>(null);
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
      setIsLoading(true);
      setError('');
      try {
        const result = await adminContentService.getCategories({
          page, limit: 10, search: search || undefined, sortBy, sortOrder: sortBy === 'name' ? 'asc' : 'desc',
        }, controller.signal);
        setCategories(result.data);
        setPagination(result.pagination);
      } catch (loadError) {
        if (axios.isCancel(loadError)) return;
        setError(getApiErrorMessage(loadError, 'Không thể tải danh sách danh mục.'));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadCategories();
    return () => controller.abort();
  }, [page, reloadKey, search, sortBy]);

  const openCreateForm = () => {
    setEditingCategory(null); setName(''); setDescription(''); setFormError(''); setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category); setName(category.name); setDescription(category.description ?? ''); setFormError(''); setIsFormOpen(true);
  };

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) { setFormError('Vui lòng nhập tên danh mục.'); return; }
    const payload: CategoryUpsertPayload = { name: name.trim(), description: description.trim() };
    setIsSaving(true);
    setFormError('');
    try {
      const updated = editingCategory
        ? await adminContentService.updateCategory(editingCategory.id, payload)
        : await adminContentService.createCategory(payload);
      setCategories((current) => editingCategory
        ? current.map((category) => category.id === updated.id ? updated : category)
        : current,
      );
      setToast({ type: 'success', message: editingCategory ? `Đã cập nhật danh mục ${updated.name}.` : `Đã thêm danh mục ${updated.name}.` });
      setIsFormOpen(false);
      setEditingCategory(null);
      setReloadKey((value) => value + 1);
    } catch (saveError) {
      setFormError(getApiErrorMessage(saveError, 'Không thể lưu danh mục.'));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyCategoryId(deleteTarget.id);
    try {
      await adminContentService.deleteCategory(deleteTarget.id);
      setToast({ type: 'success', message: `Đã xóa danh mục ${deleteTarget.name}.` });
      setDeleteTarget(null);
      if (categories.length === 1 && page > 1) setPage((value) => value - 1);
      else setReloadKey((value) => value + 1);
    } catch (deleteError) {
      setToast({
        type: 'error',
        message: getApiErrorMessage(deleteError, deleteTarget.destinationCount > 0
          ? 'Danh mục đang được sử dụng. Hãy gỡ danh mục khỏi các địa điểm trước khi xóa.'
          : 'Không thể xóa danh mục.'),
      });
    } finally {
      setBusyCategoryId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} />

      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5a2 2 0 0 1 2-2h4l2 3h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" strokeLinejoin="round" /></svg></span>
          <div><h2 className="text-xl font-black text-slate-900">Quản lý danh mục</h2><p className="mt-1 text-sm text-slate-500">{pagination.total.toLocaleString('vi-VN')} nhóm chủ đề du lịch</p></div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="secondary" onClick={() => setReloadKey((value) => value + 1)} disabled={isLoading} className="rounded-xl"><svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 0 0 6 6.5L4 11M5.5 15A7 7 0 0 0 18 17.5l2-4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Làm mới</Button>
          <Button type="button" onClick={openCreateForm} className="rounded-xl"><span className="text-lg leading-none">+</span> Thêm danh mục</Button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_220px_auto]">
          <div className="relative min-w-0"><svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" strokeLinecap="round" /></svg><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Tìm tên hoặc mô tả..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100" /></div>
          <select value={sortBy} onChange={(event) => { setSortBy(event.target.value as 'createdAt' | 'name'); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"><option value="createdAt">Mới tạo gần đây</option><option value="name">Tên A–Z</option></select>
          {searchInput && <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} className="h-11 rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800">Xóa tìm kiếm</button>}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        {error ? <div className="flex flex-col items-center px-6 py-16 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 font-black text-rose-500">!</span><h3 className="mt-4 font-extrabold text-slate-900">Không tải được dữ liệu</h3><p className="mt-2 text-sm text-slate-500">{error}</p><Button type="button" className="mt-5" onClick={() => setReloadKey((value) => value + 1)}>Thử lại</Button></div> : <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Danh mục</th><th className="px-5 py-4">Địa điểm</th><th className="px-5 py-4">Ngày tạo</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead>
            {isLoading ? <CategorySkeleton /> : <tbody className="divide-y divide-slate-100">
              {categories.map((category) => <tr key={category.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-4"><div className="flex items-start gap-3"><span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-blue-50 font-black text-violet-600">{category.name.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="font-extrabold text-slate-800">{category.name}</p><p className="mt-1 max-w-xl truncate text-xs text-slate-500">{category.description || 'Chưa có mô tả'}</p></div></div></td>
                <td className="px-5 py-4"><span className="inline-flex min-w-16 justify-center rounded-xl bg-cyan-50 px-3 py-2 text-xs font-extrabold text-cyan-700">{category.destinationCount} địa điểm</span></td>
                <td className="px-5 py-4"><p className="text-xs font-semibold text-slate-600">{formatDate(category.createdAt)}</p><p className="mt-1 text-[10px] text-slate-400">Sửa {formatDate(category.updatedAt)}</p></td>
                <td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEditForm(category)} className="h-9 rounded-xl border border-blue-200 px-3 text-xs font-extrabold text-blue-600 transition hover:bg-blue-50">Chỉnh sửa</button><button type="button" onClick={() => setDeleteTarget(category)} disabled={busyCategoryId === category.id} className="h-9 rounded-xl border border-rose-200 px-3 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40">Xóa</button></div></td>
              </tr>)}
              {categories.length === 0 && <tr><td colSpan={4} className="px-6 py-16 text-center"><p className="font-bold text-slate-700">Không tìm thấy danh mục</p><p className="mt-1 text-sm text-slate-400">Hãy thử một từ khóa khác hoặc tạo danh mục mới.</p></td></tr>}
            </tbody>}
          </table>
        </div>}
        {!error && !isLoading && <AdminPagination pagination={pagination} page={page} onPageChange={setPage} />}
      </section>

      <Modal isOpen={isFormOpen} onClose={() => !isSaving && setIsFormOpen(false)} title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'} size="md" closeOnBackdrop={!isSaving}>
        <form onSubmit={(event) => void submitCategory(event)}>
          <div className="rounded-2xl bg-violet-50/70 p-4"><p className="text-sm font-extrabold text-violet-800">Phân loại điểm đến</p><p className="mt-1 text-xs leading-5 text-violet-600">Tên ngắn gọn giúp khách du lịch tìm đúng trải nghiệm nhanh hơn.</p></div>
          <label className="mt-5 block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Tên danh mục <span className="text-rose-500">*</span></span><input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="Ví dụ: Văn hóa & Lịch sử" autoFocus required /></label>
          <label className="mt-4 block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Mô tả</span><textarea className={`${inputClass} min-h-28 resize-y py-3`} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} placeholder="Mô tả ngắn về nhóm địa điểm này..." /></label>
          {formError && <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700">{formError}</p>}
          <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} disabled={isSaving}>Hủy</Button><Button type="submit" isLoading={isSaving}>{editingCategory ? 'Lưu thay đổi' : 'Thêm danh mục'}</Button></div>
        </form>
      </Modal>

      <Modal isOpen={deleteTarget !== null} onClose={() => !busyCategoryId && setDeleteTarget(null)} title="Xóa danh mục" size="sm" closeOnBackdrop={!busyCategoryId}>
        {deleteTarget && <div><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V4h6v3m-8 0 1 14h8l1-14M10 11v6m4-6v6" strokeLinecap="round" strokeLinejoin="round" /></svg></span><p className="mt-4 text-sm leading-6 text-slate-600">Thao tác này xóa vĩnh viễn danh mục và không thể hoàn tác.</p><div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-sm font-extrabold text-slate-800">{deleteTarget.name}</p><p className={`mt-1 text-xs font-semibold ${deleteTarget.destinationCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>{deleteTarget.destinationCount > 0 ? `Đang được ${deleteTarget.destinationCount} địa điểm sử dụng; máy chủ có thể từ chối xóa.` : 'Danh mục chưa có địa điểm liên kết.'}</p></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={busyCategoryId !== null}>Hủy</Button><Button type="button" variant="danger" onClick={() => void confirmDelete()} isLoading={busyCategoryId === deleteTarget.id}>Xác nhận xóa</Button></div></div>}
      </Modal>
    </div>
  );
}
