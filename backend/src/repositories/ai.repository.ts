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

const aiChatTripSelect = {
  id: true,
  name: true,
  destinationCity: true,
  startDate: true,
  endDate: true,
  budget: true,
  numberOfPeople: true,
  description: true,
  isAiGenerated: true,
  tripDays: {
    orderBy: { dayNumber: 'asc' as const },
    take: 14,
    select: {
      dayNumber: true,
      date: true,
      note: true,
      itineraries: {
        orderBy: { sequenceOrder: 'asc' as const },
        take: 8,
        select: {
          startTime: true,
          endTime: true,
          estimatedCost: true,
          travelMode: true,
          note: true,
          destination: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.TripSelect;

const aiChatDestinationSelect = {
  id: true,
  name: true,
  address: true,
  description: true,
  ticketPrice: true,
  openingHoursNote: true,
  visitDuration: true,
  rating: true,
  categories: { select: { category: { select: { name: true } } } },
} satisfies Prisma.DestinationSelect;

export type AiDestinationRecord = Prisma.DestinationGetPayload<{
  select: typeof aiDestinationSelect;
}>;

export type AiPreferenceRecord = Prisma.TravelPreferenceGetPayload<{
  select: typeof aiPreferenceSelect;
}>;

export type AiChatTripRecord = Prisma.TripGetPayload<{
  select: typeof aiChatTripSelect;
}>;

export type AiChatDestinationRecord = Prisma.DestinationGetPayload<{
  select: typeof aiChatDestinationSelect;
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

  findUserTripsForChat(userId: number, limit: number): Promise<AiChatTripRecord[]> {
    return prisma.trip.findMany({
      where: { userId },
      select: aiChatTripSelect,
      orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
      take: limit,
    });
  },

  findDestinationsForChat(limit: number): Promise<AiChatDestinationRecord[]> {
    return prisma.destination.findMany({
      where: { isActive: true },
      select: aiChatDestinationSelect,
      orderBy: [{ rating: 'desc' }, { id: 'asc' }],
      take: limit,
    });
  },
};

export type AiRepository = Pick<
  typeof aiRepository,
  | 'findPreference'
  | 'findActiveDestinations'
  | 'findUserTripsForChat'
  | 'findDestinationsForChat'
>;
