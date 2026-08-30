import { Prisma } from '@prisma/client';
import { PreferenceWriteInput } from '../types/preference.types';
declare const preferenceSelect: {
    id: true;
    userId: true;
    budgetLevel: true;
    travelStyle: true;
    preferredActivities: true;
    preferredCategories: true;
    updatedAt: true;
};
export type TravelPreferenceRecord = Prisma.TravelPreferenceGetPayload<{
    select: typeof preferenceSelect;
}>;
export declare const preferenceRepository: {
    findByUserId(userId: number): Promise<TravelPreferenceRecord | null>;
    createForUser(userId: number, input: PreferenceWriteInput): Promise<TravelPreferenceRecord>;
    updateForUser(userId: number, input: PreferenceWriteInput): Promise<TravelPreferenceRecord>;
    deleteForUser(userId: number): Promise<TravelPreferenceRecord>;
};
export {};
//# sourceMappingURL=preference.repository.d.ts.map