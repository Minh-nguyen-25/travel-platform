"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripService = void 0;
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const constants_1 = require("../constants");
const trip_constants_1 = require("../constants/trip.constants");
const trip_repository_1 = require("../repositories/trip.repository");
const app_error_1 = require("../utils/app-error");
const pagination_utils_1 = require("../utils/pagination.utils");
const MILLISECONDS_PER_DAY = 86_400_000;
const NOT_FOUND_MESSAGE = 'Không tìm thấy chuyến đi hoặc bạn không có quyền truy cập';
const parseDateOnly = (value) => new Date(`${value}T00:00:00.000Z`);
const formatDateOnly = (value) => value.toISOString().slice(0, 10);
const parseTime = (value) => {
    if (!value) {
        return null;
    }
    const time = value.length === 5 ? `${value}:00` : value;
    return new Date(`1970-01-01T${time}.000Z`);
};
const formatTime = (value) => value ? value.toISOString().slice(11, 19) : null;
const decimalString = (value) => value.toFixed(2);
const nullableDecimalString = (value) => value === null ? null : decimalString(value);
const sumDecimals = (values) => values.reduce((total, value) => total.plus(value), new client_1.Prisma.Decimal(0));
const getDayNumber = (tripStartDate, date) => Math.round((date.getTime() - tripStartDate.getTime()) / MILLISECONDS_PER_DAY) + 1;
const assertValidTripRange = (startDate, endDate) => {
    if (endDate.getTime() < startDate.getTime()) {
        throw new app_error_1.AppError('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu', constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
};
const validateAndGetDayNumber = (date, startDate, endDate, providedDayNumber) => {
    if (date.getTime() < startDate.getTime() || date.getTime() > endDate.getTime()) {
        throw new app_error_1.AppError('Ngày lịch trình phải nằm trong khoảng ngày của chuyến đi', constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
    const expectedDayNumber = getDayNumber(startDate, date);
    if (providedDayNumber !== undefined && providedDayNumber !== expectedDayNumber) {
        throw new app_error_1.AppError(`dayNumber phải là ${expectedDayNumber} tương ứng với ngày đã chọn`, constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
    return expectedDayNumber;
};
const assertValidTimeRange = (startTime, endTime) => {
    if (startTime && endTime && endTime.getTime() <= startTime.getTime()) {
        throw new app_error_1.AppError('Thời gian kết thúc phải sau thời gian bắt đầu', constants_1.HTTP_STATUS.UNPROCESSABLE);
    }
};
const serializeDestination = (destination) => ({
    id: destination.id,
    name: destination.name,
    description: destination.description,
    address: destination.address,
    phoneNumber: destination.phoneNumber,
    latitude: destination.latitude.toFixed(7),
    longitude: destination.longitude.toFixed(7),
    ticketPrice: destination.ticketPrice.toFixed(2),
    openingHoursNote: destination.openingHoursNote,
    visitDuration: destination.visitDuration,
    rating: destination.rating.toFixed(1),
    images: destination.images,
    categories: destination.categories.map(({ category }) => category),
});
const serializeItinerary = (itinerary) => ({
    id: itinerary.id,
    tripDayId: itinerary.tripDayId,
    destinationId: itinerary.destinationId,
    sequenceOrder: itinerary.sequenceOrder,
    startTime: formatTime(itinerary.startTime),
    endTime: formatTime(itinerary.endTime),
    estimatedCost: decimalString(itinerary.estimatedCost),
    travelDistanceKm: nullableDecimalString(itinerary.travelDistanceKm),
    travelDurationMinutes: itinerary.travelDurationMinutes,
    travelMode: itinerary.travelMode,
    note: itinerary.note,
    createdAt: itinerary.createdAt.toISOString(),
    updatedAt: itinerary.updatedAt.toISOString(),
    destination: serializeDestination(itinerary.destination),
});
const serializeTripDay = (day) => {
    const total = sumDecimals(day.itineraries.map((itinerary) => itinerary.estimatedCost));
    return {
        id: day.id,
        tripId: day.tripId,
        dayNumber: day.dayNumber,
        date: formatDateOnly(day.date),
        note: day.note,
        createdAt: day.createdAt.toISOString(),
        updatedAt: day.updatedAt.toISOString(),
        totalEstimatedCost: decimalString(total),
        itineraries: day.itineraries.map(serializeItinerary),
    };
};
const serializeTripSummary = (trip) => ({
    id: trip.id,
    name: trip.name,
    destinationCity: trip.destinationCity,
    startDate: formatDateOnly(trip.startDate),
    endDate: formatDateOnly(trip.endDate),
    budget: nullableDecimalString(trip.budget),
    numberOfPeople: trip.numberOfPeople,
    description: trip.description,
    isAiGenerated: trip.isAiGenerated,
    shareToken: trip.shareToken,
    isPublic: trip.isPublic,
    dayCount: trip._count.tripDays,
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
});
const serializeTripDetail = (trip) => {
    const tripDays = trip.tripDays.map(serializeTripDay);
    const total = sumDecimals(trip.tripDays.flatMap((day) => day.itineraries.map((itinerary) => itinerary.estimatedCost)));
    return {
        id: trip.id,
        name: trip.name,
        destinationCity: trip.destinationCity,
        startDate: formatDateOnly(trip.startDate),
        endDate: formatDateOnly(trip.endDate),
        budget: nullableDecimalString(trip.budget),
        numberOfPeople: trip.numberOfPeople,
        description: trip.description,
        isAiGenerated: trip.isAiGenerated,
        shareToken: trip.shareToken,
        isPublic: trip.isPublic,
        totalEstimatedCost: decimalString(total),
        createdAt: trip.createdAt.toISOString(),
        updatedAt: trip.updatedAt.toISOString(),
        tripDays,
    };
};
const serializePublicTrip = (trip) => {
    const tripDays = trip.tripDays.map((day) => {
        const total = sumDecimals(day.itineraries.map((itinerary) => itinerary.estimatedCost));
        return {
            dayNumber: day.dayNumber,
            date: formatDateOnly(day.date),
            note: day.note,
            totalEstimatedCost: decimalString(total),
            itineraries: day.itineraries.map((itinerary) => ({
                sequenceOrder: itinerary.sequenceOrder,
                startTime: formatTime(itinerary.startTime),
                endTime: formatTime(itinerary.endTime),
                estimatedCost: decimalString(itinerary.estimatedCost),
                travelDistanceKm: nullableDecimalString(itinerary.travelDistanceKm),
                travelDurationMinutes: itinerary.travelDurationMinutes,
                travelMode: itinerary.travelMode,
                note: itinerary.note,
                destination: serializeDestination(itinerary.destination),
            })),
        };
    });
    const total = sumDecimals(trip.tripDays.flatMap((day) => day.itineraries.map((itinerary) => itinerary.estimatedCost)));
    return {
        name: trip.name,
        destinationCity: trip.destinationCity,
        startDate: formatDateOnly(trip.startDate),
        endDate: formatDateOnly(trip.endDate),
        budget: nullableDecimalString(trip.budget),
        numberOfPeople: trip.numberOfPeople,
        description: trip.description,
        isPublic: trip.isPublic,
        totalEstimatedCost: decimalString(total),
        tripDays,
    };
};
const requireOwnedTrip = async (userId, tripId) => {
    const trip = await trip_repository_1.tripRepository.findOwnedTrip(userId, tripId);
    if (!trip) {
        throw new app_error_1.AppError(NOT_FOUND_MESSAGE, constants_1.HTTP_STATUS.NOT_FOUND);
    }
    return trip;
};
const requireOwnedTripState = async (userId, tripId) => {
    const trip = await trip_repository_1.tripRepository.findOwnedTripState(userId, tripId);
    if (!trip) {
        throw new app_error_1.AppError(NOT_FOUND_MESSAGE, constants_1.HTTP_STATUS.NOT_FOUND);
    }
    return trip;
};
const requireOwnedDay = async (userId, tripId, dayId) => {
    const day = await trip_repository_1.tripRepository.findOwnedDay(userId, tripId, dayId);
    if (!day) {
        throw new app_error_1.AppError('Không tìm thấy ngày trong chuyến đi', constants_1.HTTP_STATUS.NOT_FOUND);
    }
    return day;
};
const requireOwnedItinerary = async (userId, tripId, dayId, itineraryId) => {
    const itinerary = await trip_repository_1.tripRepository.findOwnedItinerary(userId, tripId, dayId, itineraryId);
    if (!itinerary) {
        throw new app_error_1.AppError('Không tìm thấy điểm trong lịch trình', constants_1.HTTP_STATUS.NOT_FOUND);
    }
    return itinerary;
};
const normalizeCreateItinerary = (input) => {
    const startTime = parseTime(input.startTime);
    const endTime = parseTime(input.endTime);
    assertValidTimeRange(startTime, endTime);
    return {
        destinationId: input.destinationId,
        startTime,
        endTime,
        estimatedCost: input.estimatedCost ?? 0,
        travelDistanceKm: input.travelDistanceKm ?? null,
        travelDurationMinutes: input.travelDurationMinutes ?? null,
        travelMode: input.travelMode ?? null,
        note: input.note ?? null,
    };
};
const normalizeCompleteTrip = (input, metadata) => {
    const startDate = parseDateOnly(input.startDate);
    const endDate = parseDateOnly(input.endDate);
    assertValidTripRange(startDate, endDate);
    const seenDayNumbers = new Set();
    const tripDays = (input.tripDays ?? []).map((day) => {
        if ((day.itineraries?.length ?? 0) > trip_constants_1.MAX_ITINERARIES_PER_DAY) {
            throw new app_error_1.AppError(`Mỗi ngày chỉ được có tối đa ${trip_constants_1.MAX_ITINERARIES_PER_DAY} điểm`, constants_1.HTTP_STATUS.UNPROCESSABLE);
        }
        const date = parseDateOnly(day.date);
        const dayNumber = validateAndGetDayNumber(date, startDate, endDate, day.dayNumber);
        if (seenDayNumbers.has(dayNumber)) {
            throw new app_error_1.AppError(`Ngày thứ ${dayNumber} bị khai báo trùng lặp`, constants_1.HTTP_STATUS.CONFLICT);
        }
        seenDayNumbers.add(dayNumber);
        return {
            dayNumber,
            date,
            note: day.note ?? null,
            itineraries: (day.itineraries ?? []).map((itinerary, index) => ({
                ...normalizeCreateItinerary(itinerary),
                sequenceOrder: index + 1,
            })),
        };
    });
    return {
        name: input.name,
        destinationCity: input.destinationCity,
        startDate,
        endDate,
        budget: input.budget ?? null,
        numberOfPeople: input.numberOfPeople ?? 1,
        description: input.description ?? null,
        isAiGenerated: metadata.isAiGenerated ?? false,
        aiRawData: metadata.aiRawData ?? null,
        tripDays,
    };
};
const buildTripUpdate = (input) => {
    const update = {};
    if (input.name !== undefined)
        update.name = input.name;
    if (input.destinationCity !== undefined)
        update.destinationCity = input.destinationCity;
    if (input.startDate !== undefined)
        update.startDate = parseDateOnly(input.startDate);
    if (input.endDate !== undefined)
        update.endDate = parseDateOnly(input.endDate);
    if (input.budget !== undefined)
        update.budget = input.budget;
    if (input.numberOfPeople !== undefined)
        update.numberOfPeople = input.numberOfPeople;
    if (input.description !== undefined)
        update.description = input.description;
    return update;
};
const buildItineraryUpdate = (input, current) => {
    const update = {};
    const startTime = input.startTime === undefined ? current.startTime : parseTime(input.startTime);
    const endTime = input.endTime === undefined ? current.endTime : parseTime(input.endTime);
    assertValidTimeRange(startTime, endTime);
    if (input.destinationId !== undefined)
        update.destinationId = input.destinationId;
    if (input.startTime !== undefined)
        update.startTime = startTime;
    if (input.endTime !== undefined)
        update.endTime = endTime;
    if (input.estimatedCost !== undefined)
        update.estimatedCost = input.estimatedCost;
    if (input.travelDistanceKm !== undefined)
        update.travelDistanceKm = input.travelDistanceKm;
    if (input.travelDurationMinutes !== undefined) {
        update.travelDurationMinutes = input.travelDurationMinutes;
    }
    if (input.travelMode !== undefined)
        update.travelMode = input.travelMode;
    if (input.note !== undefined)
        update.note = input.note;
    return update;
};
const serializeCostSummary = (trip) => {
    const dayTotals = trip.tripDays.map((day) => {
        return {
            tripDayId: day.id,
            dayNumber: day.dayNumber,
            date: formatDateOnly(day.date),
            estimatedCost: decimalString(day.estimatedCost),
        };
    });
    const totalEstimatedCost = sumDecimals(trip.tripDays.map((day) => day.estimatedCost));
    return {
        tripId: trip.id,
        budget: nullableDecimalString(trip.budget),
        totalEstimatedCost: decimalString(totalEstimatedCost),
        remainingBudget: trip.budget ? decimalString(trip.budget.minus(totalEstimatedCost)) : null,
        dayTotals,
    };
};
exports.tripService = {
    async getTrips(userId, query) {
        const requestedPagination = (0, pagination_utils_1.calculatePagination)(query, 0);
        const result = await trip_repository_1.tripRepository.listByUser(userId, requestedPagination.skip, requestedPagination.limit);
        const pagination = (0, pagination_utils_1.calculatePagination)(query, result.total);
        return {
            data: result.data.map(serializeTripSummary),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                totalPages: pagination.totalPages,
            },
        };
    },
    async createTrip(userId, input, metadata = {}) {
        const normalized = normalizeCompleteTrip(input, metadata);
        const result = await trip_repository_1.tripRepository.createComplete(userId, normalized);
        if (!result.trip) {
            throw new app_error_1.AppError(`Không tìm thấy địa điểm đang hoạt động: ${result.invalidDestinationIds.join(', ')}`, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        return serializeTripDetail(result.trip);
    },
    async getTrip(userId, tripId) {
        return serializeTripDetail(await requireOwnedTrip(userId, tripId));
    },
    async updateTrip(userId, tripId, input) {
        const current = await requireOwnedTripState(userId, tripId);
        const update = buildTripUpdate(input);
        const startDate = update.startDate ?? current.startDate;
        const endDate = update.endDate ?? current.endDate;
        assertValidTripRange(startDate, endDate);
        if (update.startDate &&
            update.startDate.getTime() !== current.startDate.getTime() &&
            current.tripDays.length > 0) {
            throw new app_error_1.AppError('Không thể đổi ngày bắt đầu khi chuyến đi đã có lịch trình; hãy xóa các ngày trước', constants_1.HTTP_STATUS.CONFLICT);
        }
        for (const day of current.tripDays) {
            validateAndGetDayNumber(day.date, startDate, endDate, day.dayNumber);
        }
        const trip = await trip_repository_1.tripRepository.updateTrip(userId, tripId, current.updatedAt, update);
        if (!trip) {
            throw new app_error_1.AppError('Chuyến đi vừa được thay đổi, vui lòng tải lại và thử lại', constants_1.HTTP_STATUS.CONFLICT);
        }
        return serializeTripDetail(trip);
    },
    async deleteTrip(userId, tripId) {
        await requireOwnedTripState(userId, tripId);
        await trip_repository_1.tripRepository.deleteTrip(userId, tripId);
    },
    async getTripDays(userId, tripId) {
        await requireOwnedTripState(userId, tripId);
        const days = await trip_repository_1.tripRepository.listDays(userId, tripId);
        return days.map(serializeTripDay);
    },
    async createTripDay(userId, tripId, input) {
        const trip = await requireOwnedTripState(userId, tripId);
        const date = parseDateOnly(input.date);
        const dayNumber = validateAndGetDayNumber(date, trip.startDate, trip.endDate, input.dayNumber);
        if (trip.tripDays.some((day) => day.dayNumber === dayNumber)) {
            throw new app_error_1.AppError(`Ngày thứ ${dayNumber} đã tồn tại`, constants_1.HTTP_STATUS.CONFLICT);
        }
        const day = await trip_repository_1.tripRepository.createDay(userId, tripId, trip.updatedAt, { dayNumber, date, note: input.note ?? null });
        if (!day) {
            throw new app_error_1.AppError('Chuyến đi vừa được thay đổi, vui lòng tải lại và thử lại', constants_1.HTTP_STATUS.CONFLICT);
        }
        return serializeTripDay(day);
    },
    async getTripDay(userId, tripId, dayId) {
        return serializeTripDay(await requireOwnedDay(userId, tripId, dayId));
    },
    async updateTripDay(userId, tripId, dayId, input) {
        const current = await requireOwnedDay(userId, tripId, dayId);
        const date = input.date === undefined ? current.date : parseDateOnly(input.date);
        const dayNumber = validateAndGetDayNumber(date, current.trip.startDate, current.trip.endDate);
        if (date.getTime() !== current.date.getTime() || dayNumber !== current.dayNumber) {
            const days = await trip_repository_1.tripRepository.listDays(userId, tripId);
            if (days.some((day) => day.id !== dayId && day.dayNumber === dayNumber)) {
                throw new app_error_1.AppError(`Ngày thứ ${dayNumber} đã tồn tại`, constants_1.HTTP_STATUS.CONFLICT);
            }
        }
        const update = {};
        if (input.date !== undefined) {
            update.date = date;
            update.dayNumber = dayNumber;
        }
        if (input.note !== undefined)
            update.note = input.note;
        const updated = await trip_repository_1.tripRepository.updateDay(userId, tripId, dayId, current.trip.updatedAt, update);
        if (!updated) {
            throw new app_error_1.AppError('Chuyến đi vừa được thay đổi, vui lòng tải lại và thử lại', constants_1.HTTP_STATUS.CONFLICT);
        }
        return serializeTripDay(updated);
    },
    async deleteTripDay(userId, tripId, dayId) {
        const day = await requireOwnedDay(userId, tripId, dayId);
        const deleted = await trip_repository_1.tripRepository.deleteDay(userId, tripId, dayId, day.trip.updatedAt);
        if (!deleted) {
            throw new app_error_1.AppError('Chuyến đi vừa được thay đổi, vui lòng tải lại và thử lại', constants_1.HTTP_STATUS.CONFLICT);
        }
    },
    async getItineraries(userId, tripId, dayId) {
        await requireOwnedDay(userId, tripId, dayId);
        const itineraries = await trip_repository_1.tripRepository.listItineraries(userId, tripId, dayId);
        return itineraries.map(serializeItinerary);
    },
    async createItinerary(userId, tripId, dayId, input) {
        await requireOwnedDay(userId, tripId, dayId);
        const result = await trip_repository_1.tripRepository.createItineraryAtEnd(userId, tripId, dayId, normalizeCreateItinerary(input));
        if (result.status === 'not_found') {
            throw new app_error_1.AppError('Không tìm thấy ngày trong chuyến đi', constants_1.HTTP_STATUS.NOT_FOUND);
        }
        if (result.status === 'destination_not_found') {
            throw new app_error_1.AppError('Không tìm thấy địa điểm đang hoạt động', constants_1.HTTP_STATUS.NOT_FOUND);
        }
        if (result.status === 'limit_reached') {
            throw new app_error_1.AppError('Ngày này đã đạt số điểm tối đa', constants_1.HTTP_STATUS.CONFLICT);
        }
        return serializeItinerary(result.itinerary);
    },
    async getItinerary(userId, tripId, dayId, itineraryId) {
        return serializeItinerary(await requireOwnedItinerary(userId, tripId, dayId, itineraryId));
    },
    async updateItinerary(userId, tripId, dayId, itineraryId, input) {
        const current = await requireOwnedItinerary(userId, tripId, dayId, itineraryId);
        const result = await trip_repository_1.tripRepository.updateItinerary(userId, tripId, dayId, itineraryId, current.updatedAt, buildItineraryUpdate(input, current));
        if (result.status === 'not_found') {
            throw new app_error_1.AppError('Không tìm thấy điểm trong lịch trình', constants_1.HTTP_STATUS.NOT_FOUND);
        }
        if (result.status === 'destination_not_found') {
            throw new app_error_1.AppError('Không tìm thấy địa điểm đang hoạt động', constants_1.HTTP_STATUS.NOT_FOUND);
        }
        if (result.status === 'conflict') {
            throw new app_error_1.AppError('Điểm trong lịch trình vừa được thay đổi, vui lòng tải lại và thử lại', constants_1.HTTP_STATUS.CONFLICT);
        }
        return serializeItinerary(result.itinerary);
    },
    async deleteItinerary(userId, tripId, dayId, itineraryId) {
        await requireOwnedItinerary(userId, tripId, dayId, itineraryId);
        const deleted = await trip_repository_1.tripRepository.deleteItineraryAndCompact(userId, tripId, dayId, itineraryId);
        if (!deleted) {
            throw new app_error_1.AppError('Không tìm thấy điểm trong lịch trình', constants_1.HTTP_STATUS.NOT_FOUND);
        }
    },
    async reorderItineraries(userId, tripId, dayId, input) {
        await requireOwnedDay(userId, tripId, dayId);
        const existing = await trip_repository_1.tripRepository.listItineraries(userId, tripId, dayId);
        const requestedIds = new Set(input.itineraryIds);
        const hasExactSet = existing.length === input.itineraryIds.length &&
            existing.every((itinerary) => requestedIds.has(itinerary.id));
        if (!hasExactSet) {
            throw new app_error_1.AppError('Danh sách itineraryIds phải chứa đúng toàn bộ điểm của ngày', constants_1.HTTP_STATUS.UNPROCESSABLE);
        }
        const reordered = await trip_repository_1.tripRepository.reorderItineraries(userId, tripId, dayId, input.itineraryIds);
        if (!reordered) {
            throw new app_error_1.AppError('Lịch trình vừa thay đổi, vui lòng tải lại và thử lại', constants_1.HTTP_STATUS.CONFLICT);
        }
        return reordered.map(serializeItinerary);
    },
    async getCostSummary(userId, tripId) {
        const trip = await trip_repository_1.tripRepository.getCostSummary(userId, tripId);
        if (!trip) {
            throw new app_error_1.AppError(NOT_FOUND_MESSAGE, constants_1.HTTP_STATUS.NOT_FOUND);
        }
        return serializeCostSummary(trip);
    },
    async enableTripShare(userId, tripId) {
        for (let attempt = 0; attempt < 3; attempt += 1) {
            const shareToken = (0, crypto_1.randomBytes)(32).toString('hex');
            try {
                const shared = await trip_repository_1.tripRepository.enableShare(userId, tripId, shareToken);
                if (!shared) {
                    throw new app_error_1.AppError(NOT_FOUND_MESSAGE, constants_1.HTTP_STATUS.NOT_FOUND);
                }
                return {
                    tripId: shared.id,
                    shareToken: shared.shareToken,
                    isPublic: shared.isPublic,
                };
            }
            catch (error) {
                const tokenCollision = error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
                if (!tokenCollision)
                    throw error;
            }
        }
        throw new app_error_1.AppError('Không thể tạo liên kết chia sẻ, vui lòng thử lại', constants_1.HTTP_STATUS.CONFLICT);
    },
    async disableTripShare(userId, tripId) {
        await requireOwnedTripState(userId, tripId);
        await trip_repository_1.tripRepository.disableShare(userId, tripId);
    },
    async getSharedTrip(shareToken) {
        const trip = await trip_repository_1.tripRepository.findPublicByShareToken(shareToken);
        if (!trip) {
            throw new app_error_1.AppError('Liên kết chia sẻ không tồn tại hoặc đã bị thu hồi', constants_1.HTTP_STATUS.NOT_FOUND);
        }
        return serializePublicTrip(trip);
    },
};
//# sourceMappingURL=trip.service.js.map