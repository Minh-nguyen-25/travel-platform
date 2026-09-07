import { Prisma } from '@prisma/client';
import { BUDGET_LEVEL, BudgetLevel, HTTP_STATUS } from '../constants';
import {
  preferenceRepository,
  TravelPreferenceRecord,
} from '../repositories/preference.repository';
import {
  CreatePreferenceInput,
  TravelPreferenceResponse,
  UpdatePreferenceInput,
} from '../types/preference.types';
import { AppError } from '../utils/app-error';

const NOT_FOUND_MESSAGE = 'Không tìm thấy sở thích du lịch của bạn';

const isPrismaError = (error: unknown, code: string): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;

const serializeStringList = (value: Prisma.JsonValue | null): string[] | null => {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    return null;
  }

  return value;
};

const serializeBudgetLevel = (value: string | null): BudgetLevel | null =>
  value === BUDGET_LEVEL.LOW ||
  value === BUDGET_LEVEL.MEDIUM ||
  value === BUDGET_LEVEL.HIGH
    ? value
    : null;

const serializePreference = (
  preference: TravelPreferenceRecord
): TravelPreferenceResponse => ({
  id: preference.id,
  userId: preference.userId,
  budgetLevel: serializeBudgetLevel(preference.budgetLevel),
  travelStyle: preference.travelStyle,
  preferredActivities: serializeStringList(preference.preferredActivities),
  preferredCategories: serializeStringList(preference.preferredCategories),
  updatedAt: preference.updatedAt.toISOString(),
});

export const preferenceService = {
  async getPreference(userId: number): Promise<TravelPreferenceResponse> {
    const preference = await preferenceRepository.findByUserId(userId);

    if (!preference) {
      throw new AppError(NOT_FOUND_MESSAGE, HTTP_STATUS.NOT_FOUND);
    }

    return serializePreference(preference);
  },

  async createPreference(
    userId: number,
    input: CreatePreferenceInput
  ): Promise<TravelPreferenceResponse> {
    try {
      const preference = await preferenceRepository.createForUser(userId, input);
      return serializePreference(preference);
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new AppError(
          'Sở thích du lịch của bạn đã tồn tại',
          HTTP_STATUS.CONFLICT
        );
      }

      throw error;
    }
  },

  async updatePreference(
    userId: number,
    input: UpdatePreferenceInput
  ): Promise<TravelPreferenceResponse> {
    try {
      const preference = await preferenceRepository.updateForUser(userId, input);
      return serializePreference(preference);
    } catch (error) {
      if (isPrismaError(error, 'P2025')) {
        throw new AppError(NOT_FOUND_MESSAGE, HTTP_STATUS.NOT_FOUND);
      }

      throw error;
    }
  },

  async deletePreference(userId: number): Promise<void> {
    try {
      await preferenceRepository.deleteForUser(userId);
    } catch (error) {
      if (isPrismaError(error, 'P2025')) {
        throw new AppError(NOT_FOUND_MESSAGE, HTTP_STATUS.NOT_FOUND);
      }

      throw error;
    }
  },
};
