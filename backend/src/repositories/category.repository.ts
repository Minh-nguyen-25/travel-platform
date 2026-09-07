import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import {
  CategoryListQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/destination.types';

const categoryInclude = {
  _count: { select: { destinations: true } },
} satisfies Prisma.CategoryInclude;

export type CategoryRecord = Prisma.CategoryGetPayload<{
  include: typeof categoryInclude;
}>;

export const categoryRepository = {
  async findMany(
    query: CategoryListQuery
  ): Promise<{ data: CategoryRecord[]; total: number }> {
    const where: Prisma.CategoryWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};
    const orderBy: Prisma.CategoryOrderByWithRelationInput[] = [
      { [query.sortBy]: query.sortOrder },
      { id: query.sortOrder },
    ];

    const [data, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        include: categoryInclude,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.category.count({ where }),
    ]);

    return { data, total };
  },

  findById(id: number): Promise<CategoryRecord | null> {
    return prisma.category.findUnique({
      where: { id },
      include: categoryInclude,
    });
  },

  findByNameInsensitive(name: string, excludeId?: number) {
    return prisma.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId !== undefined && { id: { not: excludeId } }),
      },
      select: { id: true },
    });
  },

  create(input: CreateCategoryInput): Promise<CategoryRecord> {
    return prisma.category.create({
      data: {
        name: input.name,
        description: input.description ?? null,
      },
      include: categoryInclude,
    });
  },

  update(id: number, input: UpdateCategoryInput): Promise<CategoryRecord> {
    return prisma.category.update({
      where: { id },
      data: input,
      include: categoryInclude,
    });
  },

  delete(id: number): Promise<CategoryRecord> {
    return prisma.category.delete({
      where: { id },
      include: categoryInclude,
    });
  },
};
