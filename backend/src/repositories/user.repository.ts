import { Prisma, User } from '@prisma/client';
import prisma from '../config/db';
import { AdminUserListQuery } from '../types/user.types';

const adminUserInclude = {
  _count: {
    select: { reviews: true, favorites: true, trips: true },
  },
} satisfies Prisma.UserInclude;

export type AdminUserRecord = Prisma.UserGetPayload<{
  include: typeof adminUserInclude;
}>;

const buildWhere = (query: AdminUserListQuery): Prisma.UserWhereInput => ({
  ...(query.search && {
    OR: [
      { fullName: { contains: query.search, mode: 'insensitive' as const } },
      { email: { contains: query.search, mode: 'insensitive' as const } },
    ],
  }),
  ...(query.role && { role: query.role }),
  ...(query.authProvider && { authProvider: query.authProvider }),
  ...(query.isActive !== undefined && { isActive: query.isActive }),
});

export const userRepository = {
  findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  updateProfile(id: number, fullName: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { fullName } });
  },

  updatePassword(id: number, passwordHash: string): Promise<User> {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  updateAvatar(id: number, avatarUrl: string | null): Promise<User> {
    return prisma.user.update({ where: { id }, data: { avatarUrl } });
  },

  async findManyAdmin(
    query: AdminUserListQuery
  ): Promise<{ data: AdminUserRecord[]; total: number }> {
    const where = buildWhere(query);
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: adminUserInclude,
        orderBy: [{ [query.sortBy]: query.sortOrder }, { id: query.sortOrder }],
        skip,
        take: query.limit,
      }),
      prisma.user.count({ where }),
    ]);
    return { data, total };
  },

  findAdminById(id: number): Promise<AdminUserRecord | null> {
    return prisma.user.findUnique({ where: { id }, include: adminUserInclude });
  },

  setStatus(id: number, isActive: boolean): Promise<AdminUserRecord> {
    return prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { isActive } });
      if (!isActive) await tx.refreshToken.deleteMany({ where: { userId: id } });
      return tx.user.findUniqueOrThrow({ where: { id }, include: adminUserInclude });
    });
  },

  setRole(id: number, role: 'ADMIN' | 'USER'): Promise<AdminUserRecord> {
    return prisma.$transaction(
      async (tx) => {
        const current = await tx.user.findUniqueOrThrow({ where: { id } });
        if (current.role === 'ADMIN' && role === 'USER' && current.isActive) {
          const activeAdminCount = await tx.user.count({
            where: { role: 'ADMIN', isActive: true },
          });
          if (activeAdminCount <= 1) throw new Error('LAST_ACTIVE_ADMIN');
        }

        await tx.user.update({ where: { id }, data: { role } });
        await tx.refreshToken.deleteMany({ where: { userId: id } });
        return tx.user.findUniqueOrThrow({ where: { id }, include: adminUserInclude });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  },
};

