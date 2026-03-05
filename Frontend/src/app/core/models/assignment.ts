import { BacklogStatus, Category } from './backlog';

export interface TaskAssignment {
  id: string;
  weeklyPlanId: string;
  backlogItemId: string;
  backlogItemTitle: string;
  userId: string;
  userName: string;
  assignedHours: number;
  progressPercentage: number;
  status: BacklogStatus;
}

export interface CreateAssignment {
  backlogItemId: string;
  userId: string;
  assignedHours: number;
}

export interface DashboardSummary {
  planSummary: {
    startDate: string;
    endDate: string;
    isFrozen: boolean;
    totalAvailable: number;
    totalPlanned: number;
  };
  categoryUtilization: Array<{
    category: Category;
    allocated: number;
    used: number;
    percentage: number;
  }>;
  memberProgress: Array<{
    name: string;
    tasks: number;
    completed: number;
    totalHours: number;
  }>;
  taskLevelProgress: Array<{
    id: string;
    title: string;
    memberName: string;
    category: Category;
    status: BacklogStatus;
    progress: number;
    hours: number;
  }>;
}
