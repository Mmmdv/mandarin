import { Todo } from "@/types/todo"

export type SortBy = "date" | "text"
export type SortOrder = "asc" | "desc"

/**
 * Generic sort function for todos.
 * @param todoList - The list to sort
 * @param sortBy - Sort by "date" or "text"
 * @param sortOrder - Sort "asc" or "desc"
 * @param lang - Current language for localeCompare
 * @param dateKey - Which date field to sort by (defaults to "createdAt")
 */
export const sortTodos = (
    todoList: Todo[],
    sortBy: SortBy,
    sortOrder: SortOrder,
    lang: string = "en",
    dateKey: keyof Pick<Todo, "createdAt" | "completedAt" | "updatedAt" | "archivedAt"> = "createdAt"
): Todo[] => {
    return [...todoList].sort((a, b) => {
        if (sortBy === "date") {
            const getLatestDate = (todo: Todo) => {
                const dates = [new Date(todo.createdAt).getTime()]
                if (todo.updatedAt) dates.push(new Date(todo.updatedAt).getTime())
                if (todo.completedAt) dates.push(new Date(todo.completedAt).getTime())
                if (todo.archivedAt) dates.push(new Date(todo.archivedAt).getTime())
                return Math.max(...dates)
            }

            const dateA = getLatestDate(a)
            const dateB = getLatestDate(b)
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA
        } else {
            const textA = a.title.toLowerCase()
            const textB = b.title.toLowerCase()
            return sortOrder === "asc"
                ? textA.localeCompare(textB, lang)
                : textB.localeCompare(textA, lang)
        }
    })
}
