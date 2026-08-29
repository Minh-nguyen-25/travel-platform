import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, USER_ROLES } from '@/constants';
import Loading from '@/components/common/Loading';
import hoiAnHeroImg from '@/assets/images/hoi-an-auth.webp';

/**
 * LoginPage — Trang đăng nhập Desktop theo thiết kế TravelGo.
 *
 * Giao diện split-screen 50/50:
 * - Bên trái: Hình ảnh Hội An cổ kính, logo TravelGo trắng, quote của Lão Tử.
 * - Bên phải: Nút "Trang chủ", form đăng nhập thẻ trắng trung tâm, bảng màu Teal (#0f766e).
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

  // Lấy đường dẫn chuyển hướng sau khi đăng nhập thành công
  const from = (location.state as { from?: { pathname: string } | string })?.from
    ? typeof (location.state as { from: unknown }).from === 'string'
      ? (location.state as { from: string }).from
      : (location.state as { from: { pathname: string } }).from.pathname
    : ROUTES.HOME;

  // Nếu đang khôi phục session, hiển thị loading trung tính (tránh flash form)
  if (isAuthLoading) {
    return <Loading fullPage message="Đang kiểm tra đăng nhập..." />;
  }

  // Nếu đã đăng nhập, tự động chuyển hướng người dùng tránh ở lại trang auth
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

    // Chuẩn hóa email khi submit, không chuẩn hóa lúc đang gõ
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const loggedInUser = await login({ email: normalizedEmail, password });
      if (loggedInUser.role === USER_ROLES.ADMIN) {
        navigate(ROUTES.ADMIN, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = (err.response?.data as { message?: string } | undefined)?.message;

        if (status === 403 || message === 'Tài khoản đã bị vô hiệu hóa') {
          setError('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
          setIsWarning(true);
        } else if (status === 401) {
          setError('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
          setIsWarning(false);
        } else if (message) {
          setError(message);
          setIsWarning(false);
        } else {
          setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
          setIsWarning(false);
        }
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        setIsWarning(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 overflow-x-hidden">
      {/* ======================================================
          BÊN TRÁI: Hero Image Panel (Ẩn dưới màn hình lg: 1024px)
          ====================================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 select-none overflow-hidden">
        {/* Background Image */}
        <img
          src={hoiAnHeroImg}
          alt="Hội An lung linh đèn lồng về đêm"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

        {/* Top-Left: Logo TravelGo trắng */}
        <div className="absolute top-10 left-10 z-10 flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
            <svg
              className="w-5 h-5 text-white transform -rotate-45 translate-x-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight">TravelGo</span>
            <span className="block text-[10px] tracking-widest text-teal-200 uppercase font-medium">Hành trình Việt</span>
          </div>
        </div>

        {/* Bottom-Left: Quotation */}
        <div className="absolute bottom-12 left-10 right-10 z-10 text-white max-w-lg">
          <blockquote className="text-xl lg:text-2xl font-bold leading-snug">
            &ldquo;Hành trình mười vạn dặm bắt đầu từ một bước chân đơn giản đầu tiên.&rdquo;
          </blockquote>
          <p className="mt-3 text-sm text-gray-300 font-medium tracking-wide">
            — Lão Tử
          </p>
        </div>
      </div>

      {/* ======================================================
          BÊN PHẢI: Form đăng nhập
          ====================================================== */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-8 lg:p-12 overflow-y-auto">
        {/* Top Header: Link về Trang chủ */}
        <div className="flex justify-end w-full">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-teal-700 hover:bg-teal-50/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Trang chủ
          </Link>
        </div>

        {/* Main Center Form */}
        <div className="my-auto py-8 flex flex-col items-center justify-center w-full">
          <div className="w-full max-w-[460px] bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Chào mừng bạn trở lại
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Đăng nhập để tiếp tục hành trình của bạn.
              </p>
            </div>

            {/* Alert Banner */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className={`mb-5 p-3.5 rounded-xl border text-sm flex items-start gap-2.5 transition-all ${
                  isWarning
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {isWarning ? (
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="viet.nguyen@example.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full h-11 px-3.5 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
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
                    className="w-full h-11 pl-3.5 pr-11 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    tabIndex={0}
                    className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
                  >
                    {showPassword ? (
                      /* EyeOff icon */
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      /* Eye icon */
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="w-full h-11 mt-2 inline-flex items-center justify-center font-medium rounded-lg text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>
          </div>

          {/* Footer Navigation */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link
              to={ROUTES.REGISTER}
              state={{ from }}
              className="font-semibold text-teal-700 hover:text-teal-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Bottom copyright/spacer */}
        <div className="text-center text-xs text-gray-400 py-2">
          &copy; {new Date().getFullYear()} TravelGo. Nền tảng du lịch thông minh.
        </div>
      </div>
    </div>
  );
}
