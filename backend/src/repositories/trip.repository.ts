import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { MAX_ITINERARIES_PER_DAY } from '../constants/trip.constants';
import {
  NormalizedCreateItineraryInput,
  NormalizedCreateTripDayInput,
  NormalizedCreateTripInput,
  NormalizedUpdateItineraryInput,
  NormalizedUpdateTripDayInput,
  NormalizedUpdateTripInput,
} from '../types/trip.types';

const destinationSelect = {
  id: true,
  name: true,
  description: true,
  address: true,
  phoneNumber: true,
  latitude: true,
  longitude: true,
  ticketPrice: true,
  openingHoursNote: true,
  visitDuration: true,
  rating: true,
  images: {
    where: { isPrimary: true },
    orderBy: { displayOrder: 'asc' },
    take: 1,
    select: { id: true, imageUrl: true, isPrimary: true },
  },
  categories: {
    select: {
      category: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.DestinationSelect;

export const itineraryDetailInclude = {
  destination: { select: destinationSelect },
} satisfies Prisma.ItineraryInclude;

export const tripDayDetailInclude = {
  itineraries: {
    orderBy: { sequenceOrder: 'asc' },
    include: itineraryDetailInclude,
  },
} satisfies Prisma.TripDayInclude;

export const tripDetailInclude = {
  tripDays: {
    orderBy: { dayNumber: 'asc' },
    include: tripDayDetailInclude,
  },
} satisfies Prisma.TripInclude;

const tripSummarySelect = {
  id: true,
  name: true,
  destinationCity: true,
  startDate: true,
  endDate: true,
  budget: true,
  numberOfPeople: true,
  description: true,
  isAiGenerated: true,
  shareToken: true,
  isPublic: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { tripDays: true } },
} satisfies Prisma.TripSelect;

const ownedTripStateSelect = {
  id: true,
  startDate: true,
  endDate: true,
  shareToken: true,
  isPublic: true,
  updatedAt: true,
  tripDays: {
    orderBy: { dayNumber: 'asc' },
    select: { id: true, dayNumber: true, date: true },
  },
} satisfies Prisma.TripSelect;

const ownedDayInclude = {
  trip: {
    select: { id: true, userId: true, startDate: true, endDate: true, updatedAt: true },
  },
  itineraries: {
    orderBy: { sequenceOrder: 'asc' },
    include: itineraryDetailInclude,
  },
} satisfies Prisma.TripDayInclude;

const ownedItineraryInclude = {
  destination: { select: destinationSelect },
  tripDay: {
    select: {
      id: true,
      tripId: true,
      trip: { select: { userId: true, updatedAt: true } },
    },
  },
} satisfies Prisma.ItineraryInclude;

const publicTripSelect = {
  name: true,
  destinationCity: true,
  startDate: true,
  endDate: true,
  budget: true,
  numberOfPeople: true,
  description: true,
  isPublic: true,
  tripDays: {
    orderBy: { dayNumber: 'asc' },
    select: {
      dayNumber: true,
      date: true,
      note: true,
      itineraries: {
        orderBy: { sequenceOrder: 'asc' },
        select: {
          sequenceOrder: true,
          startTime: true,
          endTime: true,
          estimatedCost: true,
          travelDistanceKm: true,
          travelDurationMinutes: true,
          travelMode: true,
          note: true,
          destination: { select: destinationSelect },
        },
      },
    },
  },
} satisfies Prisma.TripSelect;

export type TripSummaryRecord = Prisma.TripGetPayload<{ select: typeof tripSummarySelect }>;
export type TripDetailRecord = Prisma.TripGetPayload<{ include: typeof tripDetailInclude }>;
export type OwnedTripStateRecord = Prisma.TripGetPayload<{
  select: typeof ownedTripStateSelect;
}>;
export type TripDayDetailRecord = Prisma.TripDayGetPayload<{ include: typeof tripDayDetailInclude }>;
export type OwnedTripDayRecord = Prisma.TripDayGetPayload<{ include: typeof ownedDayInclude }>;
export type ItineraryDetailRecord = Prisma.ItineraryGetPayload<{
  include: typeof itineraryDetailInclude;
}>;
export type OwnedItineraryRecord = Prisma.ItineraryGetPayload<{
  include: typeof ownedItineraryInclude;
}>;
export type PublicTripRecord = Prisma.TripGetPayload<{ select: typeof publicTripSelect }>;
export interface CostSummaryRecord {
  id: number;
  budget: Prisma.Decimal | null;
  tripDays: Array<{
    id: number;
    dayNumber: number;
    date: Date;
    estimatedCost: Prisma.Decimal;
  }>;
}

const runSerializable = async <T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  retryableCodes: string[] = ['P2034']
): Promise<T> => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5_000,
        timeout: 30_000,
      });
    } catch (error) {
      const canRetry =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        retryableCodes.includes(error.code) &&
        attempt < maxAttempts;

      if (!canRetry) {
        throw error;
      }
    }
  }

  throw new Error('Không thể hoàn tất transaction');
};

const applyContiguousOrders = async (
  tx: Prisma.TransactionClient,
  dayId: number,
  itineraryIds: number[]
): Promise<void> => {
  if (itineraryIds.length === 0) {
    return;
  }

  await tx.$executeRaw`
    UPDATE "itineraries"
    SET "sequence_order" = -"id"
    WHERE "trip_day_id" = ${dayId}
  `;

  const orderCases = itineraryIds.map(
    (id, index) => Prisma.sql`WHEN ${id} THEN ${index + 1}`
  );

  await tx.$executeRaw(
    Prisma.sql`
      UPDATE "itineraries"
      SET "sequence_order" = CASE "id"
        ${Prisma.join(orderCases, ' ')}
        ELSE "sequence_order"
      END,
      "updated_at" = GREATEST(
        date_trunc('milliseconds', "updated_at") + INTERVAL '1 millisecond',
        date_trunc('milliseconds', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
      )
      WHERE "trip_day_id" = ${dayId}
    `
  );
};

const nextVersion = (current: Date): Date =>
  new Date(Math.max(Date.now(), current.getTime() + 1));

const claimTripVersion = async (
  tx: Prisma.TransactionClient,
  userId: number,
  tripId: number,
  expectedUpdatedAt: Date
): Promise<Date | null> => {
  // Prisma exposes DateTime as millisecond-precision JS Date, while PostgreSQL
  // TIMESTAMP may contain microseconds. Truncate only for the CAS comparison.
  const claimedAt = nextVersion(expectedUpdatedAt);
  const count = await tx.$executeRaw`
    UPDATE "trips"
    SET "updated_at" = ${claimedAt.toISOString()}::timestamp
    WHERE "id" = ${tripId}
      AND "user_id" = ${userId}
      AND date_trunc('milliseconds', "updated_at") =
          ${expectedUpdatedAt.toISOString()}::timestamp
  `;

  return count === 1 ? claimedAt : null;
};

const claimItineraryVersion = async (
  tx: Prisma.TransactionClient,
  dayId: number,
  itineraryId: number,
  expectedUpdatedAt: Date
): Promise<Date | null> => {
  const claimedAt = nextVersion(expectedUpdatedAt);
  const count = await tx.$executeRaw`
    UPDATE "itineraries"
    SET "updated_at" = ${claimedAt.toISOString()}::timestamp
    WHERE "id" = ${itineraryId}
      AND "trip_day_id" = ${dayId}
      AND date_trunc('milliseconds', "updated_at") =
          ${expectedUpdatedAt.toISOString()}::timestamp
  `;

  return count === 1 ? claimedAt : null;
};

export const tripRepository = {
  async listByUser(userId: number, skip: number, take: number) {
    const [data, total] = await prisma.$transaction([
      prisma.trip.findMany({
        where: { userId },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
        select: tripSummarySelect,
      }),
      prisma.trip.count({ where: { userId } }),
    ]);

    return { data, total };
  },

  findOwnedTrip(userId: number, tripId: number) {
    return prisma.trip.findFirst({
      where: { id: tripId, userId },
      include: tripDetailInclude,
    });
  },

  findOwnedTripState(userId: number, tripId: number) {
    return prisma.trip.findFirst({
      where: { id: tripId, userId },
      select: ownedTripStateSelect,
    });
  },

  createComplete(userId: number, input: NormalizedCreateTripInput) {
    return runSerializable(async (tx) => {
      const destinationIds = [
        ...new Set(
          input.tripDays.flatMap((day) =>
            day.itineraries.map((itinerary) => itinerary.destinationId)
          )
        ),
      ];
      const activeDestinations = await tx.destination.findMany({
        where: { id: { in: destinationIds }, isActive: true },
        select: { id: true },
      });
      const activeIds = new Set(activeDestinations.map((destination) => destination.id));
      const invalidDestinationIds = destinationIds.filter((id) => !activeIds.has(id));

      if (invalidDestinationIds.length > 0) {
        return { trip: null, invalidDestinationIds };
      }

      const trip = await tx.trip.create({
        data: {
          user: { connect: { id: userId } },
          name: input.name,
          destinationCity: input.destinationCity,
          startDate: input.startDate,
          endDate: input.endDate,
          budget: input.budget,
          numberOfPeople: input.numberOfPeople,
          description: input.description,
          isAiGenerated: input.isAiGenerated,
          aiRawData: input.aiRawData,
          tripDays:
            input.tripDays.length > 0
              ? {
                  create: input.tripDays.map((day) => ({
                    dayNumber: day.dayNumber,
                    date: day.date,
                    note: day.note,
                    itineraries:
                      day.itineraries.length > 0
                        ? {
                            create: day.itineraries.map((itinerary) => ({
                              destinationId: itinerary.destinationId,
                              sequenceOrder: itinerary.sequenceOrder,
                              startTime: itinerary.startTime,
                              endTime: itinerary.endTime,
                              estimatedCost: itinerary.estimatedCost,
                              travelDistanceKm: itinerary.travelDistanceKm,
                              travelDurationMinutes: itinerary.travelDurationMinutes,
                              travelMode: itinerary.travelMode,
                              note: itinerary.note,
                            })),
                          }
                        : undefined,
                  })),
                }
              : undefined,
        },
        include: tripDetailInclude,
      });

      return { trip, invalidDestinationIds: [] as number[] };
    });
  },

  updateTrip(
    userId: number,
    tripId: number,
    expectedUpdatedAt: Date,
    input: NormalizedUpdateTripInput
  ) {
    return prisma.$transaction(async (tx) => {
      const claimedAt = await claimTripVersion(tx, userId, tripId, expectedUpdatedAt);
      if (!claimedAt) {
        return null;
      }

      return tx.trip.update({
        where: { id: tripId, userId },
        data: { ...input, updatedAt: claimedAt },
        include: tripDetailInclude,
      });
    });
  },

  deleteTrip(userId: number, tripId: number) {
    return prisma.trip.delete({ where: { id: tripId, userId } });
  },

  listDays(userId: number, tripId: number) {
    return prisma.tripDay.findMany({
      where: { tripId, trip: { userId } },
      orderBy: { dayNumber: 'asc' },
      include: tripDayDetailInclude,
    });
  },

  findOwnedDay(userId: number, tripId: number, dayId: number) {
    return prisma.tripDay.findFirst({
      where: { id: dayId, tripId, trip: { userId } },
      include: ownedDayInclude,
    });
  },

  createDay(
    userId: number,
    tripId: number,
    expectedTripUpdatedAt: Date,
    input: NormalizedCreateTripDayInput
  ) {
    return prisma.$transaction(async (tx) => {
      const claimedAt = await claimTripVersion(tx, userId, tripId, expectedTripUpdatedAt);
      if (!claimedAt) {
        return null;
      }

      return tx.tripDay.create({
        data: {
          trip: { connect: { id: tripId } },
          dayNumber: input.dayNumber,
          date: input.date,
          note: input.note,
        },
        include: tripDayDetailInclude,
      });
    });
  },

  updateDay(
    userId: number,
    tripId: number,
    dayId: number,
    expectedTripUpdatedAt: Date,
    input: NormalizedUpdateTripDayInput
  ) {
    return prisma.$transaction(async (tx) => {
      const claimedAt = await claimTripVersion(tx, userId, tripId, expectedTripUpdatedAt);
      if (!claimedAt) {
        return null;
      }

      return tx.tripDay.update({
        where: { id: dayId, tripId },
        data: input,
        include: tripDayDetailInclude,
      });
    });
  },

  deleteDay(userId: number, tripId: number, dayId: number, expectedTripUpdatedAt: Date) {
    return prisma.$transaction(async (tx) => {
      const claimedAt = await claimTripVersion(tx, userId, tripId, expectedTripUpdatedAt);
      if (!claimedAt) {
        return false;
      }

      await tx.tripDay.delete({ where: { id: dayId, tripId } });
      return true;
    });
  },

  listItineraries(userId: number, tripId: number, dayId: number) {
    return prisma.itinerary.findMany({
      where: { tripDayId: dayId, tripDay: { tripId, trip: { userId } } },
      orderBy: { sequenceOrder: 'asc' },
      include: itineraryDetailInclude,
    });
  },

  findOwnedItinerary(userId: number, tripId: number, dayId: number, itineraryId: number) {
    return prisma.itinerary.findFirst({
      where: {
        id: itineraryId,
        tripDayId: dayId,
        tripDay: { tripId, trip: { userId } },
      },
      include: ownedItineraryInclude,
    });
  },

  createItineraryAtEnd(
    userId: number,
    tripId: number,
    dayId: number,
    input: NormalizedCreateItineraryInput
  ) {
    return runSerializable(async (tx) => {
      const day = await tx.tripDay.findFirst({
        where: { id: dayId, tripId, trip: { userId } },
        select: { id: true },
      });
      if (!day) {
        return { status: 'not_found' as const, itinerary: null };
      }

      const destination = await tx.destination.findFirst({
        where: { id: input.destinationId, isActive: true },
        select: { id: true },
      });
      if (!destination) {
        return { status: 'destination_not_found' as const, itinerary: null };
      }

      const last = await tx.itinerary.aggregate({
        where: { tripDayId: dayId },
        _count: { _all: true },
        _max: { sequenceOrder: true },
      });
      if (last._count._all >= MAX_ITINERARIES_PER_DAY) {
        return { status: 'limit_reached' as const, itinerary: null };
      }

      const itinerary = await tx.itinerary.create({
        data: {
          tripDay: { connect: { id: dayId } },
          destination: { connect: { id: input.destinationId } },
          sequenceOrder: (last._max.sequenceOrder ?? 0) + 1,
          startTime: input.startTime,
          endTime: input.endTime,
          estimatedCost: input.estimatedCost,
          travelDistanceKm: input.travelDistanceKm,
          travelDurationMinutes: input.travelDurationMinutes,
          travelMode: input.travelMode,
          note: input.note,
        },
        include: itineraryDetailInclude,
      });

      return { status: 'created' as const, itinerary };
    }, ['P2034', 'P2002']);
  },

  updateItinerary(
    userId: number,
    tripId: number,
    dayId: number,
    itineraryId: number,
    expectedUpdatedAt: Date,
    input: NormalizedUpdateItineraryInput
  ) {
    return runSerializable(async (tx) => {
      const existing = await tx.itinerary.findFirst({
        where: {
          id: itineraryId,
          tripDayId: dayId,
          tripDay: { tripId, trip: { userId } },
        },
        select: { id: true, updatedAt: true },
      });
      if (!existing) {
        return { status: 'not_found' as const, itinerary: null };
      }
      if (existing.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
        return { status: 'conflict' as const, itinerary: null };
      }

      if (input.destinationId !== undefined) {
        const destination = await tx.destination.findFirst({
          where: { id: input.destinationId, isActive: true },
          select: { id: true },
        });
        if (!destination) {
          return { status: 'destination_not_found' as const, itinerary: null };
        }
      }

      const claimedAt = await claimItineraryVersion(
        tx,
        dayId,
        itineraryId,
        expectedUpdatedAt
      );
      if (!claimedAt) {
        return { status: 'conflict' as const, itinerary: null };
      }

      const itinerary = await tx.itinerary.update({
        where: { id: itineraryId, tripDayId: dayId },
        data: { ...input, updatedAt: claimedAt },
        include: itineraryDetailInclude,
      });

      return { status: 'updated' as const, itinerary };
    });
  },

  deleteItineraryAndCompact(
    userId: number,
    tripId: number,
    dayId: number,
    itineraryId: number
  ) {
    return runSerializable(async (tx) => {
      const current = await tx.itinerary.findMany({
        where: { tripDayId: dayId, tripDay: { tripId, trip: { userId } } },
        orderBy: { sequenceOrder: 'asc' },
        select: { id: true },
      });
      if (!current.some((item) => item.id === itineraryId)) {
        return false;
      }

      await tx.itinerary.delete({ where: { id: itineraryId, tripDayId: dayId } });
      await applyContiguousOrders(
        tx,
        dayId,
        current.filter((item) => item.id !== itineraryId).map((item) => item.id)
      );
      return true;
    });
  },

  reorderItineraries(userId: number, tripId: number, dayId: number, itineraryIds: number[]) {
    return runSerializable(async (tx) => {
      const current = await tx.itinerary.findMany({
        where: { tripDayId: dayId, tripDay: { tripId, trip: { userId } } },
        select: { id: true },
      });

      const currentIds = new Set(current.map((item) => item.id));
      const hasExactSet =
        current.length === itineraryIds.length && itineraryIds.every((id) => currentIds.has(id));

      if (!hasExactSet) {
        return null;
      }

      await applyContiguousOrders(tx, dayId, itineraryIds);

      return tx.itinerary.findMany({
        where: { tripDayId: dayId },
        orderBy: { sequenceOrder: 'asc' },
        include: itineraryDetailInclude,
      });
    });
  },

  getCostSummary(userId: number, tripId: number): Promise<CostSummaryRecord | null> {
    return prisma.$transaction(
      async (tx) => {
        const trip = await tx.trip.findFirst({
          where: { id: tripId, userId },
          select: { id: true, budget: true },
        });
        if (!trip) {
          return null;
        }

        const days = await tx.tripDay.findMany({
          where: { tripId },
          orderBy: { dayNumber: 'asc' },
          select: { id: true, dayNumber: true, date: true },
        });
        const totals = await tx.itinerary.groupBy({
          by: ['tripDayId'],
          where: { tripDay: { tripId } },
          _sum: { estimatedCost: true },
        });
        const totalsByDay = new Map(
          totals.map((total) => [
            total.tripDayId,
            total._sum.estimatedCost ?? new Prisma.Decimal(0),
          ])
        );

        return {
          ...trip,
          tripDays: days.map((day) => ({
            ...day,
            estimatedCost: totalsByDay.get(day.id) ?? new Prisma.Decimal(0),
          })),
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead }
    );
  },

  enableShare(userId: number, tripId: number, shareToken: string) {
    return runSerializable(async (tx) => {
      const current = await tx.trip.findFirst({
        where: { id: tripId, userId },
        select: { id: true, shareToken: true, isPublic: true },
      });
      if (!current) {
        return null;
      }
      if (current.isPublic && current.shareToken) {
        return current;
      }

      return tx.trip.update({
        where: { id: tripId, userId },
        data: { shareToken, isPublic: true },
        select: { id: true, shareToken: true, isPublic: true },
      });
    });
  },

  disableShare(userId: number, tripId: number) {
    return prisma.trip.update({
      where: { id: tripId, userId },
      data: { shareToken: null, isPublic: false },
    });
  },

  findPublicByShareToken(shareToken: string) {
    return prisma.trip.findFirst({
      where: {
        shareToken,
        isPublic: true,
        user: { isActive: true },
      },
      select: publicTripSelect,
    });
  },
};
