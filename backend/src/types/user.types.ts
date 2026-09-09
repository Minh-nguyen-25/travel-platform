import { AuthProvider, Role } from '../constants';

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  authProvider: string;
  provider: string;
  hasPassword: boolean;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  fullName: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AdminUserListQuery {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  authProvider?: AuthProvider;
  isActive?: boolean;
  sortBy: 'createdAt' | 'fullName' | 'email';
  sortOrder: 'asc' | 'desc';
}

export interface AdminUserResponse extends UserResponse {
  counts: {
    reviews: number;
    favorites: number;
    trips: number;
  };
}

export interface UserStatusInput {
  isActive: boolean;
}

export interface UserRoleInput {
  role: Role;
}
