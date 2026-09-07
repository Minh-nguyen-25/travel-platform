import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import {
  CreateDestinationInput,
  DestinationListQuery,
  UpdateDestinationInput,
  UploadedDestinationImage,
} from '../types/destination.types';

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

export type DestinationRecord = Prisma.DestinationGetPayload<{
  include: typeof destinationInclude;
}>;

const buildWhere = (
  query: DestinationListQuery,
  publicOnly: boolean
): Prisma.DestinationWhereInput => {
  const where: Prisma.DestinationWhereInput = {};

  if (publicOnly) {
    where.isActive = true;
  } else if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { address: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.ticketPrice = {
      ...(query.minPrice !== undefined && { gte: query.minPrice }),
      ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
    };
  }

  if (query.minRating !== undefined || query.maxRating !== undefined) {
    where.rating = {
      ...(query.minRating !== undefined && { gte: query.minRating }),
      ...(query.maxRating !== undefined && { lte: query.maxRating }),
    };
  }

  const categoryIds = query.categoryIds ?? [];
  if (categoryIds.length > 0) {
    if (query.categoryMatch === 'all') {
      where.AND = categoryIds.map((categoryId) => ({
        categories: { some: { categoryId } },
      }));
    } else {
      where.categories = { some: { categoryId: { in: categoryIds } } };
    }
  }

  return where;
};

const buildOrderBy = (
  query: DestinationListQuery
): Prisma.DestinationOrderByWithRelationInput[] => [
  { [query.sortBy]: query.sortOrder },
  { id: query.sortOrder },
];

const createCategoryRelations = (categoryIds: number[]) =>
  categoryIds.map((categoryId) => ({
    category: { connect: { id: categoryId } },
  }));

const createImageRelations = (
  images: UploadedDestinationImage[],
  primaryImageIndex?: number
) =>
  images.map((image, index) => ({
    imageUrl: image.imageUrl,
    isPrimary: index === (primaryImageIndex ?? 0),
    displayOrder: index,
  }));

const buildCreateData = (
  input: CreateDestinationInput,
  images: UploadedDestinationImage[],
  primaryImageIndex?: number
): Prisma.DestinationCreateInput => ({
  name: input.name,
  description: input.description ?? null,
  address: input.address,
  phoneNumber: input.phoneNumber ?? null,
  latitude: new Prisma.Decimal(input.latitude),
  longitude: new Prisma.Decimal(input.longitude),
  ticketPrice: new Prisma.Decimal(input.ticketPrice ?? 0),
  openingHoursNote: input.openingHoursNote ?? null,
  visitDuration: input.visitDuration ?? null,
  rating: new Prisma.Decimal(0),
  isActive: input.isActive ?? true,
  categories: { create: createCategoryRelations(input.categoryIds) },
  ...(images.length > 0 && {
    images: { create: createImageRelations(images, primaryImageIndex) },
  }),
});

const buildUpdateData = (
  input: UpdateDestinationInput
): Prisma.DestinationUpdateInput => {
  const data: Prisma.DestinationUpdateInput = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.address !== undefined) data.address = input.address;
  if (input.phoneNumber !== undefined) data.phoneNumber = input.phoneNumber;
  if (input.latitude !== undefined) data.latitude = new Prisma.Decimal(input.latitude);
  if (input.longitude !== undefined) data.longitude = new Prisma.Decimal(input.longitude);
  if (input.ticketPrice !== undefined) data.ticketPrice = new Prisma.Decimal(input.ticketPrice);
  if (input.openingHoursNote !== undefined) data.openingHoursNote = input.openingHoursNote;
  if (input.visitDuration !== undefined) data.visitDuration = input.visitDuration;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.categoryIds !== undefined) {
    data.categories = {
      deleteMany: {},
      create: createCategoryRelations(input.categoryIds),
    };
  }

  return data;
};

export const destinationRepository = {
  async findMany(
    query: DestinationListQuery,
    publicOnly: boolean
  ): Promise<{ data: DestinationRecord[]; total: number }> {
    const where = buildWhere(query, publicOnly);
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await prisma.$transaction([
      prisma.destination.findMany({
        where,
        include: destinationInclude,
        orderBy: buildOrderBy(query),
        skip,
        take: query.limit,
      }),
      prisma.destination.count({ where }),
    ]);

    return { data, total };
  },

  findById(id: number, publicOnly = false): Promise<DestinationRecord | null> {
    return prisma.destination.findFirst({
      where: { id, ...(publicOnly && { isActive: true }) },
      include: destinationInclude,
    });
  },

  async findExistingCategoryIds(categoryIds: number[]): Promise<number[]> {
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });

    return categories.map(({ id }) => id);
  },

  create(
    input: CreateDestinationInput,
    images: UploadedDestinationImage[] = [],
    primaryImageIndex?: number
  ): Promise<DestinationRecord> {
    return prisma.destination.create({
      data: buildCreateData(input, images, primaryImageIndex),
      include: destinationInclude,
    });
  },

  async update(
    id: number,
    input: UpdateDestinationInput,
    images: UploadedDestinationImage[] = [],
    primaryImageIndex?: number
  ): Promise<DestinationRecord> {
    return prisma.$transaction(async (tx) => {
      const currentImages = await tx.destinationImage.findMany({
        where: { destinationId: id },
        select: { isPrimary: true, displayOrder: true },
        orderBy: { displayOrder: 'desc' },
      });
      const hasPrimary = currentImages.some(({ isPrimary }) => isPrimary);
      const selectedNewPrimary = images.length > 0 && primaryImageIndex !== undefined;

      if (selectedNewPrimary) {
        await tx.destinationImage.updateMany({
          where: { destinationId: id },
          data: { isPrimary: false },
        });
      }

      const destination = await tx.destination.update({
        where: { id },
        data: {
          ...buildUpdateData(input),
          ...(images.length > 0 && {
            images: {
              create: images.map((image, index) => ({
                imageUrl: image.imageUrl,
                displayOrder: (currentImages[0]?.displayOrder ?? -1) + index + 1,
                isPrimary: selectedNewPrimary
                  ? index === primaryImageIndex
                  : !hasPrimary && index === 0,
              })),
            },
          }),
        },
        include: destinationInclude,
      });

      return destination;
    });
  },

  softDelete(id: number): Promise<DestinationRecord> {
    return prisma.destination.update({
      where: { id },
      data: { isActive: false },
      include: destinationInclude,
    });
  },

  async deleteImage(
    destinationId: number,
    imageId: number
  ): Promise<{ destination: DestinationRecord; imageUrl: string }> {
    return prisma.$transaction(async (tx) => {
      const image = await tx.destinationImage.findFirst({
        where: { id: imageId, destinationId },
      });

      if (!image) {
        throw new Error('DESTINATION_IMAGE_NOT_FOUND');
      }

      await tx.destinationImage.delete({ where: { id: image.id } });

      if (image.isPrimary) {
        const nextPrimary = await tx.destinationImage.findFirst({
          where: { destinationId },
          orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
          select: { id: true },
        });

        if (nextPrimary) {
          await tx.destinationImage.update({
            where: { id: nextPrimary.id },
            data: { isPrimary: true },
          });
        }
      }

      const destination = await tx.destination.findUniqueOrThrow({
        where: { id: destinationId },
        include: destinationInclude,
      });

      return { destination, imageUrl: image.imageUrl };
    });
  },

  async setPrimaryImage(destinationId: number, imageId: number): Promise<DestinationRecord> {
    return prisma.$transaction(async (tx) => {
      const image = await tx.destinationImage.findFirst({
        where: { id: imageId, destinationId },
        select: { id: true },
      });

      if (!image) {
        throw new Error('DESTINATION_IMAGE_NOT_FOUND');
      }

      await tx.destinationImage.updateMany({
        where: { destinationId },
        data: { isPrimary: false },
      });
      await tx.destinationImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });

      return tx.destination.findUniqueOrThrow({
        where: { id: destinationId },
        include: destinationInclude,
      });
    });
  },
};
