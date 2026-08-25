import axiosClient from '@/api/axiosClient';
import type {
  CostSummary,
  CreateItineraryPayload,
  CreateTripDayPayload,
  CreateTripPayload,
  Destination,
  DestinationCategory,
  DestinationImage,
  DestinationListResult,
  Itinerary,
  PaginatedTrips,
  Pagination,
  PublicTrip,
  ShareTripResult,
  TripDay,
  TripDetail,
  TripSummary,
  UpdateItineraryPayload,
  UpdateTripPayload,
} from '@/types/trip.types';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  pagination: Pagination;
}

interface ListParams {
  page?: number;
  limit?: number;
}

interface DestinationSearchParams extends ListParams {
  search?: string;
  categoryId?: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeImage = (value: unknown, index: number): DestinationImage | null => {
  const image = asRecord(value);
  if (!image) return null;
  const imageUrl = asString(image.imageUrl ?? image.url);
  if (!imageUrl) return null;
  return {
    id: asNumber(image.id, index + 1),
    imageUrl,
    isPrimary: Boolean(image.isPrimary ?? index === 0),
  };
};

const normalizeCategory = (value: unknown, index: number): DestinationCategory | null => {
  const wrapper = asRecord(value);
  const category = asRecord(wrapper?.category) ?? wrapper;
  if (!category) return null;
  const name = asString(category.name);
  if (!name) return null;
  return { id: asNumber(category.id, index + 1), name };
};

const normalizeDestination = (value: unknown): Destination | null => {
  const destination = asRecord(value);
  if (!destination) return null;
  const id = asNumber(destination.id);
  const name = asString(destination.name);
  if (!id || !name) return null;
  const rawImages = Array.isArray(destination.images) ? destination.images : [];
  const rawCategories = Array.isArray(destination.categories) ? destination.categories : [];

  return {
    id,
    name,
    description: destination.description == null ? null : asString(destination.description),
    address: asString(destination.address, 'Chưa cập nhật địa chỉ'),
    phoneNumber: destination.phoneNumber == null ? null : asString(destination.phoneNumber),
    latitude: asString(destination.latitude, '0'),
    longitude: asString(destination.longitude, '0'),
    ticketPrice: asString(destination.ticketPrice, '0'),
    openingHoursNote: destination.openingHoursNote == null ? null : asString(destination.openingHoursNote),
    visitDuration: destination.visitDuration == null ? null : asNumber(destination.visitDuration),
    rating: asString(destination.rating, '0'),
    images: rawImages
      .map(normalizeImage)
      .filter((image): image is DestinationImage => image !== null),
    categories: rawCategories
      .map(normalizeCategory)
      .filter((category): category is DestinationCategory => category !== null),
  };
};

const getNestedArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  if (!record) return [];
  for (const key of ['items', 'destinations', 'results']) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
};

const normalizePagination = (
  body: Record<string, unknown> | null,
  payload: Record<string, unknown> | null,
  itemCount: number,
  params: DestinationSearchParams,
): Pagination => {
  const source = asRecord(body?.pagination) ?? asRecord(payload?.pagination);
  const page = asNumber(source?.page, params.page ?? 1);
  const limit = asNumber(source?.limit, params.limit ?? Math.max(itemCount, 1));
  const total = asNumber(source?.total, itemCount);
  return {
    page,
    limit,
    total,
    totalPages: asNumber(source?.totalPages, Math.max(1, Math.ceil(total / Math.max(limit, 1)))),
  };
};

export const tripService = {
  async getTrips(params: ListParams = {}): Promise<PaginatedTrips> {
    const response = await axiosClient.get<PaginatedEnvelope<TripSummary>>('/trips', { params });
    if (!Array.isArray(response.data?.data)) {
      throw new Error('Phản hồi danh sách chuyến đi từ API không đúng định dạng.');
    }
    return { data: response.data.data, pagination: response.data.pagination };
  },

  async createTrip(payload: CreateTripPayload): Promise<TripDetail> {
    const response = await axiosClient.post<ApiEnvelope<TripDetail>>('/trips', payload);
    return response.data.data;
  },

  async getTrip(tripId: number): Promise<TripDetail> {
    const response = await axiosClient.get<ApiEnvelope<TripDetail>>(`/trips/${tripId}`);
    return response.data.data;
  },

  async updateTrip(tripId: number, payload: UpdateTripPayload): Promise<TripDetail> {
    const response = await axiosClient.patch<ApiEnvelope<TripDetail>>(`/trips/${tripId}`, payload);
    return response.data.data;
  },

  async deleteTrip(tripId: number): Promise<void> {
    await axiosClient.delete(`/trips/${tripId}`);
  },

  async createTripDay(tripId: number, payload: CreateTripDayPayload): Promise<TripDay> {
    const response = await axiosClient.post<ApiEnvelope<TripDay>>(`/trips/${tripId}/days`, payload);
    return response.data.data;
  },

  async createItinerary(
    tripId: number,
    dayId: number,
    payload: CreateItineraryPayload,
  ): Promise<Itinerary> {
    const response = await axiosClient.post<ApiEnvelope<Itinerary>>(
      `/trips/${tripId}/days/${dayId}/itineraries`,
      payload,
    );
    return response.data.data;
  },

  async updateItinerary(
    tripId: number,
    dayId: number,
    itineraryId: number,
    payload: UpdateItineraryPayload,
  ): Promise<Itinerary> {
    const response = await axiosClient.patch<ApiEnvelope<Itinerary>>(
      `/trips/${tripId}/days/${dayId}/itineraries/${itineraryId}`,
      payload,
    );
    return response.data.data;
  },

  async deleteItinerary(tripId: number, dayId: number, itineraryId: number): Promise<void> {
    await axiosClient.delete(`/trips/${tripId}/days/${dayId}/itineraries/${itineraryId}`);
  },

  async reorderItineraries(tripId: number, dayId: number, itineraryIds: number[]): Promise<Itinerary[]> {
    const response = await axiosClient.put<ApiEnvelope<Itinerary[]>>(
      `/trips/${tripId}/days/${dayId}/itineraries/order`,
      { itineraryIds },
    );
    return response.data.data;
  },

  async getCostSummary(tripId: number): Promise<CostSummary> {
    const response = await axiosClient.get<ApiEnvelope<CostSummary>>(`/trips/${tripId}/cost-summary`);
    return response.data.data;
  },

  async enableShare(tripId: number): Promise<ShareTripResult> {
    const response = await axiosClient.post<ApiEnvelope<ShareTripResult>>(`/trips/${tripId}/share`);
    return response.data.data;
  },

  async disableShare(tripId: number): Promise<void> {
    await axiosClient.delete(`/trips/${tripId}/share`);
  },

  async getSharedTrip(shareToken: string): Promise<PublicTrip> {
    const response = await axiosClient.get<ApiEnvelope<PublicTrip>>(`/trips/shared/${shareToken}`);
    return response.data.data;
  },

  async searchDestinations(params: DestinationSearchParams = {}): Promise<DestinationListResult> {
    const response = await axiosClient.get<unknown>('/destinations', { params });
    const body = asRecord(response.data);
    const payload = body && 'data' in body ? body.data : response.data;
    const destinations = getNestedArray(payload)
      .map(normalizeDestination)
      .filter((destination): destination is Destination => destination !== null);

    return {
      data: destinations,
      pagination: normalizePagination(body, asRecord(payload), destinations.length, params),
    };
  },
};
