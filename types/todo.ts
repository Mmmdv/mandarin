export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  isArchived?: boolean;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
  archivedAt?: string;
  reminder?: string;
}
