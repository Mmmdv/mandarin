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
    todos: Todo[]
    stats: TodoStats
    dailyStats: Record<string, DailyTodoStats>
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
    dailyStats: {}
}

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

const defaultDaily: DailyTodoStats = { created: 0, completed: 0, deleted: 0, archived: 0, completionTimeMs: 0 };

function getToday(): string {
    return new Date().toISOString().split('T')[0];
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
        addTodo: (
            state: TodoState,
            action: PayloadAction<Todo>,
        ) => {
            ensureStats(state);
            state.todos.push(action.payload);
            state.stats.totalCreated += 1;
            ensureDaily(state, getToday()).created += 1;
        },
        deleteTodo: (
            state: TodoState,
            action: PayloadAction<string>,
        ) => {
            const id = action.payload;
            ensureStats(state);
            state.stats.totalDeleted += 1;
            ensureDaily(state, getToday()).deleted += 1;
            state.todos = state.todos.filter((todo) =>
                todo.id !== id)
        },
        editTodo: (
            state: TodoState,
            action: PayloadAction<{
                id: Todo["id"]
                title: Todo["title"]
                reminder?: string
                notificationId?: string
            }>,
        ) => {
            const { id, title, reminder, notificationId } = action.payload;
            state.todos = state.todos.map((todo) =>
                todo.id === id ? {
                    ...todo,
                    title,
                    reminder,
                    notificationId: notificationId !== undefined ? notificationId : todo.notificationId,
                    updatedAt: new Date().toISOString(),
                    reminderCancelled: reminder ? false : todo.reminderCancelled,
                } : todo)
        },
        checkTodo: (
            state: TodoState,
            action: PayloadAction<string>,
        ) => {
            const id = action.payload;
            ensureStats(state);
            const target = state.todos.find(todo => todo.id === id);
            if (target && !target.isCompleted) {
                state.stats.totalCompleted += 1;
                const createdTime = new Date(target.createdAt).getTime();
                const completedTime = Date.now();
                const durationMs = completedTime - createdTime;
                if (durationMs > 0) {
                    state.stats.totalCompletionTimeMs += durationMs;
                }
                const daily = ensureDaily(state, getToday());
                daily.completed += 1;
                if (durationMs > 0) daily.completionTimeMs += durationMs;
            }
            state.todos = state.todos.map((todo) =>
                todo.id === id ? {
                    ...todo,
                    isCompleted: !todo.isCompleted,
                    completedAt: !todo.isCompleted ? new Date().toISOString() : undefined
                } : todo)
        },
        archiveTodo: (
            state: TodoState,
            action: PayloadAction<string>,
        ) => {
            const id = action.payload;
            ensureStats(state);
            state.stats.totalArchived += 1;
            ensureDaily(state, getToday()).archived += 1;
            state.todos = state.todos.map((todo) =>
                todo.id === id ? {
                    ...todo,
                    isArchived: true,
                    archivedAt: new Date().toISOString()
                } : todo)
        },
        archiveAllTodos: (
            state: TodoState,
        ) => {
            ensureStats(state);
            const toArchive = state.todos.filter(todo => todo.isCompleted && !todo.isArchived).length;
            state.stats.totalArchived += toArchive;
            ensureDaily(state, getToday()).archived += toArchive;
            state.todos = state.todos.map((todo) =>
                todo.isCompleted ? {
                    ...todo,
                    isArchived: true,
                    archivedAt: new Date().toISOString()
                } : todo)
        },
        clearArchive: (
            state: TodoState,
        ) => {
            ensureStats(state);
            const archived = state.todos.filter((todo) => todo.isArchived).length;
            state.stats.totalDeleted += archived;
            ensureDaily(state, getToday()).deleted += archived;
            state.todos = state.todos.filter((todo) => !todo.isArchived)
        },
        cancelAllReminders: (state) => {
            state.todos = state.todos.map(todo => {
                if (todo.reminder && !todo.isCompleted && !todo.isArchived) {
                    return { ...todo, reminderCancelled: true };
                }
                return todo;
            });
        }
    },
});

export const { addTodo, deleteTodo, editTodo, checkTodo, archiveTodo, archiveAllTodos, clearArchive, cancelAllReminders } = todoSlice.actions

export const selectTodos = (state: { todo: TodoState }): TodoState['todos'] =>
    state.todo.todos

export const selectTodoStats = (state: { todo: TodoState }): TodoStats =>
    state.todo.stats

export default todoSlice.reducer
