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
            }>,
        ) => {
            const { id, title } = action.payload;
            state.todos = state.todos.map((todo) =>
                todo.id === id ? { ...todo, title } : todo)
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
    },
});

export const { addTodo, deleteTodo, editTodo, checkTodo } = todoSlice.actions

export const selectTodos = (state: { todo: TodoState }): TodoState['todos'] =>
    state.todo.todos

export default todoSlice.reducer 