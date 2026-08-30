import { CreatePreferenceInput, TravelPreferenceResponse, UpdatePreferenceInput } from '../types/preference.types';
export declare const preferenceService: {
    getPreference(userId: number): Promise<TravelPreferenceResponse>;
    createPreference(userId: number, input: CreatePreferenceInput): Promise<TravelPreferenceResponse>;
    updatePreference(userId: number, input: UpdatePreferenceInput): Promise<TravelPreferenceResponse>;
    deletePreference(userId: number): Promise<void>;
};
//# sourceMappingURL=preference.service.d.ts.map