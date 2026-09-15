import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/utils/trip.utils';
import ProfileNotice from './ProfileNotice';
import type { Feedback } from './profile.utils';

interface ProfileInformationFormProps {
  className?: string;
  submitButtonClass?: string;
}

export default function ProfileInformationForm({
  className = '',
  submitButtonClass = 'rounded-xl font-bold',
}: ProfileInformationFormProps) {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? '');
  }, [user?.fullName]);

  if (!user) return null;

  const isUnchanged = fullName.trim() === user.fullName;

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

  return (
    <form onSubmit={(event) => void handleProfileSubmit(event)} className={`space-y-5 ${className}`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="profile-name"
          label="Họ và tên"
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            if (profileFeedback) setProfileFeedback(null);
          }}
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
          disabled={isUnchanged || isSavingProfile}
          className={submitButtonClass}
        >
          Lưu thay đổi
        </Button>
      </div>

      <ProfileNotice feedback={profileFeedback} />
    </form>
  );
}
