/**
 * Constants dùng chung cho toàn bộ Frontend.
 * Import từ '@/constants'.
 */

// ================================================================
// ROUTE PATHS
// Dùng ROUTES.<key> thay vì hard-code string để tránh lỗi typo.
// ================================================================
export const ROUTES = {
  // Public
  HOME: '/',
  DESTINATIONS: '/destinations',
  DESTINATION_DETAIL: (id: number | string = ':id') => `/destinations/${id}`,
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  SHARED_TRIP: (token: string = ':token') => `/shared-trip/${token}`,

  // Protected (User)
  PROFILE: '/profile',
  FAVORITES: '/favorites',
  PREFERENCES: '/preferences',
  AI_CHAT: '/ai-chat',
  TRIPS: '/trips',
  TRIP_DETAIL: (id: number | string = ':id') => `/trips/${id}`,

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_DESTINATIONS: '/admin/destinations',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_REVIEWS: '/admin/reviews',

  // OAuth
  OAUTH_CALLBACK: '/oauth/callback',
} as const;

// ================================================================
// USER ROLES — phải khớp với Prisma enum Role trong Backend
// ================================================================
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ================================================================
// PAGINATION DEFAULTS
// ================================================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
} as const;

// ================================================================
// OAUTH ERROR MESSAGES — maps fixed backend error codes to Vietnamese UI messages
// NEVER show raw backend messages from ?error= query param directly.
// ================================================================
export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  STATE_INVALID:           'Phiên xác thực không hợp lệ. Vui lòng thử lại.',
  STATE_EXPIRED:           'Phiên xác thực đã hết hạn. Vui lòng thử lại.',
  EMAIL_NOT_VERIFIED:      'Email Google chưa được xác minh. Vui lòng xác minh email trước khi đăng nhập.',
  EMAIL_MISSING:           'Tài khoản Facebook không có email hoặc chưa được xác minh. Vui lòng thêm email vào tài khoản Facebook trước.',
  FACEBOOK_EMAIL_REQUIRED: 'Tài khoản Facebook không cung cấp email hoặc chưa được cấp quyền email. Vui lòng thêm email vào tài khoản Facebook trước khi đăng nhập.',
  ACCOUNT_LOCKED:          'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
  EMAIL_CONFLICT_LOCAL:    'Email này đã được đăng ký bằng mật khẩu. Vui lòng đăng nhập bằng email và mật khẩu.',
  EMAIL_CONFLICT_PROVIDER: 'Email này đã được liên kết với phương thức đăng nhập khác.',
  PROVIDER_ERROR:          'Có lỗi xảy ra với nhà cung cấp dịch vụ. Vui lòng thử lại sau.',
  CONFIG_ERROR:            'Tính năng này chưa được cấu hình.',
};

export const getOAuthErrorMessage = (code: string | null): string | null => {
  if (!code) return null;
  return OAUTH_ERROR_MESSAGES[code] ?? 'Xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.';
};
