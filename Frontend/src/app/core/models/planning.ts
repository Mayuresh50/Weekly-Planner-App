import { Category } from './backlog';

export interface WeeklyPlan {
  id: string;
  startDate: string;
  endDate: string;
  isFrozen: boolean;
  clientPercentage: number;
  techDebtPercentage: number;
  rndPercentage: number;
  totalAvailableHours: number;
  allocations: PlanAllocation[];
}

export interface PlanAllocation {
  category: Category;
  allocatedHours: number;
}

export interface CreateWeeklyPlan {
  startDate: string;
  endDate: string;
  clientPercentage: number;
  techDebtPercentage: number;
  rndPercentage: number;
}
