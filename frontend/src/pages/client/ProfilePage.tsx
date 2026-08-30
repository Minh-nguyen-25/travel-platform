import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '@/components/auth/PasswordInput';
import Button from '@/components/common/Button';
import EditorialPageHero from '@/components/common/EditorialPageHero';
import Input from '@/components/common/Input';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/utils/trip.utils';

type Feedback = { type: 'success' | 'error'; message: string } | null;

const Notice = ({ feedback }: { feedback: Feedback }) => {
  if (!feedback) return null;
  const success = feedback.type === 'success';
  return (
    <div
      role={success ? 'status' : 'alert'}
      className={`mt-4 flex gap-2 rounded-xl border px-3.5 py-3 text-sm ${
        success
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <span className="font-bold">{success ? '✓' : '!'}</span>
      {feedback.message}
    </div>
  );
};

const SectionTitle = ({ title, description }: { title: string; description: string }) => (
  <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
    <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
  </div>
);

const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export default function ProfilePage() {
  const {
    changePassword,
    deleteAvatar,
    logout,
    updateProfile,
    uploadAvatar,
    user,
  } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFeedback, setAvatarFeedback] = useState<Feedback>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => setFullName(user?.fullName ?? ''), [user?.fullName]);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const joinedDate = useMemo(() => {
    if (!user?.createdAt) return '';
    return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(
      new Date(user.createdAt),
    );
  }, [user?.createdAt]);

  if (!user) return null;

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedName = fullName.trim();
    setProfileFeedback(null);
    if (normalizedName.length < 2) {
      setProfileFeedback({ type: 'error', message: 'Họ tên phải có ít nhất 2 ký tự.' });
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({ fullName: normalizedName });
      setProfileFeedback({ type: 'success', message: 'Đã cập nhật thông tin cá nhân.' });
    } catch (error) {
      setProfileFeedback({
        type: 'error',
        message: getApiErrorMessage(error, 'Không thể cập nhật hồ sơ. Vui lòng thử lại.'),
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setAvatarFeedback(null);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarFeedback({ type: 'error', message: 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.' });
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarFeedback({ type: 'error', message: 'Dung lượng ảnh không được vượt quá 5 MB.' });
      event.target.value = '';
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarFeedback(null);
    setIsSavingAvatar(true);
    try {
      await uploadAvatar(avatarFile);
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setAvatarFeedback({ type: 'success', message: 'Ảnh đại diện đã được cập nhật.' });
    } catch (error) {
      setAvatarFeedback({
        type: 'error',
        message: getApiErrorMessage(error, 'Không thể tải ảnh đại diện lên.'),
      });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarFeedback(null);
    setIsDeletingAvatar(true);
    try {
      await deleteAvatar();
      setAvatarFeedback({ type: 'success', message: 'Đã xóa ảnh đại diện.' });
    } catch (error) {
      setAvatarFeedback({
        type: 'error',
        message: getApiErrorMessage(error, 'Không thể xóa ảnh đại diện.'),
      });
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordFeedback(null);
    setConfirmPasswordError('');

    const validPassword =
      newPassword.length >= 8 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword);
    if (!validPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'Mật khẩu mới cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường và chữ số.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordFeedback({ type: 'error', message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({
        type: 'success',
        message: 'Đổi mật khẩu thành công. Các phiên đăng nhập cũ đã được thu hồi.',
      });
    } catch (error) {
      setPasswordFeedback({
        type: 'error',
        message: getApiErrorMessage(error, 'Không thể đổi mật khẩu. Vui lòng thử lại.'),
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

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
              <dd className="font-bold text-gray-700">{user.authProvider === 'GOOGLE' ? 'Google' : 'Email'}</dd>
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
            <div className="px-6 py-6 sm:px-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-28 w-28 flex-none overflow-hidden rounded-3xl bg-blue-50 ring-1 ring-blue-100">
                  {avatarPreview || user.avatarUrl ? (
                    <img src={avatarPreview ?? user.avatarUrl ?? ''} alt="Xem trước ảnh đại diện" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500 to-cyan-500 text-2xl font-black text-white">
                      {initials(user.fullName)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarSelection}
                    className="sr-only"
                  />
                  <div className="flex flex-wrap gap-2.5">
                    <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      Chọn ảnh mới
                    </Button>
                    {avatarFile && (
                      <Button type="button" onClick={() => void handleAvatarUpload()} isLoading={isSavingAvatar}>
                        Tải ảnh lên
                      </Button>
                    )}
                    {user.avatarUrl && !avatarFile && (
                      <Button type="button" variant="ghost" onClick={() => void handleDeleteAvatar()} isLoading={isDeletingAvatar} className="text-red-600 hover:bg-red-50">
                        Xóa ảnh
                      </Button>
                    )}
                  </div>
                  {avatarFile && (
                    <p className="mt-3 truncate text-xs text-gray-500">
                      Đã chọn: <span className="font-semibold text-gray-700">{avatarFile.name}</span>
                    </p>
                  )}
                </div>
              </div>
              <Notice feedback={avatarFeedback} />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <SectionTitle title="Thông tin cá nhân" description="Tên này sẽ xuất hiện trên đánh giá và các chuyến đi của bạn." />
            <form onSubmit={(event) => void handleProfileSubmit(event)} className="space-y-5 px-6 py-6 sm:px-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  id="profile-name"
                  label="Họ và tên"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  className="h-11 rounded-xl"
                />
                <Input
                  id="profile-email"
                  label="Email"
                  type="email"
                  value={user.email}
                  disabled
                  hint="Email đăng nhập hiện chưa thể thay đổi."
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isSavingProfile}
                  disabled={fullName.trim() === user.fullName}
                  className="rounded-xl font-bold"
                >
                  Lưu thay đổi
                </Button>
              </div>
              <Notice feedback={profileFeedback} />
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <SectionTitle title="Đổi mật khẩu" description="Đổi mật khẩu sẽ đăng xuất các phiên cũ để bảo vệ tài khoản của bạn." />
            {user.authProvider === 'GOOGLE' ? (
              <div className="px-6 py-6 sm:px-7">
                <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                  <svg className="mt-0.5 h-5 w-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
                  </svg>
                  Tài khoản này đăng nhập bằng Google nên không sử dụng mật khẩu TravelPlatform.
                </div>
              </div>
            ) : (
              <form onSubmit={(event) => void handlePasswordSubmit(event)} className="space-y-5 px-6 py-6 sm:px-7">
                <PasswordInput
                  id="current-password"
                  label="Mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-11 rounded-xl"
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <PasswordInput
                    id="new-password"
                    label="Mật khẩu mới"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoComplete="new-password"
                    hint="Ít nhất 8 ký tự, có chữ hoa, chữ thường và chữ số."
                    required
                    className="h-11 rounded-xl"
                  />
                  <PasswordInput
                    id="confirm-new-password"
                    label="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    autoComplete="new-password"
                    error={confirmPasswordError}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isChangingPassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                    className="rounded-xl font-bold"
                  >
                    Cập nhật mật khẩu
                  </Button>
                </div>
                <Notice feedback={passwordFeedback} />
              </form>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
