/**
 * Types cho Authentication.
 * Các field được map chính xác từ Prisma User model trong Backend và API responses.
 *
 * Prisma User model (schema.prisma):
 *   id, fullName, email, avatarUrl, providerId, role, isActive, authProvider, createdAt, updatedAt
 */

// ================================================================
// GENERIC API RESPONSE
// ================================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ================================================================
// USER
// ================================================================

/** Role của User — phải khớp với giá trị trong DB */
export type UserRole = 'USER' | 'ADMIN';

/** Thông tin User trả về từ API (GET /auth/me hoặc trong Login/Register response) */
export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  providerId: string | null;
  role: UserRole;
  isActive: boolean;
  authProvider: string;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
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

export type LoginResponse = ApiResponse<AuthTokenResponse>;
export type RegisterResponse = ApiResponse<AuthTokenResponse>;
export type MeResponse = ApiResponse<{ user: User }>;
export type RefreshResponse = ApiResponse<{ accessToken: string }>;

// ================================================================
// AUTH CONTEXT
// ================================================================

export interface AuthContextType {
  /** Thông tin user hiện tại. null nếu chưa đăng nhập */
  user: User | null;

  /** Access Token hiện tại trong RAM. null nếu chưa đăng nhập */
  accessToken: string | null;

  /** true nếu đã đăng nhập (user !== null) */
  isAuthenticated: boolean;

  /**
   * true khi đang kiểm tra / khôi phục session ban đầu (restoreSession).
   * Dùng để tránh flash redirect khi app mới load.
   */
  isAuthLoading: boolean;

  /** Đăng nhập bằng email/password — trả về User vừa đăng nhập để caller redirect an toàn */
  login: (data: LoginRequest) => Promise<User>;

  /** Đăng ký tài khoản mới — trả về User vừa tạo để caller redirect an toàn */
  register: (data: RegisterRequest) => Promise<User>;

  /** Đăng xuất — gọi POST /auth/logout và clear state */
  logout: () => Promise<void>;

  /** Khôi phục session thông qua Refresh Token HttpOnly cookie và GET /auth/me */
  restoreSession: () => Promise<void>;
}
