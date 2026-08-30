import { CreateTripInput } from '../types/trip.types';
export declare const normalizeAiTripDraft: (tripDraft: CreateTripInput) => CreateTripInput;
export declare const createAiDraftProof: (userId: number, tripDraft: CreateTripInput, aiRawData: string) => string;
export declare const verifyAiDraftProof: (token: string, userId: number, tripDraft: CreateTripInput, aiRawData: string) => boolean;
//# sourceMappingURL=ai-draft.utils.d.ts.map