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
export type AiDestinationRecord = Prisma.DestinationGetPayload<{
    select: typeof aiDestinationSelect;
}>;
export type AiPreferenceRecord = Prisma.TravelPreferenceGetPayload<{
    select: typeof aiPreferenceSelect;
}>;
export declare const aiRepository: {
    findPreference(userId: number): Promise<AiPreferenceRecord | null>;
    findActiveDestinations(destinationCity: string, limit: number): Promise<AiDestinationRecord[]>;
};
export type AiRepository = Pick<typeof aiRepository, 'findPreference' | 'findActiveDestinations'>;
export {};
//# sourceMappingURL=ai.repository.d.ts.map