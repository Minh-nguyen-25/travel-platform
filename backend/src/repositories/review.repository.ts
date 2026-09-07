import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import {
  AdminReviewListQuery,
  CreateReviewInput,
  ReviewListQuery,
  UpdateReviewInput,
} from '../types/review.types';

const reviewInclude = {
  user: {
    select: { id: true, fullName: true, avatarUrl: true },
  },
  destination: {
    select: { id: true, name: true },
  },
  images: {
    orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }],
  },
} satisfies Prisma.ReviewInclude;

export type ReviewRecord = Prisma.ReviewGetPayload<{
  include: typeof reviewInclude;
}>;

const isRetryableTransactionError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';

const withSerializableTransaction = async <T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (!isRetryableTransactionError(error) || attempt === maxAttempts) throw error;
    }
  }

  throw new Error('Không thể hoàn tất transaction đánh giá');
};

export const roundAverageRating = (average: number | null): number =>
  average === null ? 0 : Math.round(average * 10) / 10;

const recalculateDestinationRating = async (
  tx: Prisma.TransactionClient,
  destinationId: number
): Promise<number> => {
  const aggregate = await tx.review.aggregate({
    where: { destinationId, isVisible: true },
    _avg: { rating: true },
  });
  const rating = roundAverageRating(aggregate._avg.rating);

  await tx.destination.update({
    where: { id: destinationId },
    data: { rating },
  });

  return rating;
};

const buildAdminWhere = (query: AdminReviewListQuery): Prisma.ReviewWhereInput => ({
  ...(query.destinationId !== undefined && { destinationId: query.destinationId }),
  ...(query.userId !== undefined && { userId: query.userId }),
  ...(query.rating !== undefined && { rating: query.rating }),
  ...(query.isVisible !== undefined && { isVisible: query.isVisible }),
  ...(query.search && {
    OR: [
      { comment: { contains: query.search, mode: 'insensitive' as const } },
      { user: { fullName: { contains: query.search, mode: 'insensitive' as const } } },
      { destination: { name: { contains: query.search, mode: 'insensitive' as const } } },
    ],
  }),
});

export const reviewRepository = {
  async findPublicByDestination(
    destinationId: number,
    query: ReviewListQuery
  ): Promise<{ data: ReviewRecord[]; total: number }> {
    const where: Prisma.ReviewWhereInput = { destinationId, isVisible: true };
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: [{ [query.sortBy]: query.sortOrder }, { id: query.sortOrder }],
        skip,
        take: query.limit,
      }),
      prisma.review.count({ where }),
    ]);

    return { data, total };
  },

  async findAdmin(
    query: AdminReviewListQuery
  ): Promise<{ data: ReviewRecord[]; total: number }> {
    const where = buildAdminWhere(query);
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: [{ [query.sortBy]: query.sortOrder }, { id: query.sortOrder }],
        skip,
        take: query.limit,
      }),
      prisma.review.count({ where }),
    ]);

    return { data, total };
  },

  findById(id: number): Promise<ReviewRecord | null> {
    return prisma.review.findUnique({ where: { id }, include: reviewInclude });
  },

  findByUserAndDestination(
    userId: number,
    destinationId: number
  ): Promise<ReviewRecord | null> {
    return prisma.review.findUnique({
      where: { userId_destinationId: { userId, destinationId } },
      include: reviewInclude,
    });
  },

  create(
    userId: number,
    destinationId: number,
    input: CreateReviewInput,
    imageUrls: string[]
  ): Promise<ReviewRecord> {
    return withSerializableTransaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          userId,
          destinationId,
          rating: input.rating,
          comment: input.comment ?? null,
          ...(imageUrls.length > 0 && {
            images: { create: imageUrls.map((imageUrl) => ({ imageUrl })) },
          }),
        },
        select: { id: true },
      });

      await recalculateDestinationRating(tx, destinationId);
      return tx.review.findUniqueOrThrow({
        where: { id: created.id },
        include: reviewInclude,
      });
    });
  },

  update(
    id: number,
    input: UpdateReviewInput,
    imageUrls: string[]
  ): Promise<ReviewRecord> {
    return withSerializableTransaction(async (tx) => {
      const current = await tx.review.findUniqueOrThrow({
        where: { id },
        select: { destinationId: true },
      });

      await tx.review.update({
        where: { id },
        data: {
          ...(input.rating !== undefined && { rating: input.rating }),
          ...(input.comment !== undefined && { comment: input.comment }),
          ...(imageUrls.length > 0 && {
            images: { create: imageUrls.map((imageUrl) => ({ imageUrl })) },
          }),
        },
      });

      await recalculateDestinationRating(tx, current.destinationId);
      return tx.review.findUniqueOrThrow({ where: { id }, include: reviewInclude });
    });
  },

  async delete(id: number): Promise<{ review: ReviewRecord; imageUrls: string[] }> {
    return withSerializableTransaction(async (tx) => {
      const review = await tx.review.findUniqueOrThrow({
        where: { id },
        include: reviewInclude,
      });
      await tx.review.delete({ where: { id } });
      await recalculateDestinationRating(tx, review.destinationId);

      return { review, imageUrls: review.images.map(({ imageUrl }) => imageUrl) };
    });
  },

  setVisibility(id: number, isVisible: boolean): Promise<ReviewRecord> {
    return withSerializableTransaction(async (tx) => {
      const current = await tx.review.findUniqueOrThrow({
        where: { id },
        select: { destinationId: true },
      });
      await tx.review.update({ where: { id }, data: { isVisible } });
      await recalculateDestinationRating(tx, current.destinationId);

      return tx.review.findUniqueOrThrow({ where: { id }, include: reviewInclude });
    });
  },

  async deleteImage(
    reviewId: number,
    imageId: number
  ): Promise<{ review: ReviewRecord; imageUrl: string }> {
    return prisma.$transaction(async (tx) => {
      const image = await tx.reviewImage.findFirst({ where: { id: imageId, reviewId } });
      if (!image) throw new Error('REVIEW_IMAGE_NOT_FOUND');

      await tx.reviewImage.delete({ where: { id: image.id } });
      const review = await tx.review.findUniqueOrThrow({
        where: { id: reviewId },
        include: reviewInclude,
      });

      return { review, imageUrl: image.imageUrl };
    });
  },
};

