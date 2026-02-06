import { Todo } from "@/types/todo";
import { useState } from "react";

// Random ID generator 
const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const defaultTodos: Todo[] = [];

const useTodo = () => {

    const [todos, setTodos] = useState<Todo[]>(defaultTodos);

    const onAddTodo = (title: Todo["title"]) => {
        setTodos([
            ...todos,
            {
                id: generateId(),
                title,
                isCompleted: false,
            },
        ])
    }

    const onDeleteTodo = (id: Todo["id"]) => {
        setTodos(todos.filter((todo) => todo.id !== id))
    }

    const onEditTodo = (id: Todo["id"], title: Todo["title"]) => {
        setTodos(todos.map((todo) => todo.id === id ? { ...todo, title } : todo))
    }

    const onCheckTodo = (id: Todo["id"]) => {
        setTodos(todos.map((todo) => todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo))
    }

    const completedTodos = todos.filter((todo) => todo.isCompleted);

    return {
        onAddTodo,
        onDeleteTodo,
        onEditTodo,
        onCheckTodo,
        todos,
        completedTodos
    };
}

export default useTodo;
