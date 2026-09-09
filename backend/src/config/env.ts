// ─── IMPORTANT: dotenv/config MUST be the first import ────────────────────────
// This ensures process.env is populated before any module reads it.
import 'dotenv/config';

// ─── TTL parser ───────────────────────────────────────────────────────────────
// Supports values like '15m', '30d', '3600s', or plain numeric seconds.
function parseTtlToSeconds(value: string, varName: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n)) {
    throw new Error(`${varName}: "${value}" is not a valid duration`);
  }
  if (value.endsWith('d')) return n * 86400;
  if (value.endsWith('h')) return n * 3600;
  if (value.endsWith('m')) return n * 60;
  if (value.endsWith('s')) return n;
  // Plain integer — treat as seconds
  return n;
}

// ─── Validation ───────────────────────────────────────────────────────────────
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Environment variable "${name}" is required but missing or empty`);
  }
  return value.trim();
}

function validateEnv() {
  const errors: string[] = [];
  const raw: Record<string, string> = {};

  // Required
  const required = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'REDIS_URL',
  ] as const;

  for (const key of required) {
    try {
      raw[key] = requireEnv(key);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  // Secrets must differ
  if (raw['JWT_ACCESS_SECRET'] && raw['JWT_REFRESH_SECRET']) {
    if (raw['JWT_ACCESS_SECRET'] === raw['JWT_REFRESH_SECRET']) {
      errors.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values');
    }
  }

  if (errors.length > 0) {
    console.error('❌ [ENV] Application startup failed — invalid configuration:');
    errors.forEach((e) => console.error(`   • ${e}`));
    process.exit(1);
  }

  // Optional with defaults
  const JWT_ACCESS_EXPIRES_IN  = process.env['JWT_ACCESS_EXPIRES_IN']  || '15m';
  const JWT_REFRESH_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] || '30d';
  const NODE_ENV               = process.env['NODE_ENV']               || 'development';
  const PORT                   = process.env['PORT']                   || '3000';
  const FRONTEND_URL           = process.env['FRONTEND_URL']           || 'http://localhost:5173';

  // ─── Optional OAuth configuration ────────────────────────────────────────────
  // These are entirely optional — the server and email/password auth start normally
  // whether or not OAuth credentials are present. Only the OAuth endpoints for a
  // given provider will reject with CONFIG_ERROR when that provider is not configured.
  // configuredValue rejects undefined, empty strings, and placeholder 'your_*' values.
  const configuredValue = (v?: string): v is string =>
    Boolean(v?.trim()) && !v!.trim().startsWith('your_');

  const GOOGLE_CLIENT_ID        = process.env['GOOGLE_CLIENT_ID']     ?? '';
  const GOOGLE_CLIENT_SECRET    = process.env['GOOGLE_CLIENT_SECRET'] ?? '';
  const GOOGLE_CALLBACK_URL     =
    process.env['GOOGLE_CALLBACK_URL'] ??
    `http://localhost:${process.env['PORT'] ?? '3000'}/api/v1/auth/google/callback`;
  const GOOGLE_OAUTH_CONFIGURED =
    configuredValue(process.env['GOOGLE_CLIENT_ID']) &&
    configuredValue(process.env['GOOGLE_CLIENT_SECRET']);

  const FACEBOOK_APP_ID          = process.env['FACEBOOK_APP_ID']     ?? '';
  const FACEBOOK_APP_SECRET      = process.env['FACEBOOK_APP_SECRET'] ?? '';
  const FACEBOOK_CALLBACK_URL    =
    process.env['FACEBOOK_CALLBACK_URL'] ??
    `http://localhost:${process.env['PORT'] ?? '3000'}/api/v1/auth/facebook/callback`;
  const FACEBOOK_OAUTH_CONFIGURED =
    configuredValue(process.env['FACEBOOK_APP_ID']) &&
    configuredValue(process.env['FACEBOOK_APP_SECRET']);

  // After a successful OAuth callback, backend redirects to this frontend page.
  // The frontend page calls restoreSession() to load the access token into memory.
  const OAUTH_SUCCESS_REDIRECT =
    process.env['OAUTH_SUCCESS_REDIRECT'] ??
    `${FRONTEND_URL}/oauth/callback`;

  // When OAuth fails, backend redirects here with ?error=<FIXED_CODE>
  const OAUTH_FAILURE_REDIRECT =
    process.env['OAUTH_FAILURE_REDIRECT'] ??
    `${FRONTEND_URL}/login`;

  // ─── Resend / Email configuration ───────────────────────────────────────────
  const RESEND_API_KEY = process.env['RESEND_API_KEY'] ?? '';
  const MAIL_FROM      = process.env['MAIL_FROM'] || 'TravelGo <onboarding@resend.dev>';
  const rawResetMinutes = parseInt(process.env['PASSWORD_RESET_EXPIRES_MINUTES'] || '15', 10);
  const PASSWORD_RESET_EXPIRES_MINUTES =
    Number.isFinite(rawResetMinutes) && rawResetMinutes > 0 ? rawResetMinutes : 15;
  const PASSWORD_RESET_EXPIRES_SECONDS = PASSWORD_RESET_EXPIRES_MINUTES * 60;
  const RESEND_CONFIGURED = configuredValue(process.env['RESEND_API_KEY']);

  // Derived — computed once, consistent across all consumers
  let REFRESH_TTL_SECONDS: number;
  try {
    REFRESH_TTL_SECONDS = parseTtlToSeconds(JWT_REFRESH_EXPIRES_IN, 'JWT_REFRESH_EXPIRES_IN');
  } catch (e) {
    console.error(`❌ [ENV] ${(e as Error).message}`);
    process.exit(1);
  }

  const COOKIE_MAX_AGE_MS = REFRESH_TTL_SECONDS * 1000;

  return {
    JWT_ACCESS_SECRET:    raw['JWT_ACCESS_SECRET']!,
    JWT_REFRESH_SECRET:   raw['JWT_REFRESH_SECRET']!,
    REDIS_URL:            raw['REDIS_URL']!,
    JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
    REFRESH_TTL_SECONDS,
    COOKIE_MAX_AGE_MS,
    NODE_ENV,
    PORT,
    FRONTEND_URL,
    IS_PRODUCTION: NODE_ENV === 'production',
    // Google OAuth
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    GOOGLE_OAUTH_CONFIGURED,
    // Facebook OAuth
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    FACEBOOK_CALLBACK_URL,
    FACEBOOK_OAUTH_CONFIGURED,
    // OAuth redirects
    OAUTH_SUCCESS_REDIRECT,
    OAUTH_FAILURE_REDIRECT,
    // Resend / Email
    RESEND_API_KEY,
    MAIL_FROM,
    PASSWORD_RESET_EXPIRES_MINUTES,
    PASSWORD_RESET_EXPIRES_SECONDS,
    RESEND_CONFIGURED,
  };
}

// Singleton — validated once at module load time
const env = validateEnv();

export default env;
export type Env = typeof env;
