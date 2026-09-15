import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/utils/trip.utils';
import ProfileNotice from './ProfileNotice';
import { initials } from './profile.utils';
import type { Feedback } from './profile.utils';

interface ProfileAvatarSectionProps {
  className?: string;
  avatarSizeClass?: string;
}

export default function ProfileAvatarSection({
  className = '',
  avatarSizeClass = 'h-28 w-28 rounded-3xl',
}: ProfileAvatarSectionProps) {
  const { user, uploadAvatar, deleteAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFeedback, setAvatarFeedback] = useState<Feedback>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  if (!user) return null;

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
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  return (
    <div className={className}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className={`relative flex-none overflow-hidden bg-blue-50 ring-1 ring-blue-100 ${avatarSizeClass}`}>
          {avatarPreview || user.avatarUrl ? (
            <img
              src={avatarPreview ?? user.avatarUrl ?? ''}
              alt={`Ảnh đại diện của ${user.fullName}`}
              className="h-full w-full object-cover"
            />
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
            onClick={(event) => {
              (event.target as HTMLInputElement).value = '';
            }}
            onChange={handleAvatarSelection}
            className="sr-only"
            aria-label="Tải lên ảnh đại diện mới"
          />
          <div className="flex flex-wrap gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSavingAvatar}
              className="rounded-xl font-bold"
            >
              Chọn ảnh mới
            </Button>
            {avatarFile && (
              <Button
                type="button"
                onClick={() => void handleAvatarUpload()}
                isLoading={isSavingAvatar}
                disabled={isSavingAvatar}
                className="rounded-xl font-bold"
              >
                Tải ảnh lên
              </Button>
            )}
            {avatarFile && !isSavingAvatar && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAvatarFile(null);
                  setAvatarPreview(null);
                  setAvatarFeedback(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="rounded-xl font-bold text-slate-500 hover:bg-slate-100"
              >
                Hủy
              </Button>
            )}
            {user.avatarUrl && !avatarFile && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void handleDeleteAvatar()}
                isLoading={isDeletingAvatar}
                disabled={isDeletingAvatar}
                className="rounded-xl font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                Xóa ảnh
              </Button>
            )}
          </div>
          {avatarFile && (
            <p className="mt-3 truncate text-xs text-slate-500">
              Đã chọn: <span className="font-semibold text-slate-700">{avatarFile.name}</span>
            </p>
          )}
        </div>
      </div>
      <ProfileNotice feedback={avatarFeedback} />
    </div>
  );
}
