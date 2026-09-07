import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { HTTP_STATUS } from '../constants';
import { MAX_ITINERARIES_PER_DAY } from '../constants/trip.constants';
import {
  CostSummaryRecord,
  ItineraryDetailRecord,
  OwnedItineraryRecord,
  OwnedTripStateRecord,
  OwnedTripDayRecord,
  PublicTripRecord,
  TripDayDetailRecord,
  TripDetailRecord,
  TripSummaryRecord,
  tripRepository,
} from '../repositories/trip.repository';
import {
  CreateItineraryInput,
  CreateTripDayInput,
  CreateTripInput,
  CreateTripMetadata,
  NormalizedCreateItineraryInput,
  NormalizedCreateTripInput,
  NormalizedUpdateItineraryInput,
  NormalizedUpdateTripDayInput,
  NormalizedUpdateTripInput,
  ReorderItinerariesInput,
  TripListQuery,
  UpdateItineraryInput,
  UpdateTripDayInput,
  UpdateTripInput,
} from '../types/trip.types';
import { AppError } from '../utils/app-error';
import { calculatePagination } from '../utils/pagination.utils';

const MILLISECONDS_PER_DAY = 86_400_000;
const NOT_FOUND_MESSAGE = 'Không tìm thấy chuyến đi hoặc bạn không có quyền truy cập';

const parseDateOnly = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

const formatDateOnly = (value: Date): string => value.toISOString().slice(0, 10);

const parseTime = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const time = value.length === 5 ? `${value}:00` : value;
  return new Date(`1970-01-01T${time}.000Z`);
};

const formatTime = (value: Date | null): string | null =>
  value ? value.toISOString().slice(11, 19) : null;

const decimalString = (value: Prisma.Decimal): string => value.toFixed(2);

const nullableDecimalString = (value: Prisma.Decimal | null): string | null =>
  value === null ? null : decimalString(value);

const sumDecimals = (values: Prisma.Decimal[]): Prisma.Decimal =>
  values.reduce((total, value) => total.plus(value), new Prisma.Decimal(0));

const getDayNumber = (tripStartDate: Date, date: Date): number =>
  Math.round((date.getTime() - tripStartDate.getTime()) / MILLISECONDS_PER_DAY) + 1;

const assertValidTripRange = (startDate: Date, endDate: Date): void => {
  if (endDate.getTime() < startDate.getTime()) {
    throw new AppError(
      'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu',
      HTTP_STATUS.UNPROCESSABLE
    );
  }
};

const validateAndGetDayNumber = (
  date: Date,
  startDate: Date,
  endDate: Date,
  providedDayNumber?: number
): number => {
  if (date.getTime() < startDate.getTime() || date.getTime() > endDate.getTime()) {
    throw new AppError('Ngày lịch trình phải nằm trong khoảng ngày của chuyến đi', HTTP_STATUS.UNPROCESSABLE);
  }

  const expectedDayNumber = getDayNumber(startDate, date);

  if (providedDayNumber !== undefined && providedDayNumber !== expectedDayNumber) {
    throw new AppError(
      `dayNumber phải là ${expectedDayNumber} tương ứng với ngày đã chọn`,
      HTTP_STATUS.UNPROCESSABLE
    );
  }

  return expectedDayNumber;
};

const assertValidTimeRange = (startTime: Date | null, endTime: Date | null): void => {
  if (startTime && endTime && endTime.getTime() <= startTime.getTime()) {
    throw new AppError(
      'Thời gian kết thúc phải sau thời gian bắt đầu',
      HTTP_STATUS.UNPROCESSABLE
    );
  }
};

const serializeDestination = (destination: ItineraryDetailRecord['destination']) => ({
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

const serializeItinerary = (
  itinerary: ItineraryDetailRecord | OwnedItineraryRecord
) => ({
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

const serializeTripDay = (day: TripDayDetailRecord | OwnedTripDayRecord) => {
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

const serializeTripSummary = (trip: TripSummaryRecord) => ({
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

const serializeTripDetail = (trip: TripDetailRecord) => {
  const tripDays = trip.tripDays.map(serializeTripDay);
  const total = sumDecimals(
    trip.tripDays.flatMap((day) => day.itineraries.map((itinerary) => itinerary.estimatedCost))
  );

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

const serializePublicTrip = (trip: PublicTripRecord) => {
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
  const total = sumDecimals(
    trip.tripDays.flatMap((day) => day.itineraries.map((itinerary) => itinerary.estimatedCost))
  );

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

const requireOwnedTrip = async (userId: number, tripId: number): Promise<TripDetailRecord> => {
  const trip = await tripRepository.findOwnedTrip(userId, tripId);

  if (!trip) {
    throw new AppError(NOT_FOUND_MESSAGE, HTTP_STATUS.NOT_FOUND);
  }

  return trip;
};

const requireOwnedTripState = async (
  userId: number,
  tripId: number
): Promise<OwnedTripStateRecord> => {
  const trip = await tripRepository.findOwnedTripState(userId, tripId);

  if (!trip) {
    throw new AppError(NOT_FOUND_MESSAGE, HTTP_STATUS.NOT_FOUND);
  }

  return trip;
};

const requireOwnedDay = async (
  userId: number,
  tripId: number,
  dayId: number
): Promise<OwnedTripDayRecord> => {
  const day = await tripRepository.findOwnedDay(userId, tripId, dayId);

  if (!day) {
    throw new AppError('Không tìm thấy ngày trong chuyến đi', HTTP_STATUS.NOT_FOUND);
  }

  return day;
};

const requireOwnedItinerary = async (
  userId: number,
  tripId: number,
  dayId: number,
  itineraryId: number
): Promise<OwnedItineraryRecord> => {
  const itinerary = await tripRepository.findOwnedItinerary(userId, tripId, dayId, itineraryId);

  if (!itinerary) {
    throw new AppError('Không tìm thấy điểm trong lịch trình', HTTP_STATUS.NOT_FOUND);
  }

  return itinerary;
};

const normalizeCreateItinerary = (
  input: CreateItineraryInput
): NormalizedCreateItineraryInput => {
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

const normalizeCompleteTrip = (
  input: CreateTripInput,
  metadata: CreateTripMetadata
): NormalizedCreateTripInput => {
  const startDate = parseDateOnly(input.startDate);
  const endDate = parseDateOnly(input.endDate);
  assertValidTripRange(startDate, endDate);

  const seenDayNumbers = new Set<number>();
  const tripDays = (input.tripDays ?? []).map((day) => {
    if ((day.itineraries?.length ?? 0) > MAX_ITINERARIES_PER_DAY) {
      throw new AppError(
        `Mỗi ngày chỉ được có tối đa ${MAX_ITINERARIES_PER_DAY} điểm`,
        HTTP_STATUS.UNPROCESSABLE
      );
    }

    const date = parseDateOnly(day.date);
    const dayNumber = validateAndGetDayNumber(date, startDate, endDate, day.dayNumber);

    if (seenDayNumbers.has(dayNumber)) {
      throw new AppError(`Ngày thứ ${dayNumber} bị khai báo trùng lặp`, HTTP_STATUS.CONFLICT);
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

const buildTripUpdate = (input: UpdateTripInput): NormalizedUpdateTripInput => {
  const update: NormalizedUpdateTripInput = {};

  if (input.name !== undefined) update.name = input.name;
  if (input.destinationCity !== undefined) update.destinationCity = input.destinationCity;
  if (input.startDate !== undefined) update.startDate = parseDateOnly(input.startDate);
  if (input.endDate !== undefined) update.endDate = parseDateOnly(input.endDate);
  if (input.budget !== undefined) update.budget = input.budget;
  if (input.numberOfPeople !== undefined) update.numberOfPeople = input.numberOfPeople;
  if (input.description !== undefined) update.description = input.description;

  return update;
};

const buildItineraryUpdate = (
  input: UpdateItineraryInput,
  current: OwnedItineraryRecord
): NormalizedUpdateItineraryInput => {
  const update: NormalizedUpdateItineraryInput = {};
  const startTime = input.startTime === undefined ? current.startTime : parseTime(input.startTime);
  const endTime = input.endTime === undefined ? current.endTime : parseTime(input.endTime);
  assertValidTimeRange(startTime, endTime);

  if (input.destinationId !== undefined) update.destinationId = input.destinationId;
  if (input.startTime !== undefined) update.startTime = startTime;
  if (input.endTime !== undefined) update.endTime = endTime;
  if (input.estimatedCost !== undefined) update.estimatedCost = input.estimatedCost;
  if (input.travelDistanceKm !== undefined) update.travelDistanceKm = input.travelDistanceKm;
  if (input.travelDurationMinutes !== undefined) {
    update.travelDurationMinutes = input.travelDurationMinutes;
  }
  if (input.travelMode !== undefined) update.travelMode = input.travelMode;
  if (input.note !== undefined) update.note = input.note;

  return update;
};

const serializeCostSummary = (trip: CostSummaryRecord) => {
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

export const tripService = {
  async getTrips(userId: number, query: TripListQuery) {
    const requestedPagination = calculatePagination(query, 0);
    const result = await tripRepository.listByUser(
      userId,
      requestedPagination.skip,
      requestedPagination.limit
    );
    const pagination = calculatePagination(query, result.total);

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

  async createTrip(userId: number, input: CreateTripInput, metadata: CreateTripMetadata = {}) {
    const normalized = normalizeCompleteTrip(input, metadata);
    const result = await tripRepository.createComplete(userId, normalized);
    if (!result.trip) {
      throw new AppError(
        `Không tìm thấy địa điểm đang hoạt động: ${result.invalidDestinationIds.join(', ')}`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    return serializeTripDetail(result.trip);
  },

  async getTrip(userId: number, tripId: number) {
    return serializeTripDetail(await requireOwnedTrip(userId, tripId));
  },

  async updateTrip(userId: number, tripId: number, input: UpdateTripInput) {
    const current = await requireOwnedTripState(userId, tripId);
    const update = buildTripUpdate(input);
    const startDate = update.startDate ?? current.startDate;
    const endDate = update.endDate ?? current.endDate;
    assertValidTripRange(startDate, endDate);

    if (
      update.startDate &&
      update.startDate.getTime() !== current.startDate.getTime() &&
      current.tripDays.length > 0
    ) {
      throw new AppError(
        'Không thể đổi ngày bắt đầu khi chuyến đi đã có lịch trình; hãy xóa các ngày trước',
        HTTP_STATUS.CONFLICT
      );
    }

    for (const day of current.tripDays) {
      validateAndGetDayNumber(day.date, startDate, endDate, day.dayNumber);
    }

    const trip = await tripRepository.updateTrip(userId, tripId, current.updatedAt, update);
    if (!trip) {
      throw new AppError(
        'Chuyến đi vừa được thay đổi, vui lòng tải lại và thử lại',
        HTTP_STATUS.CONFLICT
      );
    }
    return serializeTripDetail(trip);
  },

  async deleteTrip(userId: number, tripId: number) {
    await requireOwnedTripState(userId, tripId);
    await tripRepository.deleteTrip(userId, tripId);
  },

  async getTripDays(userId: number, tripId: number) {
    await requireOwnedTripState(userId, tripId);
    const days = await tripRepository.listDays(userId, tripId);
    return days.map(serializeTripDay);
  },

  async createTripDay(userId: number, tripId: number, input: CreateTripDayInput) {
    const trip = await requireOwnedTripState(userId, tripId);
    const date = parseDateOnly(input.date);
    const dayNumber = validateAndGetDayNumber(date, trip.startDate, trip.endDate, input.dayNumber);

    if (trip.tripDays.some((day) => day.dayNumber === dayNumber)) {
      throw new AppError(`Ngày thứ ${dayNumber} đã tồn tại`, HTTP_STATUS.CONFLICT);
    }

    const day = await tripRepository.createDay(
      userId,
      tripId,
      trip.updatedAt,
      { dayNumber, date, note: input.note ?? null }
    );
    if (!day) {
      throw new AppError(
        'Chuyến đi vừa được thay đổi, vui lòng tải lại và thử lại',
        HTTP_STATUS.CONFLICT
      );
    }
    return serializeTripDay(day);
  },

  async getTripDay(userId: number, tripId: number, dayId: number) {
    return serializeTripDay(await requireOwnedDay(userId, tripId, dayId));
  },

  async updateTripDay(
    userId: number,
    tripId: number,
    dayId: number,
    input: UpdateTripDayInput
  ) {
    const current = await requireOwnedDay(userId, tripId, dayId);
    const date = input.date === undefined ? current.date : parseDateOnly(input.date);
    const dayNumber = validateAndGetDayNumber(
      date,
      current.trip.startDate,
      current.trip.endDate
    );

    if (date.getTime() !== current.date.getTime() || dayNumber !== current.dayNumber) {
      const days = await tripRepository.listDays(userId, tripId);
      if (days.some((day) => day.id !== dayId && day.dayNumber === dayNumber)) {
        throw new AppError(`Ngày thứ ${dayNumber} đã tồn tại`, HTTP_STATUS.CONFLICT);
      }
    }

    const update: NormalizedUpdateTripDayInput = {};
    if (input.date !== undefined) {
      update.date = date;
      update.dayNumber = dayNumber;
    }
    if (input.note !== undefined) update.note = input.note;

    const updated = await tripRepository.updateDay(
      userId,
      tripId,
      dayId,
      current.trip.updatedAt,
      update
    );
    if (!updated) {
      throw new AppError(
        'Chuyến đi vừa được thay đổi, vui lòng tải lại và thử lại',
        HTTP_STATUS.CONFLICT
      );
    }
    return serializeTripDay(updated);
  },

  async deleteTripDay(userId: number, tripId: number, dayId: number) {
    const day = await requireOwnedDay(userId, tripId, dayId);
    const deleted = await tripRepository.deleteDay(userId, tripId, dayId, day.trip.updatedAt);
    if (!deleted) {
      throw new AppError(
        'Chuyến đi vừa được thay đổi, vui lòng tải lại và thử lại',
        HTTP_STATUS.CONFLICT
      );
    }
  },

  async getItineraries(userId: number, tripId: number, dayId: number) {
    await requireOwnedDay(userId, tripId, dayId);
    const itineraries = await tripRepository.listItineraries(userId, tripId, dayId);
    return itineraries.map(serializeItinerary);
  },

  async createItinerary(
    userId: number,
    tripId: number,
    dayId: number,
    input: CreateItineraryInput
  ) {
    await requireOwnedDay(userId, tripId, dayId);
    const result = await tripRepository.createItineraryAtEnd(
      userId,
      tripId,
      dayId,
      normalizeCreateItinerary(input)
    );
    if (result.status === 'not_found') {
      throw new AppError('Không tìm thấy ngày trong chuyến đi', HTTP_STATUS.NOT_FOUND);
    }
    if (result.status === 'destination_not_found') {
      throw new AppError('Không tìm thấy địa điểm đang hoạt động', HTTP_STATUS.NOT_FOUND);
    }
    if (result.status === 'limit_reached') {
      throw new AppError('Ngày này đã đạt số điểm tối đa', HTTP_STATUS.CONFLICT);
    }

    return serializeItinerary(result.itinerary);
  },

  async getItinerary(userId: number, tripId: number, dayId: number, itineraryId: number) {
    return serializeItinerary(
      await requireOwnedItinerary(userId, tripId, dayId, itineraryId)
    );
  },

  async updateItinerary(
    userId: number,
    tripId: number,
    dayId: number,
    itineraryId: number,
    input: UpdateItineraryInput
  ) {
    const current = await requireOwnedItinerary(userId, tripId, dayId, itineraryId);
    const result = await tripRepository.updateItinerary(
      userId,
      tripId,
      dayId,
      itineraryId,
      current.updatedAt,
      buildItineraryUpdate(input, current)
    );
    if (result.status === 'not_found') {
      throw new AppError('Không tìm thấy điểm trong lịch trình', HTTP_STATUS.NOT_FOUND);
    }
    if (result.status === 'destination_not_found') {
      throw new AppError('Không tìm thấy địa điểm đang hoạt động', HTTP_STATUS.NOT_FOUND);
    }
    if (result.status === 'conflict') {
      throw new AppError(
        'Điểm trong lịch trình vừa được thay đổi, vui lòng tải lại và thử lại',
        HTTP_STATUS.CONFLICT
      );
    }

    return serializeItinerary(result.itinerary);
  },

  async deleteItinerary(userId: number, tripId: number, dayId: number, itineraryId: number) {
    await requireOwnedItinerary(userId, tripId, dayId, itineraryId);
    const deleted = await tripRepository.deleteItineraryAndCompact(
      userId,
      tripId,
      dayId,
      itineraryId
    );
    if (!deleted) {
      throw new AppError('Không tìm thấy điểm trong lịch trình', HTTP_STATUS.NOT_FOUND);
    }
  },

  async reorderItineraries(
    userId: number,
    tripId: number,
    dayId: number,
    input: ReorderItinerariesInput
  ) {
    await requireOwnedDay(userId, tripId, dayId);
    const existing = await tripRepository.listItineraries(userId, tripId, dayId);
    const requestedIds = new Set(input.itineraryIds);
    const hasExactSet =
      existing.length === input.itineraryIds.length &&
      existing.every((itinerary) => requestedIds.has(itinerary.id));

    if (!hasExactSet) {
      throw new AppError(
        'Danh sách itineraryIds phải chứa đúng toàn bộ điểm của ngày',
        HTTP_STATUS.UNPROCESSABLE
      );
    }

    const reordered = await tripRepository.reorderItineraries(
      userId,
      tripId,
      dayId,
      input.itineraryIds
    );
    if (!reordered) {
      throw new AppError(
        'Lịch trình vừa thay đổi, vui lòng tải lại và thử lại',
        HTTP_STATUS.CONFLICT
      );
    }

    return reordered.map(serializeItinerary);
  },

  async getCostSummary(userId: number, tripId: number) {
    const trip = await tripRepository.getCostSummary(userId, tripId);
    if (!trip) {
      throw new AppError(NOT_FOUND_MESSAGE, HTTP_STATUS.NOT_FOUND);
    }

    return serializeCostSummary(trip);
  },

  async enableTripShare(userId: number, tripId: number) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const shareToken = randomBytes(32).toString('hex');
      try {
        const shared = await tripRepository.enableShare(userId, tripId, shareToken);
        if (!shared) {
          throw new AppError(NOT_FOUND_MESSAGE, HTTP_STATUS.NOT_FOUND);
        }
        return {
          tripId: shared.id,
          shareToken: shared.shareToken,
          isPublic: shared.isPublic,
        };
      } catch (error) {
        const tokenCollision =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!tokenCollision) throw error;
      }
    }

    throw new AppError('Không thể tạo liên kết chia sẻ, vui lòng thử lại', HTTP_STATUS.CONFLICT);
  },

  async disableTripShare(userId: number, tripId: number) {
    await requireOwnedTripState(userId, tripId);
    await tripRepository.disableShare(userId, tripId);
  },

  async getSharedTrip(shareToken: string) {
    const trip = await tripRepository.findPublicByShareToken(shareToken);
    if (!trip) {
      throw new AppError('Liên kết chia sẻ không tồn tại hoặc đã bị thu hồi', HTTP_STATUS.NOT_FOUND);
    }

    return serializePublicTrip(trip);
  },
};
