import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ROUTES } from '@/constants';
import { authService } from '@/services/auth.service';

/**
 * ForgotPasswordPage — Trang yêu cầu đặt lại mật khẩu trong AuthLayout.
 * Đảm bảo chống dò quét tài khoản: luôn hiển thị thông điệp thành công chung.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Vui lòng nhập địa chỉ email của bạn');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await authService.forgotPassword(normalizedEmail);
      setIsSubmitted(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = (err.response?.data as { message?: string } | undefined)?.message;
        if (status === 429) {
          setError(msg || 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 15 phút.');
        } else {
          // Luôn hiển thị trạng thái gửi thành công để chống account enumeration,
          // trừ khi bị rate limit nghiêm trọng
          setIsSubmitted(true);
        }
      } else {
        setIsSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_-8px_rgba(15,118,110,0.10),0_2px_8px_-2px_rgba(0,0,0,0.04)] p-7 sm:p-8">
      {/* Header — Centered */}
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-bold text-stone-900 tracking-normal leading-snug">
          Quên mật khẩu
        </h1>
        <p className="mt-2 text-[13px] text-stone-500 leading-relaxed max-w-sm mx-auto">
          Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu an toàn.
        </p>
      </div>

      {isSubmitted ? (
        /* Generic Success State */
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center p-5 bg-teal-50/70 border border-teal-200/80 rounded-xl text-teal-900">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-[15px] font-bold text-stone-900 mb-1">
              Đã gửi hướng dẫn
            </h2>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              Nếu email tồn tại và có thể đặt lại mật khẩu, chúng tôi đã gửi hướng dẫn đến email của bạn. Vui lòng kiểm tra hộp thư đến (và mục thư rác).
            </p>
          </div>

          <div className="text-center pt-2">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center gap-2 w-full h-11 text-[14px] font-semibold text-white rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      ) : (
        /* Form State */
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
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="forgot-email" className="text-[13px] font-semibold text-stone-700">
              Email tài khoản <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="forgot-email"
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="auth-submit-button w-full h-12 inline-flex items-center justify-center gap-2 font-semibold text-[14px] text-white rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 active:from-teal-900 shadow-md shadow-teal-900/15 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none motion-reduce:transition-none"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Đang gửi yêu cầu...</span>
                </>
              ) : (
                <span>Gửi liên kết đặt lại mật khẩu</span>
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
      )}
    </div>
  );
}
