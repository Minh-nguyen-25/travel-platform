import { User } from '@prisma/client';
import { UserResponse } from '../types/user.types';

export const serializeUser = (user: User): UserResponse => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  authProvider: user.authProvider,
  avatarUrl: user.avatarUrl,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});
