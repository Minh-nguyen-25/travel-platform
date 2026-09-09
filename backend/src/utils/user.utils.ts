import { User } from '@prisma/client';
import { UserResponse } from '../types/user.types';

export type UserLike = Omit<User, 'passwordHash'> & {
  passwordHash?: string | null;
  hasPassword?: boolean;
};

export const serializeUser = (user: UserLike): UserResponse => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  authProvider: user.authProvider,
  provider: user.authProvider.toLowerCase(),
  hasPassword: typeof user.hasPassword === 'boolean' ? user.hasPassword : Boolean(user.passwordHash),
  avatarUrl: user.avatarUrl,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
  updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : String(user.updatedAt),
});
