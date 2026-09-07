export type TravelMode = 'WALKING' | 'DRIVING' | 'TRANSIT' | 'CYCLING';

export interface DestinationImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface DestinationCategory {
  id: number;
  name: string;
}

export interface Destination {
  id: number;
  name: string;
  description: string | null;
  address: string;
  phoneNumber: string | null;
  latitude: string;
  longitude: string;
  ticketPrice: string;
  openingHoursNote: string | null;
  visitDuration: number | null;
  rating: string;
  images: DestinationImage[];
  categories: DestinationCategory[];
}

export interface Itinerary {
  id: number;
  tripDayId: number;
  destinationId: number;
  sequenceOrder: number;
  startTime: string | null;
  endTime: string | null;
  estimatedCost: string;
  travelDistanceKm: string | null;
  travelDurationMinutes: number | null;
  travelMode: TravelMode | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  destination: Destination;
}

export interface TripDay {
  id: number;
  tripId: number;
  dayNumber: number;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  totalEstimatedCost: string;
  itineraries: Itinerary[];
}

export interface TripSummary {
  id: number;
  name: string;
  destinationCity: string;
  startDate: string;
  endDate: string;
  budget: string | null;
  numberOfPeople: number;
  description: string | null;
  isAiGenerated: boolean;
  shareToken: string | null;
  isPublic: boolean;
  dayCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TripDetail extends Omit<TripSummary, 'dayCount'> {
  totalEstimatedCost: string;
  tripDays: TripDay[];
}

export interface PublicItinerary {
  sequenceOrder: number;
  startTime: string | null;
  endTime: string | null;
  estimatedCost: string;
  travelDistanceKm: string | null;
  travelDurationMinutes: number | null;
  travelMode: TravelMode | null;
  note: string | null;
  destination: Destination;
}

export interface PublicTripDay {
  dayNumber: number;
  date: string;
  note: string | null;
  totalEstimatedCost: string;
  itineraries: PublicItinerary[];
}

export interface PublicTrip {
  name: string;
  destinationCity: string;
  startDate: string;
  endDate: string;
  budget: string | null;
  numberOfPeople: number;
  description: string | null;
  isPublic: boolean;
  totalEstimatedCost: string;
  tripDays: PublicTripDay[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTrips {
  data: TripSummary[];
  pagination: Pagination;
}

export interface DestinationListResult {
  data: Destination[];
  pagination: Pagination;
}

export interface CreateItineraryPayload {
  destinationId: number;
  startTime?: string | null;
  endTime?: string | null;
  estimatedCost?: number;
  travelDistanceKm?: number | null;
  travelDurationMinutes?: number | null;
  travelMode?: TravelMode | null;
  note?: string | null;
}

export type UpdateItineraryPayload = Partial<CreateItineraryPayload>;

export interface CreateTripDayPayload {
  date: string;
  dayNumber?: number;
  note?: string | null;
}

export interface CreateCompleteTripDayPayload extends CreateTripDayPayload {
  itineraries?: CreateItineraryPayload[];
}

export interface CreateTripPayload {
  name: string;
  destinationCity: string;
  startDate: string;
  endDate: string;
  budget?: number | null;
  numberOfPeople?: number;
  description?: string | null;
  tripDays?: CreateCompleteTripDayPayload[];
}

export type UpdateTripPayload = Partial<Omit<CreateTripPayload, 'tripDays'>>;

export interface ShareTripResult {
  tripId: number;
  shareToken: string;
  isPublic: boolean;
}

export interface CostSummary {
  tripId: number;
  budget: string | null;
  totalEstimatedCost: string;
  remainingBudget: string | null;
  dayTotals: Array<{
    tripDayId: number;
    dayNumber: number;
    date: string;
    estimatedCost: string;
  }>;
}

export type TripStatus = 'upcoming' | 'ongoing' | 'completed';
