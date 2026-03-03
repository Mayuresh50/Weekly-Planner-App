export enum Category {
  Client = 'Client',
  TechDebt = 'TechDebt',
  RnD = 'RnD',
}

export enum BacklogStatus {
  Backlog = 'Backlog',
  Planned = 'Planned',
  InProgress = 'InProgress',
  Completed = 'Completed',
}

export interface BacklogItem {
  id: string;
  title: string;
  description?: string;
  category: Category;
  estimatedHours: number;
  status: BacklogStatus;
}

export interface CreateBacklogItem {
  title: string;
  description?: string;
  category: Category;
  estimatedHours: number;
}
