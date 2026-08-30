import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthPageShell from '@/components/auth/AuthPageShell';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import PasswordInput from '@/components/auth/PasswordInput';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { ROUTES, STORAGE_KEYS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/utils/trip.utils';

const passwordChecks = (password: string) => [
  { label: 'Ít nhất 8 ký tự', valid: password.length >= 8 },
  { label: 'Có chữ hoa và chữ thường', valid: /[A-Z]/.test(password) && /[a-z]/.test(password) },
  { label: 'Có ít nhất một chữ số', valid: /\d/.test(password) },
];

export default function RegisterPage() {
  const { isAuthenticated, isLoading: isAuthLoading, register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checks = useMemo(() => passwordChecks(password), [password]);
  const passwordIsValid = checks.every((check) => check.valid);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setConfirmError('');

    if (!passwordIsValid) {
      setError('Mật khẩu chưa đáp ứng đầy đủ các yêu cầu bảo mật.');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password });
      navigate(ROUTES.PROFILE, { replace: true });
    } catch (registerError) {
      setError(getApiErrorMessage(registerError, 'Không thể tạo tài khoản. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    sessionStorage.setItem(STORAGE_KEYS.OAUTH_RETURN_TO, ROUTES.PROFILE);
    window.location.assign(authService.googleLoginUrl);
  };

  if (!isAuthLoading && isAuthenticated) return <Navigate to={ROUTES.PROFILE} replace />;

  return (
    <AuthPageShell
      eyebrow="Bắt đầu miễn phí"
      title="Tạo tài khoản"
      description="Một tài khoản, mọi điểm đến yêu thích và kế hoạch du lịch của riêng bạn."
      motion="signup"
      footer={(
        <>
          Đã có tài khoản?{' '}
          <Link to={ROUTES.LOGIN} className="font-bold text-primary-600 hover:text-primary-700">
            Đăng nhập
          </Link>
        </>
      )}
    >
      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <GoogleAuthButton
        onClick={handleGoogleLogin}
        disabled={isSubmitting || isAuthLoading}
        label="Đăng ký với Google"
      />

      <div className="my-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        hoặc dùng email
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <Input
          id="register-name"
          label="Họ và tên"
          placeholder="Nguyễn Minh Anh"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          minLength={2}
          maxLength={100}
          required
          className="h-12 rounded-xl"
        />
        <Input
          id="register-email"
          label="Email"
          type="email"
          placeholder="ban@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="h-12 rounded-xl"
        />
        <PasswordInput
          id="register-password"
          label="Mật khẩu"
          placeholder="Tạo mật khẩu an toàn"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
          className="h-12 rounded-xl"
        />

        {password && (
          <ul className="grid gap-1.5 rounded-xl bg-gray-50 p-3 sm:grid-cols-2">
            {checks.map((check) => (
              <li key={check.label} className={`flex items-center gap-1.5 text-xs ${check.valid ? 'text-emerald-600' : 'text-gray-500'}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${check.valid ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                  {check.valid ? '✓' : '•'}
                </span>
                {check.label}
              </li>
            ))}
          </ul>
        )}

        <PasswordInput
          id="register-confirm-password"
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            if (confirmError) setConfirmError('');
          }}
          autoComplete="new-password"
          error={confirmError}
          required
          className="h-12 rounded-xl"
        />

        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full rounded-xl font-bold shadow-lg shadow-primary-200"
          isLoading={isSubmitting}
          disabled={
            isAuthLoading ||
            !fullName.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
          }
        >
          Tạo tài khoản
        </Button>
        <p className="text-center text-xs leading-5 text-gray-400">
          Khi đăng ký, bạn đồng ý sử dụng TravelPlatform theo các điều khoản của hệ thống.
        </p>
      </form>
    </AuthPageShell>
  );
}
