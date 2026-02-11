import { Todo } from "@/types/todo";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TodoState {
    todos: Todo[]
}

const initialState: TodoState = {
    todos: []
}

export const todoSlice = createSlice({
    name: "todo",
    initialState,
    reducers: {
        addTodo: (
            state: TodoState,
            action: PayloadAction<Todo>,
        ) => {
            const todo = action.payload;
            state.todos.push(todo);
        },
        deleteTodo: (
            state: TodoState,
            action: PayloadAction<string>,
        ) => {
            const id = action.payload;
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
                    // Update notificationId if provided
                    notificationId: notificationId !== undefined ? notificationId : todo.notificationId,
                    updatedAt: new Date().toISOString(),
                    // If reminder is updated/set, reset cancelled status
                    reminderCancelled: reminder ? false : todo.reminderCancelled
                } : todo)
        },
        checkTodo: (
            state: TodoState,
            action: PayloadAction<string>,
        ) => {
            const id = action.payload;
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

export default todoSlice.reducer 