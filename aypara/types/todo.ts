export type ReminderStatus =
  | "Gözlənilir"
  | "Dəyişdirilib və ləğv olunub"
  | "Göndərilib"
  | "Ləğv olunub";

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
  notificationId?: string;
  reminderCancelled?: boolean;
  category?: string;
  isIterative?: boolean;
  successorId?: string;
  completedCount?: number;
  iterativeDates?: {
    date: string; // ISO string
    notificationId?: string;
    isDone?: boolean;
    doneAt?: string;
  }[];
}
