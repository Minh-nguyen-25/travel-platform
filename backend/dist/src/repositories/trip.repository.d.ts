import { Prisma } from '@prisma/client';
import { NormalizedCreateItineraryInput, NormalizedCreateTripDayInput, NormalizedCreateTripInput, NormalizedUpdateItineraryInput, NormalizedUpdateTripDayInput, NormalizedUpdateTripInput } from '../types/trip.types';
export declare const itineraryDetailInclude: {
    destination: {
        select: {
            id: true;
            name: true;
            description: true;
            address: true;
            phoneNumber: true;
            latitude: true;
            longitude: true;
            ticketPrice: true;
            openingHoursNote: true;
            visitDuration: true;
            rating: true;
            images: {
                where: {
                    isPrimary: true;
                };
                orderBy: {
                    displayOrder: "asc";
                };
                take: number;
                select: {
                    id: true;
                    imageUrl: true;
                    isPrimary: true;
                };
            };
            categories: {
                select: {
                    category: {
                        select: {
                            id: true;
                            name: true;
                        };
                    };
                };
            };
        };
    };
};
export declare const tripDayDetailInclude: {
    itineraries: {
        orderBy: {
            sequenceOrder: "asc";
        };
        include: {
            destination: {
                select: {
                    id: true;
                    name: true;
                    description: true;
                    address: true;
                    phoneNumber: true;
                    latitude: true;
                    longitude: true;
                    ticketPrice: true;
                    openingHoursNote: true;
                    visitDuration: true;
                    rating: true;
                    images: {
                        where: {
                            isPrimary: true;
                        };
                        orderBy: {
                            displayOrder: "asc";
                        };
                        take: number;
                        select: {
                            id: true;
                            imageUrl: true;
                            isPrimary: true;
                        };
                    };
                    categories: {
                        select: {
                            category: {
                                select: {
                                    id: true;
                                    name: true;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export declare const tripDetailInclude: {
    tripDays: {
        orderBy: {
            dayNumber: "asc";
        };
        include: {
            itineraries: {
                orderBy: {
                    sequenceOrder: "asc";
                };
                include: {
                    destination: {
                        select: {
                            id: true;
                            name: true;
                            description: true;
                            address: true;
                            phoneNumber: true;
                            latitude: true;
                            longitude: true;
                            ticketPrice: true;
                            openingHoursNote: true;
                            visitDuration: true;
                            rating: true;
                            images: {
                                where: {
                                    isPrimary: true;
                                };
                                orderBy: {
                                    displayOrder: "asc";
                                };
                                take: number;
                                select: {
                                    id: true;
                                    imageUrl: true;
                                    isPrimary: true;
                                };
                            };
                            categories: {
                                select: {
                                    category: {
                                        select: {
                                            id: true;
                                            name: true;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
declare const tripSummarySelect: {
    id: true;
    name: true;
    destinationCity: true;
    startDate: true;
    endDate: true;
    budget: true;
    numberOfPeople: true;
    description: true;
    isAiGenerated: true;
    shareToken: true;
    isPublic: true;
    createdAt: true;
    updatedAt: true;
    _count: {
        select: {
            tripDays: true;
        };
    };
};
declare const ownedTripStateSelect: {
    id: true;
    startDate: true;
    endDate: true;
    shareToken: true;
    isPublic: true;
    updatedAt: true;
    tripDays: {
        orderBy: {
            dayNumber: "asc";
        };
        select: {
            id: true;
            dayNumber: true;
            date: true;
        };
    };
};
declare const ownedDayInclude: {
    trip: {
        select: {
            id: true;
            userId: true;
            startDate: true;
            endDate: true;
            updatedAt: true;
        };
    };
    itineraries: {
        orderBy: {
            sequenceOrder: "asc";
        };
        include: {
            destination: {
                select: {
                    id: true;
                    name: true;
                    description: true;
                    address: true;
                    phoneNumber: true;
                    latitude: true;
                    longitude: true;
                    ticketPrice: true;
                    openingHoursNote: true;
                    visitDuration: true;
                    rating: true;
                    images: {
                        where: {
                            isPrimary: true;
                        };
                        orderBy: {
                            displayOrder: "asc";
                        };
                        take: number;
                        select: {
                            id: true;
                            imageUrl: true;
                            isPrimary: true;
                        };
                    };
                    categories: {
                        select: {
                            category: {
                                select: {
                                    id: true;
                                    name: true;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
declare const ownedItineraryInclude: {
    destination: {
        select: {
            id: true;
            name: true;
            description: true;
            address: true;
            phoneNumber: true;
            latitude: true;
            longitude: true;
            ticketPrice: true;
            openingHoursNote: true;
            visitDuration: true;
            rating: true;
            images: {
                where: {
                    isPrimary: true;
                };
                orderBy: {
                    displayOrder: "asc";
                };
                take: number;
                select: {
                    id: true;
                    imageUrl: true;
                    isPrimary: true;
                };
            };
            categories: {
                select: {
                    category: {
                        select: {
                            id: true;
                            name: true;
                        };
                    };
                };
            };
        };
    };
    tripDay: {
        select: {
            id: true;
            tripId: true;
            trip: {
                select: {
                    userId: true;
                    updatedAt: true;
                };
            };
        };
    };
};
declare const publicTripSelect: {
    name: true;
    destinationCity: true;
    startDate: true;
    endDate: true;
    budget: true;
    numberOfPeople: true;
    description: true;
    isPublic: true;
    tripDays: {
        orderBy: {
            dayNumber: "asc";
        };
        select: {
            dayNumber: true;
            date: true;
            note: true;
            itineraries: {
                orderBy: {
                    sequenceOrder: "asc";
                };
                select: {
                    sequenceOrder: true;
                    startTime: true;
                    endTime: true;
                    estimatedCost: true;
                    travelDistanceKm: true;
                    travelDurationMinutes: true;
                    travelMode: true;
                    note: true;
                    destination: {
                        select: {
                            id: true;
                            name: true;
                            description: true;
                            address: true;
                            phoneNumber: true;
                            latitude: true;
                            longitude: true;
                            ticketPrice: true;
                            openingHoursNote: true;
                            visitDuration: true;
                            rating: true;
                            images: {
                                where: {
                                    isPrimary: true;
                                };
                                orderBy: {
                                    displayOrder: "asc";
                                };
                                take: number;
                                select: {
                                    id: true;
                                    imageUrl: true;
                                    isPrimary: true;
                                };
                            };
                            categories: {
                                select: {
                                    category: {
                                        select: {
                                            id: true;
                                            name: true;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export type TripSummaryRecord = Prisma.TripGetPayload<{
    select: typeof tripSummarySelect;
}>;
export type TripDetailRecord = Prisma.TripGetPayload<{
    include: typeof tripDetailInclude;
}>;
export type OwnedTripStateRecord = Prisma.TripGetPayload<{
    select: typeof ownedTripStateSelect;
}>;
export type TripDayDetailRecord = Prisma.TripDayGetPayload<{
    include: typeof tripDayDetailInclude;
}>;
export type OwnedTripDayRecord = Prisma.TripDayGetPayload<{
    include: typeof ownedDayInclude;
}>;
export type ItineraryDetailRecord = Prisma.ItineraryGetPayload<{
    include: typeof itineraryDetailInclude;
}>;
export type OwnedItineraryRecord = Prisma.ItineraryGetPayload<{
    include: typeof ownedItineraryInclude;
}>;
export type PublicTripRecord = Prisma.TripGetPayload<{
    select: typeof publicTripSelect;
}>;
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
export declare const tripRepository: {
    listByUser(userId: number, skip: number, take: number): Promise<{
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            _count: {
                tripDays: number;
            };
            name: string;
            destinationCity: string;
            startDate: Date;
            endDate: Date;
            budget: Prisma.Decimal | null;
            numberOfPeople: number;
            description: string | null;
            shareToken: string | null;
            isAiGenerated: boolean;
            isPublic: boolean;
        }[];
        total: number;
    }>;
    findOwnedTrip(userId: number, tripId: number): Prisma.Prisma__TripClient<({
        tripDays: ({
            itineraries: ({
                destination: {
                    id: number;
                    name: string;
                    description: string | null;
                    address: string;
                    phoneNumber: string | null;
                    latitude: Prisma.Decimal;
                    longitude: Prisma.Decimal;
                    ticketPrice: Prisma.Decimal;
                    openingHoursNote: string | null;
                    visitDuration: number | null;
                    rating: Prisma.Decimal;
                    categories: {
                        category: {
                            id: number;
                            name: string;
                        };
                    }[];
                    images: {
                        id: number;
                        isPrimary: boolean;
                        imageUrl: string;
                    }[];
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                destinationId: number;
                startTime: Date | null;
                endTime: Date | null;
                estimatedCost: Prisma.Decimal;
                travelDistanceKm: Prisma.Decimal | null;
                travelDurationMinutes: number | null;
                travelMode: string | null;
                note: string | null;
                sequenceOrder: number;
                tripDayId: number;
            })[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            note: string | null;
            dayNumber: number;
            tripId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        aiRawData: string | null;
        destinationCity: string;
        startDate: Date;
        endDate: Date;
        budget: Prisma.Decimal | null;
        numberOfPeople: number;
        description: string | null;
        shareToken: string | null;
        isAiGenerated: boolean;
        isPublic: boolean;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, {
        log: ("query" | "warn" | "error")[];
    }>;
    findOwnedTripState(userId: number, tripId: number): Prisma.Prisma__TripClient<{
        id: number;
        updatedAt: Date;
        tripDays: {
            id: number;
            date: Date;
            dayNumber: number;
        }[];
        startDate: Date;
        endDate: Date;
        shareToken: string | null;
        isPublic: boolean;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, {
        log: ("query" | "warn" | "error")[];
    }>;
    createComplete(userId: number, input: NormalizedCreateTripInput): Promise<{
        trip: null;
        invalidDestinationIds: number[];
    } | {
        trip: {
            tripDays: ({
                itineraries: ({
                    destination: {
                        id: number;
                        name: string;
                        description: string | null;
                        address: string;
                        phoneNumber: string | null;
                        latitude: Prisma.Decimal;
                        longitude: Prisma.Decimal;
                        ticketPrice: Prisma.Decimal;
                        openingHoursNote: string | null;
                        visitDuration: number | null;
                        rating: Prisma.Decimal;
                        categories: {
                            category: {
                                id: number;
                                name: string;
                            };
                        }[];
                        images: {
                            id: number;
                            isPrimary: boolean;
                            imageUrl: string;
                        }[];
                    };
                } & {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    destinationId: number;
                    startTime: Date | null;
                    endTime: Date | null;
                    estimatedCost: Prisma.Decimal;
                    travelDistanceKm: Prisma.Decimal | null;
                    travelDurationMinutes: number | null;
                    travelMode: string | null;
                    note: string | null;
                    sequenceOrder: number;
                    tripDayId: number;
                })[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                date: Date;
                note: string | null;
                dayNumber: number;
                tripId: number;
            })[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: number;
            aiRawData: string | null;
            destinationCity: string;
            startDate: Date;
            endDate: Date;
            budget: Prisma.Decimal | null;
            numberOfPeople: number;
            description: string | null;
            shareToken: string | null;
            isAiGenerated: boolean;
            isPublic: boolean;
        };
        invalidDestinationIds: number[];
    }>;
    updateTrip(userId: number, tripId: number, expectedUpdatedAt: Date, input: NormalizedUpdateTripInput): Promise<({
        tripDays: ({
            itineraries: ({
                destination: {
                    id: number;
                    name: string;
                    description: string | null;
                    address: string;
                    phoneNumber: string | null;
                    latitude: Prisma.Decimal;
                    longitude: Prisma.Decimal;
                    ticketPrice: Prisma.Decimal;
                    openingHoursNote: string | null;
                    visitDuration: number | null;
                    rating: Prisma.Decimal;
                    categories: {
                        category: {
                            id: number;
                            name: string;
                        };
                    }[];
                    images: {
                        id: number;
                        isPrimary: boolean;
                        imageUrl: string;
                    }[];
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                destinationId: number;
                startTime: Date | null;
                endTime: Date | null;
                estimatedCost: Prisma.Decimal;
                travelDistanceKm: Prisma.Decimal | null;
                travelDurationMinutes: number | null;
                travelMode: string | null;
                note: string | null;
                sequenceOrder: number;
                tripDayId: number;
            })[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            date: Date;
            note: string | null;
            dayNumber: number;
            tripId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        aiRawData: string | null;
        destinationCity: string;
        startDate: Date;
        endDate: Date;
        budget: Prisma.Decimal | null;
        numberOfPeople: number;
        description: string | null;
        shareToken: string | null;
        isAiGenerated: boolean;
        isPublic: boolean;
    }) | null>;
    deleteTrip(userId: number, tripId: number): Prisma.Prisma__TripClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        aiRawData: string | null;
        destinationCity: string;
        startDate: Date;
        endDate: Date;
        budget: Prisma.Decimal | null;
        numberOfPeople: number;
        description: string | null;
        shareToken: string | null;
        isAiGenerated: boolean;
        isPublic: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, {
        log: ("query" | "warn" | "error")[];
    }>;
    listDays(userId: number, tripId: number): Prisma.PrismaPromise<({
        itineraries: ({
            destination: {
                id: number;
                name: string;
                description: string | null;
                address: string;
                phoneNumber: string | null;
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
                ticketPrice: Prisma.Decimal;
                openingHoursNote: string | null;
                visitDuration: number | null;
                rating: Prisma.Decimal;
                categories: {
                    category: {
                        id: number;
                        name: string;
                    };
                }[];
                images: {
                    id: number;
                    isPrimary: boolean;
                    imageUrl: string;
                }[];
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            destinationId: number;
            startTime: Date | null;
            endTime: Date | null;
            estimatedCost: Prisma.Decimal;
            travelDistanceKm: Prisma.Decimal | null;
            travelDurationMinutes: number | null;
            travelMode: string | null;
            note: string | null;
            sequenceOrder: number;
            tripDayId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        note: string | null;
        dayNumber: number;
        tripId: number;
    })[]>;
    findOwnedDay(userId: number, tripId: number, dayId: number): Prisma.Prisma__TripDayClient<({
        trip: {
            id: number;
            updatedAt: Date;
            userId: number;
            startDate: Date;
            endDate: Date;
        };
        itineraries: ({
            destination: {
                id: number;
                name: string;
                description: string | null;
                address: string;
                phoneNumber: string | null;
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
                ticketPrice: Prisma.Decimal;
                openingHoursNote: string | null;
                visitDuration: number | null;
                rating: Prisma.Decimal;
                categories: {
                    category: {
                        id: number;
                        name: string;
                    };
                }[];
                images: {
                    id: number;
                    isPrimary: boolean;
                    imageUrl: string;
                }[];
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            destinationId: number;
            startTime: Date | null;
            endTime: Date | null;
            estimatedCost: Prisma.Decimal;
            travelDistanceKm: Prisma.Decimal | null;
            travelDurationMinutes: number | null;
            travelMode: string | null;
            note: string | null;
            sequenceOrder: number;
            tripDayId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        note: string | null;
        dayNumber: number;
        tripId: number;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, {
        log: ("query" | "warn" | "error")[];
    }>;
    createDay(userId: number, tripId: number, expectedTripUpdatedAt: Date, input: NormalizedCreateTripDayInput): Promise<({
        itineraries: ({
            destination: {
                id: number;
                name: string;
                description: string | null;
                address: string;
                phoneNumber: string | null;
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
                ticketPrice: Prisma.Decimal;
                openingHoursNote: string | null;
                visitDuration: number | null;
                rating: Prisma.Decimal;
                categories: {
                    category: {
                        id: number;
                        name: string;
                    };
                }[];
                images: {
                    id: number;
                    isPrimary: boolean;
                    imageUrl: string;
                }[];
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            destinationId: number;
            startTime: Date | null;
            endTime: Date | null;
            estimatedCost: Prisma.Decimal;
            travelDistanceKm: Prisma.Decimal | null;
            travelDurationMinutes: number | null;
            travelMode: string | null;
            note: string | null;
            sequenceOrder: number;
            tripDayId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        note: string | null;
        dayNumber: number;
        tripId: number;
    }) | null>;
    updateDay(userId: number, tripId: number, dayId: number, expectedTripUpdatedAt: Date, input: NormalizedUpdateTripDayInput): Promise<({
        itineraries: ({
            destination: {
                id: number;
                name: string;
                description: string | null;
                address: string;
                phoneNumber: string | null;
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
                ticketPrice: Prisma.Decimal;
                openingHoursNote: string | null;
                visitDuration: number | null;
                rating: Prisma.Decimal;
                categories: {
                    category: {
                        id: number;
                        name: string;
                    };
                }[];
                images: {
                    id: number;
                    isPrimary: boolean;
                    imageUrl: string;
                }[];
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            destinationId: number;
            startTime: Date | null;
            endTime: Date | null;
            estimatedCost: Prisma.Decimal;
            travelDistanceKm: Prisma.Decimal | null;
            travelDurationMinutes: number | null;
            travelMode: string | null;
            note: string | null;
            sequenceOrder: number;
            tripDayId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        note: string | null;
        dayNumber: number;
        tripId: number;
    }) | null>;
    deleteDay(userId: number, tripId: number, dayId: number, expectedTripUpdatedAt: Date): Promise<boolean>;
    listItineraries(userId: number, tripId: number, dayId: number): Prisma.PrismaPromise<({
        destination: {
            id: number;
            name: string;
            description: string | null;
            address: string;
            phoneNumber: string | null;
            latitude: Prisma.Decimal;
            longitude: Prisma.Decimal;
            ticketPrice: Prisma.Decimal;
            openingHoursNote: string | null;
            visitDuration: number | null;
            rating: Prisma.Decimal;
            categories: {
                category: {
                    id: number;
                    name: string;
                };
            }[];
            images: {
                id: number;
                isPrimary: boolean;
                imageUrl: string;
            }[];
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        destinationId: number;
        startTime: Date | null;
        endTime: Date | null;
        estimatedCost: Prisma.Decimal;
        travelDistanceKm: Prisma.Decimal | null;
        travelDurationMinutes: number | null;
        travelMode: string | null;
        note: string | null;
        sequenceOrder: number;
        tripDayId: number;
    })[]>;
    findOwnedItinerary(userId: number, tripId: number, dayId: number, itineraryId: number): Prisma.Prisma__ItineraryClient<({
        destination: {
            id: number;
            name: string;
            description: string | null;
            address: string;
            phoneNumber: string | null;
            latitude: Prisma.Decimal;
            longitude: Prisma.Decimal;
            ticketPrice: Prisma.Decimal;
            openingHoursNote: string | null;
            visitDuration: number | null;
            rating: Prisma.Decimal;
            categories: {
                category: {
                    id: number;
                    name: string;
                };
            }[];
            images: {
                id: number;
                isPrimary: boolean;
                imageUrl: string;
            }[];
        };
        tripDay: {
            id: number;
            trip: {
                updatedAt: Date;
                userId: number;
            };
            tripId: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        destinationId: number;
        startTime: Date | null;
        endTime: Date | null;
        estimatedCost: Prisma.Decimal;
        travelDistanceKm: Prisma.Decimal | null;
        travelDurationMinutes: number | null;
        travelMode: string | null;
        note: string | null;
        sequenceOrder: number;
        tripDayId: number;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, {
        log: ("query" | "warn" | "error")[];
    }>;
    createItineraryAtEnd(userId: number, tripId: number, dayId: number, input: NormalizedCreateItineraryInput): Promise<{
        status: "not_found";
        itinerary: null;
    } | {
        status: "destination_not_found";
        itinerary: null;
    } | {
        status: "limit_reached";
        itinerary: null;
    } | {
        status: "created";
        itinerary: {
            destination: {
                id: number;
                name: string;
                description: string | null;
                address: string;
                phoneNumber: string | null;
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
                ticketPrice: Prisma.Decimal;
                openingHoursNote: string | null;
                visitDuration: number | null;
                rating: Prisma.Decimal;
                categories: {
                    category: {
                        id: number;
                        name: string;
                    };
                }[];
                images: {
                    id: number;
                    isPrimary: boolean;
                    imageUrl: string;
                }[];
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            destinationId: number;
            startTime: Date | null;
            endTime: Date | null;
            estimatedCost: Prisma.Decimal;
            travelDistanceKm: Prisma.Decimal | null;
            travelDurationMinutes: number | null;
            travelMode: string | null;
            note: string | null;
            sequenceOrder: number;
            tripDayId: number;
        };
    }>;
    updateItinerary(userId: number, tripId: number, dayId: number, itineraryId: number, expectedUpdatedAt: Date, input: NormalizedUpdateItineraryInput): Promise<{
        status: "not_found";
        itinerary: null;
    } | {
        status: "conflict";
        itinerary: null;
    } | {
        status: "destination_not_found";
        itinerary: null;
    } | {
        status: "updated";
        itinerary: {
            destination: {
                id: number;
                name: string;
                description: string | null;
                address: string;
                phoneNumber: string | null;
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
                ticketPrice: Prisma.Decimal;
                openingHoursNote: string | null;
                visitDuration: number | null;
                rating: Prisma.Decimal;
                categories: {
                    category: {
                        id: number;
                        name: string;
                    };
                }[];
                images: {
                    id: number;
                    isPrimary: boolean;
                    imageUrl: string;
                }[];
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            destinationId: number;
            startTime: Date | null;
            endTime: Date | null;
            estimatedCost: Prisma.Decimal;
            travelDistanceKm: Prisma.Decimal | null;
            travelDurationMinutes: number | null;
            travelMode: string | null;
            note: string | null;
            sequenceOrder: number;
            tripDayId: number;
        };
    }>;
    deleteItineraryAndCompact(userId: number, tripId: number, dayId: number, itineraryId: number): Promise<boolean>;
    reorderItineraries(userId: number, tripId: number, dayId: number, itineraryIds: number[]): Promise<({
        destination: {
            id: number;
            name: string;
            description: string | null;
            address: string;
            phoneNumber: string | null;
            latitude: Prisma.Decimal;
            longitude: Prisma.Decimal;
            ticketPrice: Prisma.Decimal;
            openingHoursNote: string | null;
            visitDuration: number | null;
            rating: Prisma.Decimal;
            categories: {
                category: {
                    id: number;
                    name: string;
                };
            }[];
            images: {
                id: number;
                isPrimary: boolean;
                imageUrl: string;
            }[];
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        destinationId: number;
        startTime: Date | null;
        endTime: Date | null;
        estimatedCost: Prisma.Decimal;
        travelDistanceKm: Prisma.Decimal | null;
        travelDurationMinutes: number | null;
        travelMode: string | null;
        note: string | null;
        sequenceOrder: number;
        tripDayId: number;
    })[] | null>;
    getCostSummary(userId: number, tripId: number): Promise<CostSummaryRecord | null>;
    enableShare(userId: number, tripId: number, shareToken: string): Promise<{
        id: number;
        shareToken: string | null;
        isPublic: boolean;
    } | null>;
    disableShare(userId: number, tripId: number): Prisma.Prisma__TripClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        aiRawData: string | null;
        destinationCity: string;
        startDate: Date;
        endDate: Date;
        budget: Prisma.Decimal | null;
        numberOfPeople: number;
        description: string | null;
        shareToken: string | null;
        isAiGenerated: boolean;
        isPublic: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, {
        log: ("query" | "warn" | "error")[];
    }>;
    findPublicByShareToken(shareToken: string): Prisma.Prisma__TripClient<{
        name: string;
        tripDays: {
            date: Date;
            note: string | null;
            dayNumber: number;
            itineraries: {
                destination: {
                    id: number;
                    name: string;
                    description: string | null;
                    address: string;
                    phoneNumber: string | null;
                    latitude: Prisma.Decimal;
                    longitude: Prisma.Decimal;
                    ticketPrice: Prisma.Decimal;
                    openingHoursNote: string | null;
                    visitDuration: number | null;
                    rating: Prisma.Decimal;
                    categories: {
                        category: {
                            id: number;
                            name: string;
                        };
                    }[];
                    images: {
                        id: number;
                        isPrimary: boolean;
                        imageUrl: string;
                    }[];
                };
                startTime: Date | null;
                endTime: Date | null;
                estimatedCost: Prisma.Decimal;
                travelDistanceKm: Prisma.Decimal | null;
                travelDurationMinutes: number | null;
                travelMode: string | null;
                note: string | null;
                sequenceOrder: number;
            }[];
        }[];
        destinationCity: string;
        startDate: Date;
        endDate: Date;
        budget: Prisma.Decimal | null;
        numberOfPeople: number;
        description: string | null;
        isPublic: boolean;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, {
        log: ("query" | "warn" | "error")[];
    }>;
};
export {};
//# sourceMappingURL=trip.repository.d.ts.map