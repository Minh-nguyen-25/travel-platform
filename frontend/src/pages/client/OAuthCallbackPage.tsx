import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { ROUTES, USER_ROLES, getOAuthErrorMessage } from '@/constants';
import Loading from '@/components/common/Loading';

/**
 * Mounted at /oauth/callback after a successful OAuth redirect from the backend.
 *
 * Flow:
 * 1. If URL contains ?error= -> navigate to /login?error=<code>.
 * 2. StrictMode guard via useRef prevents duplicate refresh or ticket consumption.
 * 3. Calls restoreSession() from AuthContext (single-flight deduplicated).
 * 4. Consumes the one-time Redis ticket via authenticated endpoint: POST /auth/oauth/consume-ticket.
 * 5. Retrieves the authenticated user profile.
 * 6. Navigates to ROUTES.ADMIN if user.role is ADMIN, or the validated returnPath (or ROUTES.HOME).
 */
export default function OAuthCallbackPage() {
  const { restoreSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // ── Step 1: Error redirect from backend ──────────────────────────────────
    const errorCode = searchParams.get('error');
    if (errorCode) {
      const validCodes = [
        'STATE_INVALID', 'STATE_EXPIRED', 'EMAIL_NOT_VERIFIED', 'EMAIL_MISSING',
        'FACEBOOK_EMAIL_REQUIRED', 'ACCOUNT_LOCKED', 'EMAIL_CONFLICT_LOCAL',
        'EMAIL_CONFLICT_PROVIDER', 'PROVIDER_ERROR', 'CONFIG_ERROR',
      ];
      const safeCode = validCodes.includes(errorCode) ? errorCode : 'PROVIDER_ERROR';
      setErrorBanner(getOAuthErrorMessage(safeCode));
      navigate(`${ROUTES.LOGIN}?error=${safeCode}`, { replace: true });
      return;
    }

    // ── Step 2: Restore session & consume ticket ─────────────────────────────
    const processCallback = async () => {
      try {
        await restoreSession();

        const ticket = searchParams.get('ticket');
        let returnPath = '/';
        if (ticket) {
          returnPath = await authService.consumeOAuthTicket(ticket);
        }

        // Fresh profile lookup ensures we never navigate on stale closure state
        const profile = await authService.getProfile();
        if (!profile) {
          navigate(ROUTES.LOGIN, { replace: true });
          return;
        }

        const destination =
          profile.role === USER_ROLES.ADMIN ? ROUTES.ADMIN : (returnPath || ROUTES.HOME);
        navigate(destination, { replace: true });
      } catch {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    void processCallback();
  }, [restoreSession, navigate, searchParams]);

  if (!errorBanner) {
    return <Loading fullPage message="Đang xác thực..." />;
  }

  return null;
}

