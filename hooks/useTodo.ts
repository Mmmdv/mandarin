import { useAppDispatch, useAppSelector } from "@/store";
import { addTodo, archiveAllTodos, archiveTodo, checkTodo, clearArchive, deleteTodo, editTodo, selectTodos } from "@/store/slices/todoSlice";
import { Todo } from "@/types/todo";

// Random ID generator 
const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const useTodo = () => {
    const todos = useAppSelector(selectTodos);
    const dispatch = useAppDispatch();

    const onAddTodo = (title: Todo["title"], reminder?: string) => {
        dispatch(addTodo({
            id: generateId(),
            title,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            reminder
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

    const onArchiveTodo = (id: Todo["id"]) => {
        dispatch(archiveTodo(id))
    }

    const onArchiveAll = () => {
        dispatch(archiveAllTodos())
    }


    const onClearArchive = () => {
        dispatch(clearArchive())
    }

    const completedTodos = todos.filter((todo) => todo.isCompleted && !todo.isArchived);
    const archivedTodos = todos.filter((todo) => todo.isArchived);

    return {
        onAddTodo,
        onDeleteTodo,
        onEditTodo,
        onCheckTodo,
        onArchiveTodo,
        onArchiveAll,
        onClearArchive,
        todos,
        completedTodos,
        archivedTodos
    };
}

export default useTodo;
