import { Prisma } from '@prisma/client';
declare const aiDestinationSelect: {
    id: true;
    name: true;
    description: true;
    address: true;
    latitude: true;
    longitude: true;
    ticketPrice: true;
    openingHoursNote: true;
    visitDuration: true;
    rating: true;
    categories: {
        select: {
            category: {
                select: {
                    name: true;
                };
            };
        };
    };
};
declare const aiPreferenceSelect: {
    budgetLevel: true;
    travelStyle: true;
    preferredActivities: true;
    preferredCategories: true;
};
declare const aiChatTripSelect: {
    id: true;
    name: true;
    destinationCity: true;
    startDate: true;
    endDate: true;
    budget: true;
    numberOfPeople: true;
    description: true;
    isAiGenerated: true;
    tripDays: {
        orderBy: {
            dayNumber: "asc";
        };
        take: number;
        select: {
            dayNumber: true;
            date: true;
            note: true;
            itineraries: {
                orderBy: {
                    sequenceOrder: "asc";
                };
                take: number;
                select: {
                    startTime: true;
                    endTime: true;
                    estimatedCost: true;
                    travelMode: true;
                    note: true;
                    destination: {
                        select: {
                            id: true;
                            name: true;
                            address: true;
                        };
                    };
                };
            };
        };
    };
};
declare const aiChatDestinationSelect: {
    id: true;
    name: true;
    address: true;
    description: true;
    ticketPrice: true;
    openingHoursNote: true;
    visitDuration: true;
    rating: true;
    categories: {
        select: {
            category: {
                select: {
                    name: true;
                };
            };
        };
    };
};
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
export declare const aiRepository: {
    findPreference(userId: number): Promise<AiPreferenceRecord | null>;
    findActiveDestinations(destinationCity: string, limit: number): Promise<AiDestinationRecord[]>;
    findUserTripsForChat(userId: number, limit: number): Promise<AiChatTripRecord[]>;
    findDestinationsForChat(limit: number): Promise<AiChatDestinationRecord[]>;
};
export type AiRepository = Pick<typeof aiRepository, 'findPreference' | 'findActiveDestinations' | 'findUserTripsForChat' | 'findDestinationsForChat'>;
export {};
//# sourceMappingURL=ai.repository.d.ts.map