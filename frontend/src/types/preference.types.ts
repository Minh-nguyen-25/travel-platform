export type BudgetLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TravelPreference {
  id: number;
  userId: number;
  budgetLevel: BudgetLevel | null;
  travelStyle: string | null;
  preferredActivities: string[] | null;
  preferredCategories: string[] | null;
  updatedAt: string;
}

export interface TravelPreferencePayload {
  budgetLevel: BudgetLevel | null;
  travelStyle: string | null;
  preferredActivities: string[] | null;
  preferredCategories: string[] | null;
}
