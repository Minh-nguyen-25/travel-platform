import { useState, useMemo, useEffect, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ROUTES } from '@/constants';
import { authService } from '@/services/auth.service';

/**
 * 5 explicit states for ResetPasswordPage UX
 */
export type ResetPasswordPageStatus = 'checking' | 'valid' | 'invalid' | 'submitting' | 'success';

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

/** Password rule checklist item consistent with RegisterPage */
function RuleItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-2 text-[12px] transition-colors duration-150 motion-reduce:transition-none ${
        met ? 'text-teal-700' : 'text-stone-500'
      }`}
    >
      {met ? (
        <span className="inline-flex items-center justify-center">
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
          className="w-3.5 h-3.5 rounded-full border border-stone-300 flex-shrink-0 inline-block"
          aria-hidden="true"
        />
      )}
      <span className={met ? 'font-medium' : 'font-normal'}>{label}</span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  // Capture raw reset token from query string once in component memory.
  // Token is never placed in localStorage, sessionStorage, or client analytics.
  const [token] = useState<string>(() => (searchParams.get('token') ?? '').trim());

  // Explicit lifecycle status: starts as checking (or invalid if token is missing)
  const [status, setStatus] = useState<ResetPasswordPageStatus>(() => (token ? 'checking' : 'invalid'));

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // Validate token immediately on mount with backend.
  // Clean AbortController prevents duplicate calls or state leaks in React StrictMode.
  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    const abortController = new AbortController();
    let isCurrent = true;

    setStatus('checking');

    authService
      .validateResetToken(token, abortController.signal)
      .then((isValid) => {
        if (!isCurrent) return;
        if (isValid) {
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      })
      .catch((err) => {
        if (axios.isCancel(err) || abortController.signal.aborted) {
          return; // Ignore cancelled requests
        }
        if (!isCurrent) return;
        setStatus('invalid');
      });

    return () => {
      isCurrent = false;
      abortController.abort();
    };
  }, [token]);

  // Clean raw token from visible address bar once reset has succeeded
  useEffect(() => {
    if (status === 'success' && window.history?.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [status]);

  // 4 password checklist rules matching backend validator
  const passwordRules = useMemo(
    () => ({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasDigit: /[0-9]/.test(password),
    }),
    [password]
  );

  const isPasswordValid =
    passwordRules.minLength &&
    passwordRules.hasUpperCase &&
    passwordRules.hasLowerCase &&
    passwordRules.hasDigit;

  const confirmMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'submitting' || status === 'success') return;

    if (!token) {
      setStatus('invalid');
      return;
    }

    if (!isPasswordValid) {
      setError('Mật khẩu chưa đáp ứng đầy đủ các yêu cầu bảo mật');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setError('');
    setStatus('submitting');

    try {
      await authService.resetPassword({
        token,
        password,
        confirmPassword,
      });

      // Clear password fields from memory
      setPassword('');
      setConfirmPassword('');
      setStatus('success');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { message?: string } | undefined)?.message;
        // If token has expired or already been consumed in another request
        if (err.response?.status === 400 && msg?.includes('hết hạn')) {
          setStatus('invalid');
          return;
        }
        setError(msg || 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
      setStatus('valid');
    }
  };

  // ─── 1. CHECKING STATE: Spinner, no form flash ─────────────────────────────
  if (status === 'checking') {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_-8px_rgba(15,118,110,0.10),0_2px_8px_-2px_rgba(0,0,0,0.04)] p-7 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-[22px] font-bold text-stone-900 tracking-normal leading-snug">
            Đặt lại mật khẩu
          </h1>
          <p className="mt-2 text-[13px] text-stone-500 leading-relaxed max-w-sm mx-auto">
            Hành trình Việt cùng TravelGo
          </p>
        </div>

        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-10 h-10 border-3 border-teal-100 border-t-teal-700 rounded-full animate-spin" />
          <p className="text-[14px] text-stone-600 font-medium">
            Đang kiểm tra tính hợp lệ của liên kết...
          </p>
          <p className="text-[12px] text-stone-400 max-w-xs">
            Vui lòng chờ trong giây lát. Hệ thống đang bảo đảm an toàn cho tài khoản của bạn.
          </p>
        </div>
      </div>
    );
  }

  // ─── 2. INVALID STATE: Expired, used, or non-existent token ─────────────────
  if (status === 'invalid') {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_-8px_rgba(15,118,110,0.10),0_2px_8px_-2px_rgba(0,0,0,0.04)] p-7 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-[22px] font-bold text-stone-900 tracking-normal leading-snug">
            Đặt lại mật khẩu
          </h1>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-[13px] leading-relaxed flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-amber-100/90 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-amber-700"
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
            </div>
            <div>
              <p className="font-bold text-[14px] text-amber-950 mb-1">
                Liên kết không còn hiệu lực
              </p>
              <p className="text-amber-900 leading-normal">
                Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              </p>
              <p className="text-amber-800/90 text-[12px] mt-1.5">
                Mỗi liên kết chỉ có hiệu lực trong 15 phút và sử dụng được một lần duy nhất để bảo đảm an toàn.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="inline-flex items-center justify-center gap-2 w-full h-11 text-[14px] font-semibold text-white rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 motion-reduce:transition-none shadow-sm"
            >
              Yêu cầu liên kết mới
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center gap-2 w-full h-11 text-[14px] font-semibold text-stone-700 rounded-xl bg-stone-100 hover:bg-stone-200/80 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── 3. SUCCESS STATE: Password reset successful ───────────────────────────
  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_-8px_rgba(15,118,110,0.10),0_2px_8px_-2px_rgba(0,0,0,0.04)] p-7 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-[22px] font-bold text-stone-900 tracking-normal leading-snug">
            Đặt lại mật khẩu
          </h1>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center text-center p-5 bg-teal-50/70 border border-teal-200/80 rounded-xl text-teal-900">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mb-3">
              <svg
                className="w-6 h-6"
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
            </div>
            <h2 className="text-[15px] font-bold text-stone-900 mb-1">
              Đặt lại mật khẩu thành công!
            </h2>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              Mật khẩu đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
          </div>

          <div className="text-center pt-2">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center gap-2 w-full h-11 text-[14px] font-semibold text-white rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── 4. VALID / SUBMITTING STATE: Render form ──────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_-8px_rgba(15,118,110,0.10),0_2px_8px_-2px_rgba(0,0,0,0.04)] p-7 sm:p-8">
      {/* Header — Centered */}
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-bold text-stone-900 tracking-normal leading-snug">
          Đặt lại mật khẩu
        </h1>
        <p className="mt-2 text-[13px] text-stone-500 leading-relaxed max-w-sm mx-auto">
          Tạo mật khẩu mới an toàn cho tài khoản TravelGo của bạn.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3.5 rounded-xl text-[13px] bg-red-50 border border-red-200 text-red-700"
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
            <div className="space-y-1">
              <span className="leading-relaxed block">{error}</span>
              {error.includes('không hợp lệ') && (
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="inline-block text-[12px] font-semibold text-teal-700 hover:underline pt-1"
                >
                  Yêu cầu gửi lại liên kết mới &rarr;
                </Link>
              )}
            </div>
          </div>
        )}

        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-password" className="text-[13px] font-semibold text-stone-700">
            Mật khẩu mới <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status === 'submitting'}
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
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Password Checklist */}
        {password.length > 0 && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Yêu cầu bảo mật mật khẩu:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <RuleItem met={passwordRules.minLength} label="Ít nhất 8 ký tự" />
              <RuleItem met={passwordRules.hasUpperCase} label="Có chữ in hoa (A-Z)" />
              <RuleItem met={passwordRules.hasLowerCase} label="Có chữ thường (a-z)" />
              <RuleItem met={passwordRules.hasDigit} label="Có chữ số (0-9)" />
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-confirm-password" className="text-[13px] font-semibold text-stone-700">
            Xác nhận mật khẩu mới <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={status === 'submitting'}
              required
              aria-required="true"
              className={`w-full h-11 pl-3.5 pr-11 text-[14px] text-stone-900 bg-white border rounded-xl placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:ring-4 disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed motion-reduce:transition-none ${
                confirmMismatch
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-stone-300 focus:border-teal-500 focus:ring-teal-600/10 hover:border-stone-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg motion-reduce:transition-none"
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {confirmMismatch && (
            <p className="text-[12px] text-red-600 mt-0.5">
              Mật khẩu xác nhận chưa khớp với mật khẩu mới.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={status === 'submitting' || !isPasswordValid || password !== confirmPassword}
            className="auth-submit-button w-full h-12 inline-flex items-center justify-center gap-2 font-semibold text-[14px] text-white rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 active:from-teal-900 shadow-md shadow-teal-900/15 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none motion-reduce:transition-none"
          >
            {status === 'submitting' ? (
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Đang lưu mật khẩu mới...</span>
              </>
            ) : (
              <span>Lưu mật khẩu mới</span>
            )}
          </button>
        </div>

        {/* Link back to Login */}
        <div className="pt-2 text-center">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-600 hover:text-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}
