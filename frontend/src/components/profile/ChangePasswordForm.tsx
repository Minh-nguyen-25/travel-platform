import { useState } from 'react';
import type { FormEvent } from 'react';
import PasswordInput from '@/components/auth/PasswordInput';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/utils/trip.utils';
import ProfileNotice from './ProfileNotice';
import { getLoginMethodLabel } from './profile.utils';
import type { Feedback } from './profile.utils';

interface ChangePasswordFormProps {
  className?: string;
  submitButtonClass?: string;
}

export default function ChangePasswordForm({
  className = '',
  submitButtonClass = 'rounded-xl font-bold',
}: ChangePasswordFormProps) {
  const { user, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!user) return null;

  const isSocialOnly =
    user.hasPassword === false ||
    user.authProvider === 'GOOGLE' ||
    user.authProvider === 'FACEBOOK' ||
    (user.provider ? user.provider.toUpperCase() !== 'LOCAL' : false);

  if (isSocialOnly) {
    return (
      <div className={className}>
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-sm leading-6 text-blue-800">
          <svg className="mt-0.5 h-5 w-5 flex-none text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
          </svg>
          <div>
            <p className="font-bold text-blue-900">Tài khoản liên kết mạng xã hội</p>
            <p className="mt-0.5 text-blue-700">
              Tài khoản này đăng nhập bằng {getLoginMethodLabel(user)} nên không sử dụng mật khẩu TravelGo. Bạn có thể tiếp tục đăng nhập trực tiếp qua cổng xác thực tương ứng.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <form onSubmit={(event) => void handlePasswordSubmit(event)} className={`space-y-5 ${className}`}>
      <PasswordInput
        id="current-password"
        label="Mật khẩu hiện tại"
        value={currentPassword}
        onChange={(event) => {
          setCurrentPassword(event.target.value);
          if (passwordFeedback) setPasswordFeedback(null);
        }}
        autoComplete="current-password"
        required
        className="h-11 rounded-xl"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordInput
          id="new-password"
          label="Mật khẩu mới"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            if (passwordFeedback) setPasswordFeedback(null);
          }}
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
            if (passwordFeedback) setPasswordFeedback(null);
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
          disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
          className={submitButtonClass}
        >
          Cập nhật mật khẩu
        </Button>
      </div>

      <ProfileNotice feedback={passwordFeedback} />
    </form>
  );
}
