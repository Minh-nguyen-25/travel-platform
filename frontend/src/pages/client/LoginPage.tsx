import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, USER_ROLES } from '@/constants';
import Loading from '@/components/common/Loading';

/**
 * LoginPage — Form đăng nhập bên trong AuthLayout.
 *
 * Tiêu đề và phụ đề căn giữa, các trường input và thông báo căn trái.
 * Giữ nguyên toàn bộ logic xác thực, chuyển hướng và bảo mật token in-memory.
 */
export default function LoginPage() {
  const { user, isAuthenticated, isAuthLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isWarning, setIsWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } | string })?.from
    ? typeof (location.state as { from: unknown }).from === 'string'
      ? (location.state as { from: string }).from
      : (location.state as { from: { pathname: string } }).from.pathname
    : ROUTES.HOME;

  if (isAuthLoading) {
    return <Loading fullPage message="Đang kiểm tra đăng nhập..." />;
  }

  if (isAuthenticated && user) {
    const target = user.role === USER_ROLES.ADMIN ? ROUTES.ADMIN : from;
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsWarning(false);
    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const loggedInUser = await login({ email: normalizedEmail, password });
      navigate(loggedInUser.role === USER_ROLES.ADMIN ? ROUTES.ADMIN : from, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = (err.response?.data as { message?: string } | undefined)?.message;

        if (status === 403 || message === 'Tài khoản đã bị vô hiệu hóa') {
          setError('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
          setIsWarning(true);
        } else if (status === 401) {
          setError('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
        } else {
          setError(message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Card Form */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_-8px_rgba(15,118,110,0.10),0_2px_8px_-2px_rgba(0,0,0,0.04)] p-7 sm:p-8">
        {/* Card Header — Centered */}
        <div className="mb-6 text-center">
          <h1 className="text-[22px] font-bold text-stone-900 tracking-normal leading-snug">
            Chào mừng bạn trở lại
          </h1>
          <p className="text-[13px] text-slate-500 mt-1 leading-relaxed max-w-[300px] mx-auto">
            Đăng nhập để tiếp tục hành trình của bạn.
          </p>
        </div>

        {/* Alert Banner */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className={`auth-alert-enter mb-5 p-3.5 rounded-xl border text-[13px] flex items-start gap-2.5 motion-reduce:transition-none transition-all ${
              isWarning
                ? 'bg-amber-50 border-amber-200/80 text-amber-800'
                : 'bg-red-50 border-red-200/70 text-red-700'
            }`}
          >
            {isWarning ? (
              <svg
                className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form — Left-aligned content */}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-[13px] font-semibold text-stone-700">
              Email <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ten@example.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className="w-full h-11 px-3.5 text-[14px] text-stone-900 bg-white border border-stone-300 rounded-xl placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-600/10 disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed hover:border-stone-400 motion-reduce:transition-none"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-[13px] font-semibold text-stone-700">
              Mật khẩu <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                aria-required="true"
                className="w-full h-11 pl-3.5 pr-11 text-[14px] text-stone-900 bg-white border border-stone-300 rounded-xl placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-600/10 disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed hover:border-stone-400 motion-reduce:transition-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg motion-reduce:transition-none"
              >
                {showPassword ? (
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="auth-submit-button w-full h-12 inline-flex items-center justify-center gap-2 font-semibold text-[14px] text-white rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 active:from-teal-900 active:to-teal-900 shadow-md shadow-teal-900/15 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none motion-reduce:transition-none"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Đang đăng nhập…</span>
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer link to Register */}
      <p className="text-center text-[13px] text-slate-500 mt-5">
        Chưa có tài khoản?{' '}
        <Link
          to={ROUTES.REGISTER}
          state={{ from }}
          className="font-semibold text-teal-700 hover:text-teal-800 hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-0.5"
        >
          Đăng ký ngay
        </Link>
      </p>
    </>
  );
}
