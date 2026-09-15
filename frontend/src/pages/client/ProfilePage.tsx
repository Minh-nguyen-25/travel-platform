import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import ProfileAvatarSection from '@/components/profile/ProfileAvatarSection';
import ProfileInformationForm from '@/components/profile/ProfileInformationForm';
import { getLoginMethodLabel, initials } from '@/components/profile/profile.utils';
import EditorialPageHero from '@/components/common/EditorialPageHero';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

const SectionTitle = ({ title, description }: { title: string; description: string }) => (
  <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
    <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
  </div>
);

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const joinedDate = useMemo(() => {
    if (!user?.createdAt) return '';
    return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(
      new Date(user.createdAt),
    );
  }, [user?.createdAt]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EditorialPageHero
        eyebrow="Tài khoản cá nhân"
        title={<>Hồ sơ của <span className="text-accent-300">bạn.</span></>}
        description="Quản lý thông tin hiển thị, ảnh đại diện và bảo mật — để mỗi hành trình luôn mang dấu ấn của riêng bạn."
        image="/images/vietnam-hoi-an-journal.jpg"
        imageAlt="Du khách ghi lại câu chuyện hành trình trong một sân nhỏ tại Hội An"
        icon="users"
        motion="glide"
        imagePosition="object-[66%_50%]"
        compact
      >
        <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white/72 backdrop-blur">
          Thành viên từ {joinedDate}
        </p>
      </EditorialPageHero>

      <div className="container grid gap-7 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-10">
        <aside className="h-fit overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:sticky lg:top-24">
          <div className="flex flex-col items-center px-6 py-7 text-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={`Ảnh đại diện của ${user.fullName}`} className="h-24 w-24 rounded-3xl object-cover ring-4 ring-blue-50" />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-cyan-500 text-2xl font-black text-white ring-4 ring-blue-50">
                {initials(user.fullName)}
              </span>
            )}
            <h2 className="mt-4 max-w-full truncate text-lg font-extrabold text-gray-900">{user.fullName}</h2>
            <p className="mt-1 max-w-full truncate text-sm text-gray-500">{user.email}</p>
            <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-primary-700">
              {user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
            </span>
          </div>
          <dl className="space-y-3 border-t border-gray-100 px-6 py-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">Đăng nhập bằng</dt>
              <dd className="font-bold text-gray-700">{getLoginMethodLabel(user)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">Tham gia</dt>
              <dd className="font-bold capitalize text-gray-700">{joinedDate}</dd>
            </div>
          </dl>
          <div className="border-t border-gray-100 p-4">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </aside>

        <main className="space-y-7">
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <SectionTitle title="Ảnh đại diện" description="Ảnh vuông, định dạng JPG, PNG hoặc WebP và tối đa 5 MB." />
            <ProfileAvatarSection className="px-6 py-6 sm:px-7" />
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <SectionTitle title="Thông tin cá nhân" description="Tên này sẽ xuất hiện trên đánh giá và các chuyến đi của bạn." />
            <ProfileInformationForm className="px-6 py-6 sm:px-7" />
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <SectionTitle title="Đổi mật khẩu" description="Đổi mật khẩu sẽ đăng xuất các phiên cũ để bảo vệ tài khoản của bạn." />
            <ChangePasswordForm className="px-6 py-6 sm:px-7" />
          </section>
        </main>
      </div>
    </div>
  );
}
