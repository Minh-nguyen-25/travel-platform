// Tận dụng string literal thay vì redefine enum để nhất quán với Prisma schema
// Prisma sẽ tự validate giá trị này khi insert/update

export const ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

export const AUTH_PROVIDER = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
  FACEBOOK: 'FACEBOOK',
} as const;
export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];

/**
 * Fixed allowlist of error codes that may appear in OAuth failure redirect URLs.
 * Backend ONLY uses these values — raw provider messages, tokens, and stack traces
 * are never placed in URLs. Frontend maps these codes to Vietnamese messages.
 */
export const OAUTH_ERROR_CODES = {
  STATE_INVALID:           'STATE_INVALID',
  STATE_EXPIRED:           'STATE_EXPIRED',
  EMAIL_NOT_VERIFIED:      'EMAIL_NOT_VERIFIED',
  EMAIL_MISSING:           'EMAIL_MISSING',
  FACEBOOK_EMAIL_REQUIRED: 'FACEBOOK_EMAIL_REQUIRED',
  ACCOUNT_LOCKED:          'ACCOUNT_LOCKED',
  EMAIL_CONFLICT_LOCAL:    'EMAIL_CONFLICT_LOCAL',
  EMAIL_CONFLICT_PROVIDER: 'EMAIL_CONFLICT_PROVIDER',
  PROVIDER_ERROR:          'PROVIDER_ERROR',
  CONFIG_ERROR:            'CONFIG_ERROR',
} as const;
export type OAuthErrorCode = (typeof OAUTH_ERROR_CODES)[keyof typeof OAUTH_ERROR_CODES];

export const TRAVEL_MODE = {
  WALKING: 'WALKING',
  DRIVING: 'DRIVING',
  TRANSIT: 'TRANSIT',
  CYCLING: 'CYCLING',
} as const;
export type TravelMode = (typeof TRAVEL_MODE)[keyof typeof TRAVEL_MODE];

export const BUDGET_LEVEL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;
export type BudgetLevel = (typeof BUDGET_LEVEL)[keyof typeof BUDGET_LEVEL];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  UNPROCESSABLE: 422,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_SERVER_ERROR: 500,
} as const;
