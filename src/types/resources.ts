export type ResourceCategory = 'medical-gas' | 'power' | 'hvac' | 'water' | 'waste-management';
export type ResourceCondition = 'normal' | 'attention-needed' | 'critical';

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  location: string;
  condition: ResourceCondition;
  currentValue: number;
  unit: string;
  normalRange: { min: number; max: number };
  lastVerified: string; // ISO timestamp
  verifiedBy: string;
  notes: string;
}
