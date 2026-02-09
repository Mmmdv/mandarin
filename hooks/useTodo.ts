import { useAppDispatch, useAppSelector } from "@/store";
import { addTodo, checkTodo, deleteTodo, editTodo, selectTodos } from "@/store/slices/todoSlice";
import { Todo } from "@/types/todo";

// Random ID generator 
const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const defaultTodos: Todo[] = [];

const useTodo = () => {
    const todos = useAppSelector(selectTodos);
    const dispatch = useAppDispatch();

    const onAddTodo = (title: Todo["title"]) => {
        dispatch(addTodo({
            id: generateId(),
            title,
            isCompleted: false,
            createdAt: new Date().toISOString(),
        }))
    }

    const onDeleteTodo = (id: Todo["id"]) => {
        dispatch(deleteTodo(id))
    }

    const onEditTodo = (id: Todo["id"], title: Todo["title"]) => {
        dispatch(editTodo({ id, title }))
    }

    const onCheckTodo = (id: Todo["id"]) => {
        dispatch(checkTodo(id))
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
