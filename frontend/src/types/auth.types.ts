/**
 * Types cho Authentication.
 * Các field được map chính xác từ Prisma User model trong Backend.
 *
 * Prisma User model (schema.prisma):
 *   id, fullName, email, avatarUrl, role, isActive, createdAt, updatedAt
 */

// ================================================================
// USER
// ================================================================

/** Role của User — phải khớp với giá trị trong DB (cột role VarChar) */
export type UserRole = 'USER' | 'ADMIN';

/** Thông tin User trả về từ API (GET /users/me hoặc trong Login response) */
export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  authProvider: string;
  createdAt: string; // ISO 8601 string
}

// ================================================================
// AUTH REQUESTS
// ================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

// ================================================================
// AUTH RESPONSES — dựa trên format từ response.utils.ts Backend
// ================================================================

export interface AuthTokenResponse {
  accessToken: string;
  user: User;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthTokenResponse;
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: User;
}

// ================================================================
// AUTH CONTEXT
// ================================================================

export interface AuthContextType {
  /** Thông tin user hiện tại. null nếu chưa đăng nhập */
  user: User | null;

  /** Access Token hiện tại. null nếu chưa đăng nhập */
  accessToken: string | null;

  /** true nếu đã đăng nhập và có user */
  isAuthenticated: boolean;

  /**
   * true khi đang kiểm tra session ban đầu (loadCurrentUser).
   * Dùng để tránh flash redirect khi app mới load.
   */
  isLoading: boolean;

  /** Đăng nhập bằng email/password */
  login: (data: LoginRequest) => Promise<void>;

  /** Đăng xuất — clear token + gọi POST /auth/logout */
  logout: () => Promise<void>;

  /**
   * Làm mới Access Token bằng Refresh Token (HttpOnly Cookie).
   * Trả về Access Token mới nếu thành công.
   */
  refresh: () => Promise<string | null>;

  /**
   * Giả lập đăng nhập nhanh cho môi trường Dev (khi Backend Auth chưa có).
   */
  mockLogin: (role?: UserRole) => void;
}
