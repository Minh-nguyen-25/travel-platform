import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthPageShell from '@/components/auth/AuthPageShell';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import PasswordInput from '@/components/auth/PasswordInput';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';
import { ROUTES, STORAGE_KEYS } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/utils/trip.utils';

interface ReturnLocation {
  pathname?: string;
  search?: string;
  hash?: string;
}

const safeReturnPath = (value: string | null | undefined): string =>
  value?.startsWith('/') && !value.startsWith('//') ? value : ROUTES.HOME;

export default function LoginPage() {
  const { completeGoogleLogin, isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const oauthHandled = useRef(false);

  const from = useMemo(() => {
    const previous = (location.state as { from?: ReturnLocation } | null)?.from;
    return safeReturnPath(
      previous?.pathname
        ? `${previous.pathname}${previous.search ?? ''}${previous.hash ?? ''}`
        : ROUTES.HOME,
    );
  }, [location.state]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    new URLSearchParams(location.search).get('oauth') === 'failed'
      ? 'Đăng nhập Google không thành công hoặc phiên xác thực đã hết hạn.'
      : '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(() =>
    new URLSearchParams(window.location.hash.slice(1)).has('accessToken'),
  );

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('accessToken');
    if (!token || oauthHandled.current) return;
    oauthHandled.current = true;
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);

    const finishGoogleLogin = async () => {
      setError('');
      try {
        await completeGoogleLogin(token);
        const savedPath = safeReturnPath(sessionStorage.getItem(STORAGE_KEYS.OAUTH_RETURN_TO));
        sessionStorage.removeItem(STORAGE_KEYS.OAUTH_RETURN_TO);
        navigate(savedPath, { replace: true });
      } catch (oauthError) {
        setError(getApiErrorMessage(oauthError, 'Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.'));
        setIsOAuthLoading(false);
      }
    };

    void finishGoogleLogin();
  }, [completeGoogleLogin, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, 'Email hoặc mật khẩu không chính xác.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    sessionStorage.setItem(STORAGE_KEYS.OAUTH_RETURN_TO, from);
    window.location.assign(authService.googleLoginUrl);
  };

  if (isOAuthLoading) {
    return <Loading fullPage size="lg" message="Đang hoàn tất đăng nhập Google..." />;
  }

  if (!isAuthLoading && isAuthenticated) return <Navigate to={from} replace />;

  return (
    <AuthPageShell
      eyebrow="Chào mừng trở lại"
      title="Đăng nhập"
      description="Tiếp tục hành trình và mở lại những kế hoạch bạn đang ấp ủ."
      footer={(
        <>
          Chưa có tài khoản?{' '}
          <Link to={ROUTES.REGISTER} className="font-bold text-primary-600 hover:text-primary-700">
            Đăng ký miễn phí
          </Link>
        </>
      )}
    >
      {error && (
        <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <svg className="mt-0.5 h-5 w-5 flex-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-9-3a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0V7Zm1 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <GoogleAuthButton onClick={handleGoogleLogin} disabled={isSubmitting || isAuthLoading} />

      <div className="my-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        hoặc dùng email
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
        <Input
          id="login-email"
          label="Email"
          type="email"
          placeholder="ban@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="h-12 rounded-xl"
          leftAddon={(
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z" strokeLinejoin="round" />
              <path d="m4 6 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        />
        <PasswordInput
          id="login-password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="h-12 rounded-xl"
        />
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-xl font-bold shadow-lg shadow-primary-200"
          isLoading={isSubmitting}
          disabled={isAuthLoading || !email.trim() || !password}
        >
          Đăng nhập
        </Button>
      </form>
    </AuthPageShell>
  );
}
