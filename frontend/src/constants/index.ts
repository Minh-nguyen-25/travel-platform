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
