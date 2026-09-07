import { useState, useMemo, type FormEvent } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, USER_ROLES } from '@/constants';
import Loading from '@/components/common/Loading';

/** Reusable eye icon (open) */
function EyeIcon() {
  return (
    <svg
      className="w-[18px] h-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

/** Reusable eye-off icon */
function EyeOffIcon() {
  return (
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
  );
}

/** Password rule item with stagger on mount and checkmark pop on satisfied */
function RuleItem({ met, label, delay }: { met: boolean; label: string; delay: number }) {
  return (
    <div
      className={`auth-rule-enter flex items-center gap-2 text-[12px] transition-colors duration-150 motion-reduce:transition-none ${
        met ? 'text-teal-700' : 'text-slate-500'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {met ? (
        <span className="auth-rule-satisfied inline-flex items-center justify-center">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0 text-teal-600"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      ) : (
        <span
          className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 inline-block"
          aria-hidden="true"
        />
      )}
      <span className={met ? 'font-medium' : 'font-normal'}>{label}</span>
    </div>
  );
}

/**
 * RegisterPage — Form đăng ký bên trong AuthLayout.
 *
 * Tiêu đề và phụ đề căn giữa, các trường input và checklist căn trái.
 * Giữ nguyên toàn bộ logic xác thực, đăng ký, chuyển hướng và bảo mật token in-memory.
 */
export default function RegisterPage() {
  const { user, isAuthenticated, isAuthLoading, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } | string })?.from
    ? typeof (location.state as { from: unknown }).from === 'string'
      ? (location.state as { from: string }).from
      : (location.state as { from: { pathname: string } }).from.pathname
    : ROUTES.HOME;

  const passwordRules = useMemo(
    () => ({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasDigit: /[0-9]/.test(password),
    }),
    [password]
  );

  const isPasswordValid =
    passwordRules.hasMinLength &&
    passwordRules.hasUpperCase &&
    passwordRules.hasLowerCase &&
    passwordRules.hasDigit;

  const confirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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

    if (!agreeTerms) {
      setTermsError('Bạn phải đồng ý với Điều khoản & Chính sách để tiếp tục');
      return;
    }
    setTermsError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!isPasswordValid) {
      setError('Mật khẩu chưa đáp ứng đầy đủ các yêu cầu bảo mật');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedFullName = fullName.trim();

    try {
      const newUser = await register({ fullName: trimmedFullName, email: normalizedEmail, password });
      navigate(newUser.role === USER_ROLES.ADMIN ? ROUTES.ADMIN : from, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = (err.response?.data as { message?: string } | undefined)?.message;
        if (status === 409 || message?.includes('đã được sử dụng')) {
          setError('Email đã được sử dụng. Vui lòng sử dụng email khác.');
        } else {
          setError(message ?? 'Đăng ký không thành công. Vui lòng thử lại sau.');
        }
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (hasError = false) =>
    `w-full h-11 px-3.5 text-[14px] text-stone-900 bg-white border rounded-xl placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:ring-4 disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed hover:border-stone-400 motion-reduce:transition-none ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
        : 'border-stone-300 focus:border-teal-500 focus:ring-teal-600/10'
    }`;

  return (
    <>
      {/* Card Form */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_-8px_rgba(15,118,110,0.10),0_2px_8px_-2px_rgba(0,0,0,0.04)] p-7 sm:p-8">
        {/* Card Header — Centered */}
        <div className="mb-6 text-center">
          <h1 className="text-[22px] font-bold text-stone-900 tracking-normal leading-snug">
            Bắt đầu hành trình của bạn
          </h1>
          <p className="text-[13px] text-slate-500 mt-1 leading-relaxed max-w-[300px] mx-auto">
            Tạo tài khoản để khám phá Việt Nam cùng TravelGo.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="auth-alert-enter mb-5 p-3.5 rounded-xl border border-red-200/70 bg-red-50 text-red-700 text-[13px] flex items-start gap-2.5 transition-all motion-reduce:transition-none"
          >
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
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form — Left-aligned content */}
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-fullname" className="text-[13px] font-semibold text-stone-700">
              Họ và tên <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="register-fullname"
              type="text"
              name="fullName"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className={inputCls()}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-email" className="text-[13px] font-semibold text-stone-700">
              Email <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ten@example.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
              aria-required="true"
              className={inputCls()}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-password" className="text-[13px] font-semibold text-stone-700">
              Mật khẩu <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                aria-required="true"
                aria-describedby="password-rules"
                className={`${inputCls()} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg motion-reduce:transition-none"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Live Password Rules — 2×2 Grid */}
            <div
              id="password-rules"
              aria-label="Yêu cầu mật khẩu"
              className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 rounded-xl bg-stone-50/80 border border-stone-200/70"
            >
              <RuleItem met={passwordRules.hasMinLength} label="Tối thiểu 8 ký tự" delay={0} />
              <RuleItem met={passwordRules.hasUpperCase} label="Ít nhất 1 chữ hoa" delay={40} />
              <RuleItem met={passwordRules.hasLowerCase} label="Ít nhất 1 chữ thường" delay={80} />
              <RuleItem met={passwordRules.hasDigit} label="Ít nhất 1 chữ số" delay={120} />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-confirm-password" className="text-[13px] font-semibold text-stone-700">
              Xác nhận mật khẩu <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                required
                aria-required="true"
                aria-invalid={confirmMismatch}
                className={`${inputCls(confirmMismatch)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg motion-reduce:transition-none"
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {confirmMismatch && (
              <p className="text-[12px] text-red-500 mt-0.5" role="alert" aria-live="polite">
                Mật khẩu xác nhận không khớp
              </p>
            )}
          </div>

          {/* Terms Checkbox — Non-clickable plain text */}
          <div className="pt-0.5">
            <label htmlFor="register-terms" className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                id="register-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (e.target.checked) setTermsError('');
                }}
                disabled={isSubmitting}
                className="w-4 h-4 mt-0.5 rounded border-stone-300 text-teal-700 accent-teal-700 focus:ring-teal-600 focus:ring-offset-0 focus:ring-2 cursor-pointer"
              />
              <span className="text-[12.5px] text-stone-600 leading-normal">
                Tôi đồng ý với{' '}
                <span className="font-semibold text-teal-700">Điều khoản dịch vụ</span>{' '}
                và{' '}
                <span className="font-semibold text-teal-700">Chính sách bảo mật</span>
              </span>
            </label>
            {termsError && (
              <p className="text-[12px] text-red-500 mt-1.5 pl-6 flex items-center gap-1" role="alert" aria-live="polite">
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{termsError}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !fullName || !email || !password || !confirmPassword || !isPasswordValid}
              className="auth-submit-button w-full h-12 inline-flex items-center justify-center gap-2 font-semibold text-[14px] text-white rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 active:from-teal-900 active:to-teal-900 shadow-md shadow-teal-900/15 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none motion-reduce:transition-none"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang tạo tài khoản…</span>
                </>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer switcher */}
      <p className="text-center text-[13px] text-slate-500 mt-5 mb-4">
        Đã có tài khoản?{' '}
        <Link
          to={ROUTES.LOGIN}
          state={{ from }}
          className="font-semibold text-teal-700 hover:text-teal-800 hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-0.5"
        >
          Đăng nhập
        </Link>
      </p>
    </>
  );
}
