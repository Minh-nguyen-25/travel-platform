export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type UserRole = 'USER' | 'ADMIN';
export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'FACEBOOK' | string;

export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  providerId?: string | null;
  role: UserRole;
  isActive: boolean;
  authProvider: AuthProvider;
  provider?: string;
  hasPassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
  password?: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  user: User;
}

export type LoginResponse = ApiResponse<AuthTokenResponse>;
export type RegisterResponse = ApiResponse<AuthTokenResponse>;
export type MeResponse = ApiResponse<{ user: User }>;
export type RefreshResponse = ApiResponse<{ accessToken: string }>;

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refresh: () => Promise<string | null>;
  updateProfile: (data: UpdateProfileRequest) => Promise<User>;
  uploadAvatar: (file: File) => Promise<User>;
  deleteAvatar: () => Promise<User>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
}
