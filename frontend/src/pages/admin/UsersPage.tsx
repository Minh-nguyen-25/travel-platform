import axios from 'axios';
import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/admin.service';
import type { AdminUser, PaginationMeta } from '@/types/admin.types';
import type { UserRole } from '@/types/auth.types';
import { getApiErrorMessage } from '@/utils/trip.utils';

type StatusFilter = 'all' | 'active' | 'inactive';
type Toast = { type: 'success' | 'error'; message: string } | null;

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));

const initials = (name: string): string =>
  name.trim().split(/\s+/).slice(-2).map((part) => part.charAt(0).toUpperCase()).join('');

const TableSkeleton = () => (
  <tbody className="divide-y divide-slate-100">
    {Array.from({ length: 6 }, (_, index) => (
      <tr key={index} className="animate-pulse">
        <td className="px-5 py-4"><div className="flex gap-3"><span className="h-10 w-10 rounded-xl bg-slate-100" /><div className="space-y-2"><span className="block h-3 w-28 rounded bg-slate-100" /><span className="block h-2.5 w-36 rounded bg-slate-100" /></div></div></td>
        <td className="px-5 py-4"><span className="block h-6 w-16 rounded-full bg-slate-100" /></td>
        <td className="px-5 py-4"><span className="block h-6 w-20 rounded-full bg-slate-100" /></td>
        <td className="px-5 py-4"><span className="block h-3 w-20 rounded bg-slate-100" /></td>
        <td className="px-5 py-4"><span className="block h-6 w-20 rounded-full bg-slate-100" /></td>
        <td className="px-5 py-4"><span className="ml-auto block h-9 w-24 rounded-lg bg-slate-100" /></td>
      </tr>
    ))}
  </tbody>
);

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | UserRole>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [targetRoleUser, setTargetRoleUser] = useState<AdminUser | null>(null);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const controller = new AbortController();
    const loadUsers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await adminService.getUsers(
          {
            page,
            limit: 10,
            search: search || undefined,
            role: role === 'all' ? undefined : role,
            isActive: status === 'all' ? undefined : status === 'active',
            sortBy: 'createdAt',
            sortOrder: 'desc',
          },
          controller.signal,
        );
        setUsers(result.data);
        setPagination(result.pagination);
      } catch (loadError) {
        if (axios.isCancel(loadError)) return;
        setError(getApiErrorMessage(loadError, 'Không thể tải danh sách người dùng.'));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void loadUsers();
    return () => controller.abort();
  }, [page, reloadKey, role, search, status]);

  const confirmStatusChange = async () => {
    if (!targetUser) return;
    const nextStatus = !targetUser.isActive;
    setBusyUserId(targetUser.id);
    try {
      const updated = await adminService.setUserStatus(targetUser.id, nextStatus);
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
      setToast({
        type: 'success',
        message: `${nextStatus ? 'Đã mở khóa' : 'Đã khóa'} tài khoản ${targetUser.fullName}.`,
      });
      setTargetUser(null);
      if (status !== 'all') setReloadKey((value) => value + 1);
    } catch (statusError) {
      setToast({
        type: 'error',
        message: getApiErrorMessage(statusError, 'Không thể cập nhật trạng thái tài khoản.'),
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const confirmRoleChange = async () => {
    if (!targetRoleUser) return;
    const nextRole: UserRole = targetRoleUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setBusyUserId(targetRoleUser.id);
    try {
      const updated = await adminService.setUserRole(targetRoleUser.id, nextRole);
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
      setToast({
        type: 'success',
        message: `Đã đổi vai trò của ${targetRoleUser.fullName} thành ${nextRole === 'ADMIN' ? 'Quản trị viên (ADMIN)' : 'Người dùng (USER)'}.`,
      });
      setTargetRoleUser(null);
      if (role !== 'all') setReloadKey((value) => value + 1);
    } catch (roleError) {
      setToast({
        type: 'error',
        message: getApiErrorMessage(roleError, 'Không thể cập nhật vai trò người dùng.'),
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const hasFilters = Boolean(searchInput || role !== 'all' || status !== 'all');
  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setRole('all');
    setStatus('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`trip-toast fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 shadow-xl ${toast.type === 'success' ? 'border-emerald-200 text-emerald-700' : 'border-rose-200 text-rose-700'}`} role="status">
          <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-black ${toast.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>{toast.type === 'success' ? '✓' : '!'}</span>
          <p className="text-sm font-semibold leading-6">{toast.message}</p>
        </div>
      )}

      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" /></svg>
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900">Quản lý người dùng</h2>
              <p className="mt-1 text-sm text-slate-500">{pagination.total.toLocaleString('vi-VN')} tài khoản trong hệ thống</p>
            </div>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={() => setReloadKey((value) => value + 1)} disabled={isLoading} className="rounded-xl">
          <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6v5h-5M4 18v-5h5M18.5 9A7 7 0 0 0 6 6.5L4 11M5.5 15A7 7 0 0 0 18 17.5l2-4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Làm mới
        </Button>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_200px_200px_auto]">
          <div className="relative min-w-0">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" strokeLinecap="round" /></svg>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <select value={role} onChange={(event) => { setRole(event.target.value as 'all' | UserRole); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
            <option value="all">Tất cả vai trò</option>
            <option value="USER">Người dùng</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
          <select value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); setPage(1); }} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="h-11 rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800">Xóa lọc</button>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        {error ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">!</span>
            <h3 className="mt-4 font-extrabold text-slate-900">Không tải được dữ liệu</h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">{error}</p>
            <Button type="button" className="mt-5" onClick={() => setReloadKey((value) => value + 1)}>Thử lại</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-normal text-slate-400">
                <tr>
                  <th className="px-5 py-4">Người dùng</th>
                  <th className="px-5 py-4">Vai trò</th>
                  <th className="px-5 py-4">Đăng nhập</th>
                  <th className="px-5 py-4">Hoạt động</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              {isLoading ? <TableSkeleton /> : (
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const isSelf = user.id === currentUser?.id;
                    return (
                      <tr key={user.id} className="transition hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-xl object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 text-xs font-black text-blue-700">{initials(user.fullName)}</span>}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2"><p className="max-w-52 truncate font-extrabold text-slate-800">{user.fullName}</p>{isSelf && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">Bạn</span>}</div>
                              <p className="mt-0.5 max-w-60 truncate text-xs text-slate-500">{user.email}</p>
                              <p className="mt-1 text-[10px] text-slate-400">Tham gia {formatDate(user.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${user.role === 'ADMIN' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>{user.role === 'ADMIN' ? 'ADMIN' : 'USER'}</span></td>
                        <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${user.authProvider === 'GOOGLE' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{user.authProvider === 'GOOGLE' ? 'Google' : 'Email'}</span></td>
                        <td className="px-5 py-4"><div className="flex gap-3 text-xs text-slate-500"><span title="Chuyến đi"><b className="text-slate-700">{user.counts.trips}</b> chuyến</span><span title="Đánh giá"><b className="text-slate-700">{user.counts.reviews}</b> đánh giá</span></div></td>
                        <td className="px-5 py-4"><span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />{user.isActive ? 'Hoạt động' : 'Đã khóa'}</span></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setTargetRoleUser(user)}
                              disabled={isSelf || busyUserId === user.id}
                              title={isSelf ? 'Bạn không thể tự đổi quyền của mình' : (user.role === 'ADMIN' ? 'Hạ quyền xuống USER' : 'Nâng quyền lên ADMIN')}
                              className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                user.role === 'ADMIN'
                                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                  : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                              }`}
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              </svg>
                              {user.role === 'ADMIN' ? 'Hạ USER' : 'Nâng ADMIN'}
                            </button>

                            <button
                              type="button"
                              onClick={() => setTargetUser(user)}
                              disabled={isSelf || busyUserId === user.id}
                              title={isSelf ? 'Bạn không thể tự khóa tài khoản của mình' : undefined}
                              className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                user.isActive
                                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {user.isActive ? 'Khóa' : 'Mở khóa'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-16 text-center"><p className="font-bold text-slate-700">Không tìm thấy người dùng</p><p className="mt-1 text-sm text-slate-400">Hãy thử thay đổi từ khóa hoặc bộ lọc.</p></td></tr>
                  )}
                </tbody>
              )}
            </table>
          </div>
        )}

        {!error && !isLoading && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Trang <b className="text-slate-700">{pagination.page}</b> / {pagination.totalPages} · {pagination.total.toLocaleString('vi-VN')} kết quả</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1} className="h-9 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">← Trước</button>
              <button type="button" onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))} disabled={page >= pagination.totalPages} className="h-9 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Sau →</button>
            </div>
          </div>
        )}
      </section>

      {/* Modal Xác nhận Đổi Trạng thái (Khóa / Mở khóa) */}
      <Modal isOpen={targetUser !== null} onClose={() => !busyUserId && setTargetUser(null)} title={targetUser?.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} size="sm" closeOnBackdrop={!busyUserId}>
        {targetUser && (
          <div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${targetUser.isActive ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="10" width="14" height="11" rx="2" /><path d={targetUser.isActive ? 'M8 10V7a4 4 0 0 1 8 0v3' : 'M8 10V7a4 4 0 0 1 7.5-2'} strokeLinecap="round" /></svg>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {targetUser.isActive ? 'Tài khoản sẽ không thể đăng nhập và toàn bộ refresh token hiện tại sẽ bị thu hồi.' : 'Người dùng sẽ có thể đăng nhập và sử dụng lại các chức năng của hệ thống.'}
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-sm font-extrabold text-slate-800">{targetUser.fullName}</p><p className="mt-0.5 text-xs text-slate-500">{targetUser.email}</p></div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setTargetUser(null)} disabled={busyUserId !== null}>Hủy</Button>
              <Button type="button" variant={targetUser.isActive ? 'danger' : 'primary'} onClick={() => void confirmStatusChange()} isLoading={busyUserId === targetUser.id}>{targetUser.isActive ? 'Xác nhận khóa' : 'Mở khóa'}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Xác nhận Đổi Vai trò (USER <-> ADMIN) */}
      <Modal isOpen={targetRoleUser !== null} onClose={() => !busyUserId && setTargetRoleUser(null)} title="Thay đổi vai trò người dùng" size="sm" closeOnBackdrop={!busyUserId}>
        {targetRoleUser && (
          <div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${targetRoleUser.role === 'ADMIN' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Bạn có chắc chắn muốn thay đổi quyền của tài khoản này? Sau khi thay đổi, toàn bộ phiên đăng nhập hiện tại của người dùng sẽ bị thu hồi và họ phải đăng nhập lại.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 space-y-2">
              <div>
                <p className="text-sm font-extrabold text-slate-800">{targetRoleUser.fullName}</p>
                <p className="mt-0.5 text-xs text-slate-500">{targetRoleUser.email}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500">Vai trò hiện tại:</span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold ${targetRoleUser.role === 'ADMIN' ? 'bg-violet-50 text-violet-700' : 'bg-slate-200 text-slate-700'}`}>
                  {targetRoleUser.role}
                </span>
                <span className="text-slate-400 font-bold">→</span>
                <span className="text-slate-500">Vai trò mới:</span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold ${targetRoleUser.role === 'ADMIN' ? 'bg-slate-200 text-slate-700' : 'bg-violet-50 text-violet-700'}`}>
                  {targetRoleUser.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setTargetRoleUser(null)} disabled={busyUserId !== null}>Hủy</Button>
              <Button
                type="button"
                variant={targetRoleUser.role === 'ADMIN' ? 'danger' : 'primary'}
                onClick={() => void confirmRoleChange()}
                isLoading={busyUserId === targetRoleUser.id}
              >
                {targetRoleUser.role === 'ADMIN' ? 'Xác nhận hạ thành USER' : 'Xác nhận nâng thành ADMIN'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
