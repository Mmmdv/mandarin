import { useAppDispatch, useAppSelector } from "@/store";
import { deleteNotification } from "@/store/slices/notificationSlice";
import { addTodo, archiveAllTodos, archiveTodo, checkTodo, clearArchive, deleteTodo, editTodo, selectTodos } from "@/store/slices/todoSlice";
import { Todo } from "@/types/todo";
import * as Notifications from 'expo-notifications';

// Random ID generator 
const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const useTodo = () => {
    const todos = useAppSelector(selectTodos);
    const dispatch = useAppDispatch();

    const onAddTodo = (title: Todo["title"], reminder?: string, notificationId?: string) => {
        dispatch(addTodo({
            id: generateId(),
            title,
            isCompleted: false,
            createdAt: new Date().toISOString(),
            reminder,
            notificationId
        }))
    }

    const onDeleteTodo = async (id: Todo["id"]) => {
        const todo = todos.find(t => t.id === id);
        if (todo && todo.notificationId && !todo.isCompleted) {
            await Notifications.cancelScheduledNotificationAsync(todo.notificationId);
            dispatch(deleteNotification(todo.notificationId));
        }
        dispatch(deleteTodo(id))
    }

    const onEditTodo = (id: Todo["id"], title: Todo["title"], reminder?: string) => {
        dispatch(editTodo({ id, title, reminder }))
    }

    const onCheckTodo = async (id: Todo["id"]) => {
        const todo = todos.find(t => t.id === id);
        if (todo && !todo.isCompleted && todo.notificationId) {
            console.log("Cancelling notification:", todo.notificationId);
            await Notifications.cancelScheduledNotificationAsync(todo.notificationId);
            dispatch(deleteNotification(todo.notificationId));
        }
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
