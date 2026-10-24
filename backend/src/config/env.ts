// ─── IMPORTANT: dotenv/config MUST be the first import ────────────────────────
// This ensures process.env is populated before any module reads it.
import 'dotenv/config';

// ─── TTL parser ───────────────────────────────────────────────────────────────
// Supports values like '15m', '30d', '3600s', or plain numeric seconds.
function parseTtlToSeconds(value: string, varName: string): number {
  const match = /^([1-9]\d*)([smhd]?)$/.exec(value);
  if (!match) {
    throw new Error(`${varName}: "${value}" is not a valid duration`);
  }
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[match[2]] ?? 1;
  const seconds = Number(match[1]) * multiplier;
  if (!Number.isSafeInteger(seconds) || seconds * 1000 > Number.MAX_SAFE_INTEGER) {
    throw new Error(`${varName}: duration is too large`);
  }
  return seconds;
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

  const boundedInteger = (name: string, fallback: number, min: number, max: number): number => {
    const value = process.env[name] ?? String(fallback);
    if (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max) {
      throw new Error(`${name} must be an integer between ${min} and ${max}`);
    }
    return Number(value);
  };
  const PASSWORD_RESET_CODE_TTL_SECONDS = boundedInteger('PASSWORD_RESET_CODE_TTL_SECONDS', 300, 60, 900);
  const PASSWORD_RESET_CODE_RESEND_SECONDS = boundedInteger('PASSWORD_RESET_CODE_RESEND_SECONDS', 60, 30, 3600);
  const PASSWORD_RESET_CODE_MAX_ATTEMPTS = boundedInteger('PASSWORD_RESET_CODE_MAX_ATTEMPTS', 5, 1, 10);
  const PASSWORD_RESET_CODE_SECRET = process.env['PASSWORD_RESET_CODE_SECRET']?.trim() || raw['JWT_REFRESH_SECRET']!;
  const PASSWORD_RESET_MAIL_PROVIDER = process.env['PASSWORD_RESET_MAIL_PROVIDER'] || 'gmail-smtp';
  if (!['gmail-smtp', 'gmail-api'].includes(PASSWORD_RESET_MAIL_PROVIDER)) {
    throw new Error('PASSWORD_RESET_MAIL_PROVIDER must be gmail-smtp or gmail-api');
  }
  const GMAIL_USER = process.env['GMAIL_USER']?.trim() || '';
  const GMAIL_APP_PASSWORD = process.env['GMAIL_APP_PASSWORD']?.replace(/\s/g, '') || '';
  const GMAIL_OAUTH_CLIENT_ID = process.env['GMAIL_OAUTH_CLIENT_ID']?.trim() || '';
  const GMAIL_OAUTH_CLIENT_SECRET = process.env['GMAIL_OAUTH_CLIENT_SECRET']?.trim() || '';
  const GMAIL_OAUTH_REFRESH_TOKEN = process.env['GMAIL_OAUTH_REFRESH_TOKEN']?.trim() || '';

  // Derived — computed once, consistent across all consumers
  let REFRESH_TTL_SECONDS: number;
  try {
    REFRESH_TTL_SECONDS = parseTtlToSeconds(JWT_REFRESH_EXPIRES_IN, 'JWT_REFRESH_EXPIRES_IN');
  } catch (e) {
    console.error(`❌ [ENV] ${(e as Error).message}`);
    process.exit(1);
  }

  let ACCESS_TTL_SECONDS: number;
  try {
    ACCESS_TTL_SECONDS = parseTtlToSeconds(JWT_ACCESS_EXPIRES_IN, 'JWT_ACCESS_EXPIRES_IN');
    if (ACCESS_TTL_SECONDS <= 0 || REFRESH_TTL_SECONDS <= 0) throw new Error('JWT token durations must be positive');
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
    ACCESS_TTL_SECONDS,
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
    PASSWORD_RESET_CODE_TTL_SECONDS,
    PASSWORD_RESET_CODE_RESEND_SECONDS,
    PASSWORD_RESET_CODE_MAX_ATTEMPTS,
    PASSWORD_RESET_CODE_SECRET,
    PASSWORD_RESET_MAIL_PROVIDER,
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
    GMAIL_OAUTH_CLIENT_ID,
    GMAIL_OAUTH_CLIENT_SECRET,
    GMAIL_OAUTH_REFRESH_TOKEN,
  };
}

// Singleton — validated once at module load time
const env = validateEnv();

export default env;
export type Env = typeof env;
