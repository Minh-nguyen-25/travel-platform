import { User } from '@prisma/client';
import prisma from '../config/db';
import { ROLE, AUTH_PROVIDER } from '../constants';

// ─── Input type for user creation ────────────────────────────────────────────
// role and authProvider are constrained to the existing project constants,
// which match the string values in schema.prisma exactly.
export interface CreateUserData {
  fullName:     string;
  email:        string;
  passwordHash: string;
  role:         typeof ROLE.USER;             // 'USER'
  authProvider: typeof AUTH_PROVIDER.LOCAL;  // 'LOCAL'
}

// ─── Repository ───────────────────────────────────────────────────────────────

/**
 * Find a user by email.
 * Returns the full User record (including passwordHash) so the service
 * can perform bcrypt comparison. Never expose this return value directly in a response.
 */
export const findByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { email } });
};

/**
 * Find a user by ID.
 * passwordHash is omitted — safe to use in JWT payload and responses.
 */
export const findById = async (
  id: number
): Promise<Omit<User, 'passwordHash'> | null> => {
  return prisma.user.findUnique({
    where: { id },
    omit: { passwordHash: true },
  });
};

/**
 * Create a new local user.
 * passwordHash is omitted from the return value — safe for responses.
 */
export const createUser = async (
  data: CreateUserData
): Promise<Omit<User, 'passwordHash'>> => {
  return prisma.user.create({
    data,
    omit: { passwordHash: true },
  });
};
