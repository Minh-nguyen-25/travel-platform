import { BudgetLevel } from '../constants';

export interface PreferenceWriteInput {
  budgetLevel?: BudgetLevel | null;
  travelStyle?: string | null;
  preferredActivities?: string[] | null;
  preferredCategories?: string[] | null;
}

export type CreatePreferenceInput = PreferenceWriteInput;
export type UpdatePreferenceInput = PreferenceWriteInput;

export interface TravelPreferenceResponse {
  id: number;
  userId: number;
  budgetLevel: BudgetLevel | null;
  travelStyle: string | null;
  preferredActivities: string[] | null;
  preferredCategories: string[] | null;
  updatedAt: string;
}
