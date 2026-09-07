import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { PreferenceWriteInput } from '../types/preference.types';

const preferenceSelect = {
  id: true,
  userId: true,
  budgetLevel: true,
  travelStyle: true,
  preferredActivities: true,
  preferredCategories: true,
  updatedAt: true,
} satisfies Prisma.TravelPreferenceSelect;

export type TravelPreferenceRecord = Prisma.TravelPreferenceGetPayload<{
  select: typeof preferenceSelect;
}>;

const toNullableJson = (
  value: string[] | null | undefined
): Prisma.InputJsonValue | Prisma.NullTypes.DbNull | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return value === null ? Prisma.DbNull : value;
};

const toWriteData = (input: PreferenceWriteInput) => ({
  budgetLevel: input.budgetLevel,
  travelStyle: input.travelStyle,
  preferredActivities: toNullableJson(input.preferredActivities),
  preferredCategories: toNullableJson(input.preferredCategories),
});

export const preferenceRepository = {
  findByUserId(userId: number): Promise<TravelPreferenceRecord | null> {
    return prisma.travelPreference.findUnique({
      where: { userId },
      select: preferenceSelect,
    });
  },

  createForUser(
    userId: number,
    input: PreferenceWriteInput
  ): Promise<TravelPreferenceRecord> {
    return prisma.travelPreference.create({
      data: {
        userId,
        ...toWriteData(input),
      },
      select: preferenceSelect,
    });
  },

  updateForUser(
    userId: number,
    input: PreferenceWriteInput
  ): Promise<TravelPreferenceRecord> {
    return prisma.travelPreference.update({
      where: { userId },
      data: toWriteData(input),
      select: preferenceSelect,
    });
  },

  deleteForUser(userId: number): Promise<TravelPreferenceRecord> {
    return prisma.travelPreference.delete({
      where: { userId },
      select: preferenceSelect,
    });
  },
};
