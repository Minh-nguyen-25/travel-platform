import { useMemo } from 'react';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import ProfileAvatarSection from '@/components/profile/ProfileAvatarSection';
import ProfileInformationForm from '@/components/profile/ProfileInformationForm';
import { getLoginMethodLabel, initials } from '@/components/profile/profile.utils';
import { useAuth } from '@/hooks/useAuth';

export default function AdminProfilePage() {
  const { user } = useAuth();

  const joinedDate = useMemo(() => {
    if (!user?.createdAt) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(user.createdAt));
  }, [user?.createdAt]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* 1. Page Header Card */}
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900">Hồ sơ cá nhân</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Quản lý thông tin và bảo mật tài khoản quản trị
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Quản trị viên
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
              user.isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                user.isActive ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {user.isActive ? 'Tài khoản hoạt động' : 'Đang tạm khóa'}
          </span>
        </div>
      </section>

      {/* 2. Account Overview Summary Card */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`Ảnh đại diện của ${user.fullName}`}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl font-black text-blue-700 ring-2 ring-slate-100">
                {initials(user.fullName)}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-slate-900">{user.fullName}</h2>
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  ID: #{user.id}
                </span>
              </div>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs sm:flex sm:items-center sm:gap-6 md:border-t-0 md:pt-0">
            <div>
              <dt className="font-medium text-slate-400">Phương thức đăng nhập</dt>
              <dd className="mt-1 font-bold text-slate-800">{getLoginMethodLabel(user)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-400">Ngày tham gia</dt>
              <dd className="mt-1 font-bold text-slate-800">{joinedDate}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-400">Vai trò</dt>
              <dd className="mt-1 font-bold text-blue-600">Quản trị viên (ADMIN)</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-400">Trạng thái</dt>
              <dd className="mt-1 font-bold text-emerald-600">
                {user.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 3. Detailed Management Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card: Ảnh đại diện */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900">Ảnh đại diện</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Ảnh vuông, định dạng JPG, PNG hoặc WebP và tối đa 5 MB.
            </p>
          </div>
          <ProfileAvatarSection avatarSizeClass="h-24 w-24 rounded-2xl" />
        </section>

        {/* Card: Thông tin cá nhân */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900">Thông tin cá nhân</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Họ và tên hiển thị trong hệ thống quản trị và các bản ghi hoạt động.
            </p>
          </div>
          <ProfileInformationForm />
        </section>
      </div>

      {/* 4. Security & Password Card */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h2 className="text-base font-black text-slate-900">Bảo mật & Mật khẩu</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Đổi mật khẩu sẽ tự động đăng xuất các phiên làm việc khác để bảo vệ an toàn tài khoản quản trị.
          </p>
        </div>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
