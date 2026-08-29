import { Prisma } from '@prisma/client';
import prisma from '../config/db';

const aiDestinationSelect = {
  id: true,
  name: true,
  description: true,
  address: true,
  latitude: true,
  longitude: true,
  ticketPrice: true,
  openingHoursNote: true,
  visitDuration: true,
  rating: true,
  categories: { select: { category: { select: { name: true } } } },
} satisfies Prisma.DestinationSelect;

const aiPreferenceSelect = {
  budgetLevel: true,
  travelStyle: true,
  preferredActivities: true,
  preferredCategories: true,
} satisfies Prisma.TravelPreferenceSelect;

export type AiDestinationRecord = Prisma.DestinationGetPayload<{
  select: typeof aiDestinationSelect;
}>;

export type AiPreferenceRecord = Prisma.TravelPreferenceGetPayload<{
  select: typeof aiPreferenceSelect;
}>;

export const aiRepository = {
  findPreference(userId: number): Promise<AiPreferenceRecord | null> {
    return prisma.travelPreference.findUnique({
      where: { userId },
      select: aiPreferenceSelect,
    });
  },

  findActiveDestinations(
    destinationCity: string,
    limit: number
  ): Promise<AiDestinationRecord[]> {
    return prisma.destination.findMany({
      where: {
        isActive: true,
        OR: [
          { address: { contains: destinationCity, mode: 'insensitive' } },
          { name: { contains: destinationCity, mode: 'insensitive' } },
        ],
      },
      select: aiDestinationSelect,
      orderBy: [{ rating: 'desc' }, { id: 'asc' }],
      take: limit,
    });
  },
};

export type AiRepository = Pick<
  typeof aiRepository,
  'findPreference' | 'findActiveDestinations'
>;
