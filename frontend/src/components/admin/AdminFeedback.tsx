import type { PaginationMeta } from '@/types/admin.types';

export type AdminToastValue = { type: 'success' | 'error'; message: string } | null;

export function AdminToast({ toast }: { toast: AdminToastValue }) {
  if (!toast) return null;
  const success = toast.type === 'success';
  return (
    <div
      className={`trip-toast fixed right-4 top-20 z-[60] flex max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-xl ${success ? 'border-emerald-200 text-emerald-700' : 'border-rose-200 text-rose-700'}`}
      role="status"
    >
      <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-black ${success ? 'bg-emerald-100' : 'bg-rose-100'}`}>
        {success ? '✓' : '!'}
      </span>
      <p className="text-sm font-semibold leading-6">{toast.message}</p>
    </div>
  );
}

interface AdminPaginationProps {
  pagination: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({ pagination, page, onPageChange }: AdminPaginationProps) {
  if (pagination.totalPages <= 0) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Trang <b className="text-slate-700">{pagination.page}</b> / {pagination.totalPages} ·{' '}
        {pagination.total.toLocaleString('vi-VN')} kết quả
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="h-9 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Trước
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pagination.totalPages, page + 1))}
          disabled={page >= pagination.totalPages}
          className="h-9 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
