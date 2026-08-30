"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripRepository = exports.tripDetailInclude = exports.tripDayDetailInclude = exports.itineraryDetailInclude = void 0;
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../config/db"));
const trip_constants_1 = require("../constants/trip.constants");
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
};
exports.itineraryDetailInclude = {
    destination: { select: destinationSelect },
};
exports.tripDayDetailInclude = {
    itineraries: {
        orderBy: { sequenceOrder: 'asc' },
        include: exports.itineraryDetailInclude,
    },
};
exports.tripDetailInclude = {
    tripDays: {
        orderBy: { dayNumber: 'asc' },
        include: exports.tripDayDetailInclude,
    },
};
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
};
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
};
const ownedDayInclude = {
    trip: {
        select: { id: true, userId: true, startDate: true, endDate: true, updatedAt: true },
    },
    itineraries: {
        orderBy: { sequenceOrder: 'asc' },
        include: exports.itineraryDetailInclude,
    },
};
const ownedItineraryInclude = {
    destination: { select: destinationSelect },
    tripDay: {
        select: {
            id: true,
            tripId: true,
            trip: { select: { userId: true, updatedAt: true } },
        },
    },
};
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
};
const runSerializable = async (operation, retryableCodes = ['P2034']) => {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await db_1.default.$transaction(operation, {
                isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
                maxWait: 5_000,
                timeout: 30_000,
            });
        }
        catch (error) {
            const canRetry = error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                retryableCodes.includes(error.code) &&
                attempt < maxAttempts;
            if (!canRetry) {
                throw error;
            }
        }
    }
    throw new Error('Không thể hoàn tất transaction');
};
const applyContiguousOrders = async (tx, dayId, itineraryIds) => {
    if (itineraryIds.length === 0) {
        return;
    }
    await tx.$executeRaw `
    UPDATE "itineraries"
    SET "sequence_order" = -"id"
    WHERE "trip_day_id" = ${dayId}
  `;
    const orderCases = itineraryIds.map((id, index) => client_1.Prisma.sql `WHEN ${id} THEN ${index + 1}`);
    await tx.$executeRaw(client_1.Prisma.sql `
      UPDATE "itineraries"
      SET "sequence_order" = CASE "id"
        ${client_1.Prisma.join(orderCases, ' ')}
        ELSE "sequence_order"
      END,
      "updated_at" = GREATEST(
        date_trunc('milliseconds', "updated_at") + INTERVAL '1 millisecond',
        date_trunc('milliseconds', CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
      )
      WHERE "trip_day_id" = ${dayId}
    `);
};
const nextVersion = (current) => new Date(Math.max(Date.now(), current.getTime() + 1));
const claimTripVersion = async (tx, userId, tripId, expectedUpdatedAt) => {
    // Prisma exposes DateTime as millisecond-precision JS Date, while PostgreSQL
    // TIMESTAMP may contain microseconds. Truncate only for the CAS comparison.
    const claimedAt = nextVersion(expectedUpdatedAt);
    const count = await tx.$executeRaw `
    UPDATE "trips"
    SET "updated_at" = ${claimedAt.toISOString()}::timestamp
    WHERE "id" = ${tripId}
      AND "user_id" = ${userId}
      AND date_trunc('milliseconds', "updated_at") =
          ${expectedUpdatedAt.toISOString()}::timestamp
  `;
    return count === 1 ? claimedAt : null;
};
const claimItineraryVersion = async (tx, dayId, itineraryId, expectedUpdatedAt) => {
    const claimedAt = nextVersion(expectedUpdatedAt);
    const count = await tx.$executeRaw `
    UPDATE "itineraries"
    SET "updated_at" = ${claimedAt.toISOString()}::timestamp
    WHERE "id" = ${itineraryId}
      AND "trip_day_id" = ${dayId}
      AND date_trunc('milliseconds', "updated_at") =
          ${expectedUpdatedAt.toISOString()}::timestamp
  `;
    return count === 1 ? claimedAt : null;
};
exports.tripRepository = {
    async listByUser(userId, skip, take) {
        const [data, total] = await db_1.default.$transaction([
            db_1.default.trip.findMany({
                where: { userId },
                orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
                skip,
                take,
                select: tripSummarySelect,
            }),
            db_1.default.trip.count({ where: { userId } }),
        ]);
        return { data, total };
    },
    findOwnedTrip(userId, tripId) {
        return db_1.default.trip.findFirst({
            where: { id: tripId, userId },
            include: exports.tripDetailInclude,
        });
    },
    findOwnedTripState(userId, tripId) {
        return db_1.default.trip.findFirst({
            where: { id: tripId, userId },
            select: ownedTripStateSelect,
        });
    },
    createComplete(userId, input) {
        return runSerializable(async (tx) => {
            const destinationIds = [
                ...new Set(input.tripDays.flatMap((day) => day.itineraries.map((itinerary) => itinerary.destinationId))),
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
                    tripDays: input.tripDays.length > 0
                        ? {
                            create: input.tripDays.map((day) => ({
                                dayNumber: day.dayNumber,
                                date: day.date,
                                note: day.note,
                                itineraries: day.itineraries.length > 0
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
                include: exports.tripDetailInclude,
            });
            return { trip, invalidDestinationIds: [] };
        });
    },
    updateTrip(userId, tripId, expectedUpdatedAt, input) {
        return db_1.default.$transaction(async (tx) => {
            const claimedAt = await claimTripVersion(tx, userId, tripId, expectedUpdatedAt);
            if (!claimedAt) {
                return null;
            }
            return tx.trip.update({
                where: { id: tripId, userId },
                data: { ...input, updatedAt: claimedAt },
                include: exports.tripDetailInclude,
            });
        });
    },
    deleteTrip(userId, tripId) {
        return db_1.default.trip.delete({ where: { id: tripId, userId } });
    },
    listDays(userId, tripId) {
        return db_1.default.tripDay.findMany({
            where: { tripId, trip: { userId } },
            orderBy: { dayNumber: 'asc' },
            include: exports.tripDayDetailInclude,
        });
    },
    findOwnedDay(userId, tripId, dayId) {
        return db_1.default.tripDay.findFirst({
            where: { id: dayId, tripId, trip: { userId } },
            include: ownedDayInclude,
        });
    },
    createDay(userId, tripId, expectedTripUpdatedAt, input) {
        return db_1.default.$transaction(async (tx) => {
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
                include: exports.tripDayDetailInclude,
            });
        });
    },
    updateDay(userId, tripId, dayId, expectedTripUpdatedAt, input) {
        return db_1.default.$transaction(async (tx) => {
            const claimedAt = await claimTripVersion(tx, userId, tripId, expectedTripUpdatedAt);
            if (!claimedAt) {
                return null;
            }
            return tx.tripDay.update({
                where: { id: dayId, tripId },
                data: input,
                include: exports.tripDayDetailInclude,
            });
        });
    },
    deleteDay(userId, tripId, dayId, expectedTripUpdatedAt) {
        return db_1.default.$transaction(async (tx) => {
            const claimedAt = await claimTripVersion(tx, userId, tripId, expectedTripUpdatedAt);
            if (!claimedAt) {
                return false;
            }
            await tx.tripDay.delete({ where: { id: dayId, tripId } });
            return true;
        });
    },
    listItineraries(userId, tripId, dayId) {
        return db_1.default.itinerary.findMany({
            where: { tripDayId: dayId, tripDay: { tripId, trip: { userId } } },
            orderBy: { sequenceOrder: 'asc' },
            include: exports.itineraryDetailInclude,
        });
    },
    findOwnedItinerary(userId, tripId, dayId, itineraryId) {
        return db_1.default.itinerary.findFirst({
            where: {
                id: itineraryId,
                tripDayId: dayId,
                tripDay: { tripId, trip: { userId } },
            },
            include: ownedItineraryInclude,
        });
    },
    createItineraryAtEnd(userId, tripId, dayId, input) {
        return runSerializable(async (tx) => {
            const day = await tx.tripDay.findFirst({
                where: { id: dayId, tripId, trip: { userId } },
                select: { id: true },
            });
            if (!day) {
                return { status: 'not_found', itinerary: null };
            }
            const destination = await tx.destination.findFirst({
                where: { id: input.destinationId, isActive: true },
                select: { id: true },
            });
            if (!destination) {
                return { status: 'destination_not_found', itinerary: null };
            }
            const last = await tx.itinerary.aggregate({
                where: { tripDayId: dayId },
                _count: { _all: true },
                _max: { sequenceOrder: true },
            });
            if (last._count._all >= trip_constants_1.MAX_ITINERARIES_PER_DAY) {
                return { status: 'limit_reached', itinerary: null };
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
                include: exports.itineraryDetailInclude,
            });
            return { status: 'created', itinerary };
        }, ['P2034', 'P2002']);
    },
    updateItinerary(userId, tripId, dayId, itineraryId, expectedUpdatedAt, input) {
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
                return { status: 'not_found', itinerary: null };
            }
            if (existing.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
                return { status: 'conflict', itinerary: null };
            }
            if (input.destinationId !== undefined) {
                const destination = await tx.destination.findFirst({
                    where: { id: input.destinationId, isActive: true },
                    select: { id: true },
                });
                if (!destination) {
                    return { status: 'destination_not_found', itinerary: null };
                }
            }
            const claimedAt = await claimItineraryVersion(tx, dayId, itineraryId, expectedUpdatedAt);
            if (!claimedAt) {
                return { status: 'conflict', itinerary: null };
            }
            const itinerary = await tx.itinerary.update({
                where: { id: itineraryId, tripDayId: dayId },
                data: { ...input, updatedAt: claimedAt },
                include: exports.itineraryDetailInclude,
            });
            return { status: 'updated', itinerary };
        });
    },
    deleteItineraryAndCompact(userId, tripId, dayId, itineraryId) {
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
            await applyContiguousOrders(tx, dayId, current.filter((item) => item.id !== itineraryId).map((item) => item.id));
            return true;
        });
    },
    reorderItineraries(userId, tripId, dayId, itineraryIds) {
        return runSerializable(async (tx) => {
            const current = await tx.itinerary.findMany({
                where: { tripDayId: dayId, tripDay: { tripId, trip: { userId } } },
                select: { id: true },
            });
            const currentIds = new Set(current.map((item) => item.id));
            const hasExactSet = current.length === itineraryIds.length && itineraryIds.every((id) => currentIds.has(id));
            if (!hasExactSet) {
                return null;
            }
            await applyContiguousOrders(tx, dayId, itineraryIds);
            return tx.itinerary.findMany({
                where: { tripDayId: dayId },
                orderBy: { sequenceOrder: 'asc' },
                include: exports.itineraryDetailInclude,
            });
        });
    },
    getCostSummary(userId, tripId) {
        return db_1.default.$transaction(async (tx) => {
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
            const totalsByDay = new Map(totals.map((total) => [
                total.tripDayId,
                total._sum.estimatedCost ?? new client_1.Prisma.Decimal(0),
            ]));
            return {
                ...trip,
                tripDays: days.map((day) => ({
                    ...day,
                    estimatedCost: totalsByDay.get(day.id) ?? new client_1.Prisma.Decimal(0),
                })),
            };
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.RepeatableRead });
    },
    enableShare(userId, tripId, shareToken) {
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
    disableShare(userId, tripId) {
        return db_1.default.trip.update({
            where: { id: tripId, userId },
            data: { shareToken: null, isPublic: false },
        });
    },
    findPublicByShareToken(shareToken) {
        return db_1.default.trip.findFirst({
            where: {
                shareToken,
                isPublic: true,
                user: { isActive: true },
            },
            select: publicTripSelect,
        });
    },
};
//# sourceMappingURL=trip.repository.js.map