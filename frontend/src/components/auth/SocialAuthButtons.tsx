import { useState } from 'react';
import googleIcon from '@/assets/icons/google.svg';
import facebookIcon from '@/assets/icons/facebook.svg';
import { API_BASE_URL } from '@/api/axiosClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialAuthButtonsProps {
  /**
   * Whether Terms & Conditions have been accepted.
   * On RegisterPage: pass the `agreeTerms` state.
   * On LoginPage: always pass `true` (no terms gate for login).
   */
  termsAccepted: boolean;
  /**
   * Called when a social button is clicked but terms are not accepted.
   * RegisterPage uses this to trigger the `termsError` message display.
   */
  onTermsRequired?: () => void;
  /**
   * Validated relative path to return to after OAuth.
   * Backend validates this server-side; frontend only reads it from a cookie.
   */
  from?: string;
  /** Disables buttons during form submission or other loading states. */
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Social authentication buttons shared between LoginPage and RegisterPage.
 *
 * SECURITY:
 * - Passes `?from=` to the backend init endpoint. Backend validates it and
 *   stores it server-side in Redis. It is NEVER echoed back in the redirect URL.
 * - Token is never placed in a URL or web storage — only in HttpOnly cookies.
 * - Terms gate: on RegisterPage, if termsAccepted=false, click is intercepted
 *   and onTermsRequired() is called instead of redirecting.
 */
export default function SocialAuthButtons({
  termsAccepted,
  onTermsRequired,
  from,
  disabled = false,
}: SocialAuthButtonsProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const buildInitUrl = (provider: 'google' | 'facebook'): string => {
    // Strip /api/v1 suffix to get the raw backend origin, then rebuild the path
    const origin = API_BASE_URL.replace(/\/api\/v1$/, '');
    const url = new URL(`${origin}/api/v1/auth/${provider}`);
    if (from && from.startsWith('/') && !from.startsWith('//')) {
      url.searchParams.set('from', from);
    }
    return url.toString();
  };

  const handleGoogle = () => {
    if (disabled || googleLoading || facebookLoading) return;
    if (!termsAccepted) {
      onTermsRequired?.();
      return;
    }
    setGoogleLoading(true);
    window.location.href = buildInitUrl('google');
  };

  const handleFacebook = () => {
    if (disabled || googleLoading || facebookLoading) return;
    if (!termsAccepted) {
      onTermsRequired?.();
      return;
    }
    setFacebookLoading(true);
    window.location.href = buildInitUrl('facebook');
  };

  const isLoading = googleLoading || facebookLoading;

  return (
    <div className="flex flex-col gap-3">
      {/* Google */}
      <button
        type="button"
        id="social-btn-google"
        onClick={handleGoogle}
        disabled={disabled || isLoading}
        aria-label="Tiếp tục với Google"
        aria-busy={googleLoading}
        className="
          relative w-full h-11 inline-flex items-center justify-center gap-3
          text-[13.5px] font-medium text-stone-700 bg-white border border-stone-300
          rounded-xl shadow-sm transition-all duration-150
          hover:border-stone-400 hover:bg-stone-50 hover:shadow
          active:bg-stone-100 active:shadow-none
          focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2
          disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none
          motion-reduce:transition-none
        "
      >
        {googleLoading ? (
          <svg className="animate-spin w-4 h-4 text-stone-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <img src={googleIcon} alt="" aria-hidden="true" className="w-5 h-5 flex-shrink-0" />
        )}
        <span>Tiếp tục với Google</span>
      </button>

      {/* Facebook */}
      <button
        type="button"
        id="social-btn-facebook"
        onClick={handleFacebook}
        disabled={disabled || isLoading}
        aria-label="Tiếp tục với Facebook"
        aria-busy={facebookLoading}
        className="
          relative w-full h-11 inline-flex items-center justify-center gap-3
          text-[13.5px] font-medium text-white bg-[#1877F2]
          rounded-xl shadow-sm transition-all duration-150
          hover:bg-[#166FE5] hover:shadow
          active:bg-[#1464CF] active:shadow-none
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
          disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none
          motion-reduce:transition-none
        "
      >
        {facebookLoading ? (
          <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <img src={facebookIcon} alt="" aria-hidden="true" className="w-5 h-5 flex-shrink-0" />
        )}
        <span>Tiếp tục với Facebook</span>
      </button>
    </div>
  );
}
