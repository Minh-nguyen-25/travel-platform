import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { FavoriteListQuery } from '../types/favorite.types';

const destinationInclude = {
  categories: {
    include: { category: true },
    orderBy: { categoryId: 'asc' as const },
  },
  images: {
    orderBy: [
      { isPrimary: 'desc' as const },
      { displayOrder: 'asc' as const },
      { id: 'asc' as const },
    ],
  },
} satisfies Prisma.DestinationInclude;

const favoriteInclude = {
  destination: { include: destinationInclude },
} satisfies Prisma.FavoriteInclude;

export type FavoriteRecord = Prisma.FavoriteGetPayload<{
  include: typeof favoriteInclude;
}>;

const isRetryableTransactionError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  (error.code === 'P2034' || error.code === 'P2002');

const toggleInSerializableTransaction = async (
  userId: number,
  destinationId: number
): Promise<boolean> => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const favorite = await tx.favorite.findUnique({
            where: { userId_destinationId: { userId, destinationId } },
            select: { userId: true },
          });

          if (favorite) {
            await tx.favorite.delete({
              where: { userId_destinationId: { userId, destinationId } },
            });
            return false;
          }

          await tx.favorite.create({ data: { userId, destinationId } });
          return true;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
    } catch (error) {
      if (!isRetryableTransactionError(error) || attempt === 3) throw error;
    }
  }

  throw new Error('Không thể hoàn tất transaction yêu thích');
};

export const favoriteRepository = {
  async findMany(
    userId: number,
    query: FavoriteListQuery
  ): Promise<{ data: FavoriteRecord[]; total: number }> {
    const where: Prisma.FavoriteWhereInput = {
      userId,
      destination: { isActive: true },
    };
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await prisma.$transaction([
      prisma.favorite.findMany({
        where,
        include: favoriteInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.favorite.count({ where }),
    ]);

    return { data, total };
  },

  async exists(userId: number, destinationId: number): Promise<boolean> {
    const favorite = await prisma.favorite.findUnique({
      where: { userId_destinationId: { userId, destinationId } },
      select: { userId: true },
    });
    return favorite !== null;
  },

  toggle(userId: number, destinationId: number): Promise<boolean> {
    return toggleInSerializableTransaction(userId, destinationId);
  },
};
