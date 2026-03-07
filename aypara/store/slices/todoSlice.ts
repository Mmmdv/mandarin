import { Todo } from "@/types/todo";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TodoStats {
  totalCreated: number;
  totalCompleted: number;
  totalDeleted: number;
  totalArchived: number;
  totalCompletionTimeMs: number;
}

export interface DailyTodoStats {
  created: number;
  completed: number;
  deleted: number;
  archived: number;
  completionTimeMs: number;
}

export interface TodoState {
  todos: Todo[];
  stats: TodoStats;
  dailyStats: Record<string, DailyTodoStats>;
}

const initialState: TodoState = {
  todos: [],
  stats: {
    totalCreated: 0,
    totalCompleted: 0,
    totalDeleted: 0,
    totalArchived: 0,
    totalCompletionTimeMs: 0,
  },
  dailyStats: {},
};

const defaultStats: TodoStats = {
  totalCreated: 0,
  totalCompleted: 0,
  totalDeleted: 0,
  totalArchived: 0,
  totalCompletionTimeMs: 0,
};

function ensureStats(state: TodoState) {
  if (!state.stats) {
    state.stats = { ...defaultStats };
  }
  if (state.stats.totalCompletionTimeMs === undefined) {
    state.stats.totalCompletionTimeMs = 0;
  }
  if (!state.dailyStats) state.dailyStats = {};
}

const defaultDaily: DailyTodoStats = {
  created: 0,
  completed: 0,
  deleted: 0,
  archived: 0,
  completionTimeMs: 0,
};

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function ensureDaily(state: TodoState, date: string): DailyTodoStats {
  if (!state.dailyStats) state.dailyStats = {};
  if (!state.dailyStats[date]) {
    state.dailyStats[date] = { ...defaultDaily };
  }
  return state.dailyStats[date];
}

export const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    addTodo: (state: TodoState, action: PayloadAction<Todo>) => {
      ensureStats(state);
      state.todos.push(action.payload);
      state.stats.totalCreated += 1;
      ensureDaily(state, getToday()).created += 1;
    },
    deleteTodo: (state: TodoState, action: PayloadAction<string>) => {
      const id = action.payload;
      ensureStats(state);
      state.stats.totalDeleted += 1;
      ensureDaily(state, getToday()).deleted += 1;
      state.todos = state.todos.filter((todo) => todo.id !== id);
      // Clear any stale successor links pointing to this deleted todo
      state.todos.forEach((t) => {
        if (t.successorId === id) {
          t.successorId = undefined;
        }
      });
    },
    editTodo: (
      state: TodoState,
      action: PayloadAction<{
        id: Todo["id"];
        title: Todo["title"];
        reminder?: string;
        notificationId?: string;
        category?: string;
      }>,
    ) => {
      const { id, title, reminder, notificationId, category } = action.payload;
      state.todos = state.todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title,
              reminder,
              notificationId:
                notificationId !== undefined
                  ? notificationId
                  : todo.notificationId,
              category: category !== undefined ? category : todo.category,
              updatedAt: new Date().toISOString(),
              reminderCancelled: reminder ? false : todo.reminderCancelled,
            }
          : todo,
      );
    },
    checkTodo: (state: TodoState, action: PayloadAction<string>) => {
      const id = action.payload;
      ensureStats(state);
      const target = state.todos.find((todo) => todo.id === id);
      if (!target) return;

      const nowStr = new Date().toISOString();

      if (!target.isIterative) {
        // --- Standard Non-Iterative Logic ---
        const isMarkingComplete = !target.isCompleted;
        target.isCompleted = isMarkingComplete;
        target.completedAt = isMarkingComplete ? nowStr : undefined;

        if (isMarkingComplete) {
          state.stats.totalCompleted += 1;
          const daily = ensureDaily(state, getToday());
          daily.completed += 1;

          const createdTime = new Date(target.createdAt).getTime();
          const durationMs = Date.now() - createdTime;
          if (durationMs > 0) {
            state.stats.totalCompletionTimeMs += durationMs;
            daily.completionTimeMs += durationMs;
          }
        } else {
          state.stats.totalCompleted = Math.max(
            0,
            state.stats.totalCompleted - 1,
          );
          ensureDaily(state, getToday()).completed = Math.max(
            0,
            state.dailyStats[getToday()].completed - 1,
          );
        }
      } else {
        // --- Enhanced Iterative Logic (Single Object) ---
        if (!target.isCompleted) {
          // Action: Mark NEXT pending date as Done
          const nextPendingIndex = (target.iterativeDates || []).findIndex(
            (d) => !d.isDone,
          );

          if (nextPendingIndex !== -1) {
            const dateItem = target.iterativeDates![nextPendingIndex];
            dateItem.isDone = true;
            dateItem.doneAt = nowStr;
            target.completedCount = (target.completedCount || 0) + 1;
            target.completedAt = nowStr; // Last completion time

            // Stats
            state.stats.totalCompleted += 1;
            ensureDaily(state, getToday()).completed += 1;

            // Set next reminder if available
            const nextOne = target.iterativeDates!.find(
              (d, idx) => !d.isDone && idx > nextPendingIndex,
            );
            if (nextOne) {
              target.reminder = nextOne.date;
              target.notificationId = nextOne.notificationId;
              target.isCompleted = false;
            } else {
              // No more dates left
              target.isCompleted = true;
            }
          } else {
            // Edge case: button clicked but no pending dates? Mark as complete.
            target.isCompleted = true;
          }
        } else {
          // Action: Undo the LAST completed date
          const lastDoneIndex = [...(target.iterativeDates || [])]
            .reverse()
            .findIndex((d) => d.isDone);
          const actualIndex =
            lastDoneIndex !== -1
              ? target.iterativeDates!.length - 1 - lastDoneIndex
              : -1;

          if (actualIndex !== -1) {
            const dateItem = target.iterativeDates![actualIndex];
            dateItem.isDone = false;
            dateItem.doneAt = undefined;
            target.completedCount = Math.max(
              0,
              (target.completedCount || 0) - 1,
            );
            target.isCompleted = false;

            // The recently undone date becomes the new reminder (it's now the earliest pending)
            target.reminder = dateItem.date;
            target.notificationId = dateItem.notificationId;

            // Stats
            state.stats.totalCompleted = Math.max(
              0,
              state.stats.totalCompleted - 1,
            );
            ensureDaily(state, getToday()).completed = Math.max(
              0,
              state.dailyStats[getToday()].completed - 1,
            );
          } else {
            // Nothing actually done? Just toggle off
            target.isCompleted = false;
          }
        }
      }
    },
    archiveTodo: (state: TodoState, action: PayloadAction<string>) => {
      const id = action.payload;
      ensureStats(state);
      state.stats.totalArchived += 1;
      ensureDaily(state, getToday()).archived += 1;
      state.todos = state.todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              isArchived: true,
              archivedAt: new Date().toISOString(),
            }
          : todo,
      );
    },
    archiveAllTodos: (state: TodoState) => {
      ensureStats(state);
      const toArchive = state.todos.filter(
        (todo) => todo.isCompleted && !todo.isArchived,
      ).length;
      state.stats.totalArchived += toArchive;
      ensureDaily(state, getToday()).archived += toArchive;
      state.todos = state.todos.map((todo) =>
        todo.isCompleted
          ? {
              ...todo,
              isArchived: true,
              archivedAt: new Date().toISOString(),
            }
          : todo,
      );
    },
    clearArchive: (state: TodoState) => {
      ensureStats(state);
      const archived = state.todos.filter((todo) => todo.isArchived).length;
      state.stats.totalDeleted += archived;
      ensureDaily(state, getToday()).deleted += archived;
      state.todos = state.todos.filter((todo) => !todo.isArchived);
    },
    cancelAllReminders: (state) => {
      const now = new Date();
      state.todos = state.todos.map((todo) => {
        if (todo.reminder && !todo.isCompleted && !todo.isArchived) {
          if (new Date(todo.reminder) > now) {
            return { ...todo, reminderCancelled: true };
          }
        }
        return todo;
      });
    },
  },
});

export const {
  addTodo,
  deleteTodo,
  editTodo,
  checkTodo,
  archiveTodo,
  archiveAllTodos,
  clearArchive,
  cancelAllReminders,
} = todoSlice.actions;

export const selectTodos = (state: { todo: TodoState }): TodoState["todos"] =>
  state.todo.todos;

export const selectTodoStats = (state: { todo: TodoState }): TodoStats =>
  state.todo.stats;

export default todoSlice.reducer;
