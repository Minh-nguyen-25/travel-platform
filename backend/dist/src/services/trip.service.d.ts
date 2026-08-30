import { CreateItineraryInput, CreateTripDayInput, CreateTripInput, CreateTripMetadata, ReorderItinerariesInput, TripListQuery, UpdateItineraryInput, UpdateTripDayInput, UpdateTripInput } from '../types/trip.types';
export declare const tripService: {
    getTrips(userId: number, query: TripListQuery): Promise<{
        data: {
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
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createTrip(userId: number, input: CreateTripInput, metadata?: CreateTripMetadata): Promise<{
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
        totalEstimatedCost: string;
        createdAt: string;
        updatedAt: string;
        tripDays: {
            id: number;
            tripId: number;
            dayNumber: number;
            date: string;
            note: string | null;
            createdAt: string;
            updatedAt: string;
            totalEstimatedCost: string;
            itineraries: {
                id: number;
                tripDayId: number;
                destinationId: number;
                sequenceOrder: number;
                startTime: string | null;
                endTime: string | null;
                estimatedCost: string;
                travelDistanceKm: string | null;
                travelDurationMinutes: number | null;
                travelMode: string | null;
                note: string | null;
                createdAt: string;
                updatedAt: string;
                destination: {
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
                    images: {
                        id: number;
                        isPrimary: boolean;
                        imageUrl: string;
                    }[];
                    categories: {
                        id: number;
                        name: string;
                    }[];
                };
            }[];
        }[];
    }>;
    getTrip(userId: number, tripId: number): Promise<{
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
        totalEstimatedCost: string;
        createdAt: string;
        updatedAt: string;
        tripDays: {
            id: number;
            tripId: number;
            dayNumber: number;
            date: string;
            note: string | null;
            createdAt: string;
            updatedAt: string;
            totalEstimatedCost: string;
            itineraries: {
                id: number;
                tripDayId: number;
                destinationId: number;
                sequenceOrder: number;
                startTime: string | null;
                endTime: string | null;
                estimatedCost: string;
                travelDistanceKm: string | null;
                travelDurationMinutes: number | null;
                travelMode: string | null;
                note: string | null;
                createdAt: string;
                updatedAt: string;
                destination: {
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
                    images: {
                        id: number;
                        isPrimary: boolean;
                        imageUrl: string;
                    }[];
                    categories: {
                        id: number;
                        name: string;
                    }[];
                };
            }[];
        }[];
    }>;
    updateTrip(userId: number, tripId: number, input: UpdateTripInput): Promise<{
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
        totalEstimatedCost: string;
        createdAt: string;
        updatedAt: string;
        tripDays: {
            id: number;
            tripId: number;
            dayNumber: number;
            date: string;
            note: string | null;
            createdAt: string;
            updatedAt: string;
            totalEstimatedCost: string;
            itineraries: {
                id: number;
                tripDayId: number;
                destinationId: number;
                sequenceOrder: number;
                startTime: string | null;
                endTime: string | null;
                estimatedCost: string;
                travelDistanceKm: string | null;
                travelDurationMinutes: number | null;
                travelMode: string | null;
                note: string | null;
                createdAt: string;
                updatedAt: string;
                destination: {
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
                    images: {
                        id: number;
                        isPrimary: boolean;
                        imageUrl: string;
                    }[];
                    categories: {
                        id: number;
                        name: string;
                    }[];
                };
            }[];
        }[];
    }>;
    deleteTrip(userId: number, tripId: number): Promise<void>;
    getTripDays(userId: number, tripId: number): Promise<{
        id: number;
        tripId: number;
        dayNumber: number;
        date: string;
        note: string | null;
        createdAt: string;
        updatedAt: string;
        totalEstimatedCost: string;
        itineraries: {
            id: number;
            tripDayId: number;
            destinationId: number;
            sequenceOrder: number;
            startTime: string | null;
            endTime: string | null;
            estimatedCost: string;
            travelDistanceKm: string | null;
            travelDurationMinutes: number | null;
            travelMode: string | null;
            note: string | null;
            createdAt: string;
            updatedAt: string;
            destination: {
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
                images: {
                    id: number;
                    isPrimary: boolean;
                    imageUrl: string;
                }[];
                categories: {
                    id: number;
                    name: string;
                }[];
            };
        }[];
    }[]>;
    createTripDay(userId: number, tripId: number, input: CreateTripDayInput): Promise<{
        id: number;
        tripId: number;
        dayNumber: number;
        date: string;
        note: string | null;
        createdAt: string;
        updatedAt: string;
        totalEstimatedCost: string;
        itineraries: {
            id: number;
            tripDayId: number;
            destinationId: number;
            sequenceOrder: number;
            startTime: string | null;
            endTime: string | null;
            estimatedCost: string;
            travelDistanceKm: string | null;
            travelDurationMinutes: number | null;
            travelMode: string | null;
            note: string | null;
            createdAt: string;
            updatedAt: string;
            destination: {
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
                images: {
                    id: number;
                    isPrimary: boolean;
                    imageUrl: string;
                }[];
                categories: {
                    id: number;
                    name: string;
                }[];
            };
        }[];
    }>;
    getTripDay(userId: number, tripId: number, dayId: number): Promise<{
        id: number;
        tripId: number;
        dayNumber: number;
        date: string;
        note: string | null;
        createdAt: string;
        updatedAt: string;
        totalEstimatedCost: string;
        itineraries: {
            id: number;
            tripDayId: number;
            destinationId: number;
            sequenceOrder: number;
            startTime: string | null;
            endTime: string | null;
            estimatedCost: string;
            travelDistanceKm: string | null;
            travelDurationMinutes: number | null;
            travelMode: string | null;
            note: string | null;
            createdAt: string;
            updatedAt: string;
            destination: {
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
                images: {
                    id: number;
                    isPrimary: boolean;
                    imageUrl: string;
                }[];
                categories: {
                    id: number;
                    name: string;
                }[];
            };
        }[];
    }>;
    updateTripDay(userId: number, tripId: number, dayId: number, input: UpdateTripDayInput): Promise<{
        id: number;
        tripId: number;
        dayNumber: number;
        date: string;
        note: string | null;
        createdAt: string;
        updatedAt: string;
        totalEstimatedCost: string;
        itineraries: {
            id: number;
            tripDayId: number;
            destinationId: number;
            sequenceOrder: number;
            startTime: string | null;
            endTime: string | null;
            estimatedCost: string;
            travelDistanceKm: string | null;
            travelDurationMinutes: number | null;
            travelMode: string | null;
            note: string | null;
            createdAt: string;
            updatedAt: string;
            destination: {
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
                images: {
                    id: number;
                    isPrimary: boolean;
                    imageUrl: string;
                }[];
                categories: {
                    id: number;
                    name: string;
                }[];
            };
        }[];
    }>;
    deleteTripDay(userId: number, tripId: number, dayId: number): Promise<void>;
    getItineraries(userId: number, tripId: number, dayId: number): Promise<{
        id: number;
        tripDayId: number;
        destinationId: number;
        sequenceOrder: number;
        startTime: string | null;
        endTime: string | null;
        estimatedCost: string;
        travelDistanceKm: string | null;
        travelDurationMinutes: number | null;
        travelMode: string | null;
        note: string | null;
        createdAt: string;
        updatedAt: string;
        destination: {
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
            images: {
                id: number;
                isPrimary: boolean;
                imageUrl: string;
            }[];
            categories: {
                id: number;
                name: string;
            }[];
        };
    }[]>;
    createItinerary(userId: number, tripId: number, dayId: number, input: CreateItineraryInput): Promise<{
        id: number;
        tripDayId: number;
        destinationId: number;
        sequenceOrder: number;
        startTime: string | null;
        endTime: string | null;
        estimatedCost: string;
        travelDistanceKm: string | null;
        travelDurationMinutes: number | null;
        travelMode: string | null;
        note: string | null;
        createdAt: string;
        updatedAt: string;
        destination: {
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
            images: {
                id: number;
                isPrimary: boolean;
                imageUrl: string;
            }[];
            categories: {
                id: number;
                name: string;
            }[];
        };
    }>;
    getItinerary(userId: number, tripId: number, dayId: number, itineraryId: number): Promise<{
        id: number;
        tripDayId: number;
        destinationId: number;
        sequenceOrder: number;
        startTime: string | null;
        endTime: string | null;
        estimatedCost: string;
        travelDistanceKm: string | null;
        travelDurationMinutes: number | null;
        travelMode: string | null;
        note: string | null;
        createdAt: string;
        updatedAt: string;
        destination: {
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
            images: {
                id: number;
                isPrimary: boolean;
                imageUrl: string;
            }[];
            categories: {
                id: number;
                name: string;
            }[];
        };
    }>;
    updateItinerary(userId: number, tripId: number, dayId: number, itineraryId: number, input: UpdateItineraryInput): Promise<{
        id: number;
        tripDayId: number;
        destinationId: number;
        sequenceOrder: number;
        startTime: string | null;
        endTime: string | null;
        estimatedCost: string;
        travelDistanceKm: string | null;
        travelDurationMinutes: number | null;
        travelMode: string | null;
        note: string | null;
        createdAt: string;
        updatedAt: string;
        destination: {
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
            images: {
                id: number;
                isPrimary: boolean;
                imageUrl: string;
            }[];
            categories: {
                id: number;
                name: string;
            }[];
        };
    }>;
    deleteItinerary(userId: number, tripId: number, dayId: number, itineraryId: number): Promise<void>;
    reorderItineraries(userId: number, tripId: number, dayId: number, input: ReorderItinerariesInput): Promise<{
        id: number;
        tripDayId: number;
        destinationId: number;
        sequenceOrder: number;
        startTime: string | null;
        endTime: string | null;
        estimatedCost: string;
        travelDistanceKm: string | null;
        travelDurationMinutes: number | null;
        travelMode: string | null;
        note: string | null;
        createdAt: string;
        updatedAt: string;
        destination: {
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
            images: {
                id: number;
                isPrimary: boolean;
                imageUrl: string;
            }[];
            categories: {
                id: number;
                name: string;
            }[];
        };
    }[]>;
    getCostSummary(userId: number, tripId: number): Promise<{
        tripId: number;
        budget: string | null;
        totalEstimatedCost: string;
        remainingBudget: string | null;
        dayTotals: {
            tripDayId: number;
            dayNumber: number;
            date: string;
            estimatedCost: string;
        }[];
    }>;
    enableTripShare(userId: number, tripId: number): Promise<{
        tripId: number;
        shareToken: string | null;
        isPublic: boolean;
    }>;
    disableTripShare(userId: number, tripId: number): Promise<void>;
    getSharedTrip(shareToken: string): Promise<{
        name: string;
        destinationCity: string;
        startDate: string;
        endDate: string;
        budget: string | null;
        numberOfPeople: number;
        description: string | null;
        isPublic: boolean;
        totalEstimatedCost: string;
        tripDays: {
            dayNumber: number;
            date: string;
            note: string | null;
            totalEstimatedCost: string;
            itineraries: {
                sequenceOrder: number;
                startTime: string | null;
                endTime: string | null;
                estimatedCost: string;
                travelDistanceKm: string | null;
                travelDurationMinutes: number | null;
                travelMode: string | null;
                note: string | null;
                destination: {
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
                    images: {
                        id: number;
                        isPrimary: boolean;
                        imageUrl: string;
                    }[];
                    categories: {
                        id: number;
                        name: string;
                    }[];
                };
            }[];
        }[];
    }>;
};
//# sourceMappingURL=trip.service.d.ts.map