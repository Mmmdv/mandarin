import StyledText from "@/components/StyledText"
import { COLORS } from "@/constants/ui"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import ClearArchiveModal from "../Modals/ClearArchiveModal.tsx"
import TodoItem from "../TodoItem"

type SortBy = "date" | "text"
type SortOrder = "asc" | "desc"

type TodoListProps = {
    todos: Todo[]
    onDeleteTodo: (id: Todo["id"]) => void
    onCheckTodo: (id: Todo["id"]) => void
    onEditTodo: (id: Todo["id"], title: Todo["title"]) => void
    onArchiveTodo: (id: Todo["id"]) => void
    onClearArchive: () => void
    archivedTodos: Todo[]
}

// Sort controls component
const SortControls = ({
    sortBy,
    sortOrder,
    onToggleSortBy,
    onToggleSortOrder
}: {
    sortBy: SortBy,
    sortOrder: SortOrder,
    onToggleSortBy: () => void,
    onToggleSortOrder: () => void
}) => (
    <View style={styles.sortContainer}>
        <TouchableOpacity style={styles.sortButton} onPress={onToggleSortBy}>
            <Ionicons
                name={sortBy === "date" ? "calendar" : "text"}
                size={14}
                color={COLORS.PRIMARY_TEXT}
            />
            <StyledText style={styles.sortText}>
                {sortBy === "date" ? "Tarix" : "Text"}
            </StyledText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={onToggleSortOrder}>
            <Ionicons
                name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                size={14}
                color={COLORS.PRIMARY_TEXT}
            />
        </TouchableOpacity>
    </View>
)

const TodoList: React.FC<TodoListProps> = ({ todos, onDeleteTodo, onCheckTodo, onEditTodo, onArchiveTodo, onClearArchive, archivedTodos }) => {
    // Separate sort states for each section
    const [todoSortBy, setTodoSortBy] = useState<SortBy>("date")
    const [todoSortOrder, setTodoSortOrder] = useState<SortOrder>("desc")
    const [doneSortBy, setDoneSortBy] = useState<SortBy>("date")
    const [doneSortOrder, setDoneSortOrder] = useState<SortOrder>("desc")
    const [archiveSortBy, setArchiveSortBy] = useState<SortBy>("date")
    const [archiveSortOrder, setArchiveSortOrder] = useState<SortOrder>("desc")

    const [todoExpanded, setTodoExpanded] = useState(true)
    const [doneExpanded, setDoneExpanded] = useState(true)
    const [archiveExpanded, setArchiveExpanded] = useState(false)
    const [isClearArchiveModalOpen, setIsClearArchiveModalOpen] = useState(false)

    // Filter todos into pending and completed (non-archived)
    const pendingTodos = todos.filter(todo => !todo.isCompleted && !todo.isArchived)
    const completedTodos = todos.filter(todo => todo.isCompleted && !todo.isArchived)

    // Sort function for pending todos (by createdAt)
    const sortPendingTodos = (todoList: Todo[], sortBy: SortBy, sortOrder: SortOrder) => {
        return [...todoList].sort((a, b) => {
            if (sortBy === "date") {
                const dateA = new Date(a.createdAt).getTime()
                const dateB = new Date(b.createdAt).getTime()
                return sortOrder === "asc" ? dateA - dateB : dateB - dateA
            } else {
                const textA = a.title.toLowerCase()
                const textB = b.title.toLowerCase()
                if (sortOrder === "asc") {
                    return textA.localeCompare(textB)
                } else {
                    return textB.localeCompare(textA)
                }
            }
        })
    }

    // Sort function for completed todos (by completedAt)
    const sortCompletedTodos = (todoList: Todo[], sortBy: SortBy, sortOrder: SortOrder) => {
        return [...todoList].sort((a, b) => {
            if (sortBy === "date") {
                const dateA = new Date(a.completedAt || a.createdAt).getTime()
                const dateB = new Date(b.completedAt || b.createdAt).getTime()
                return sortOrder === "asc" ? dateA - dateB : dateB - dateA
            } else {
                const textA = a.title.toLowerCase()
                const textB = b.title.toLowerCase()
                if (sortOrder === "asc") {
                    return textA.localeCompare(textB)
                } else {
                    return textB.localeCompare(textA)
                }
            }
        })
    }

    const sortedPendingTodos = sortPendingTodos(pendingTodos, todoSortBy, todoSortOrder)
    const sortedCompletedTodos = sortCompletedTodos(completedTodos, doneSortBy, doneSortOrder)

    // Sort archived todos (by archivedAt)
    const sortArchivedTodos = (todoList: Todo[], sortBy: SortBy, sortOrder: SortOrder) => {
        return [...todoList].sort((a, b) => {
            if (sortBy === "date") {
                const dateA = new Date(a.archivedAt || a.createdAt).getTime()
                const dateB = new Date(b.archivedAt || b.createdAt).getTime()
                return sortOrder === "asc" ? dateA - dateB : dateB - dateA
            } else {
                const textA = a.title.toLowerCase()
                const textB = b.title.toLowerCase()
                if (sortOrder === "asc") {
                    return textA.localeCompare(textB)
                } else {
                    return textB.localeCompare(textA)
                }
            }
        })
    }
    const sortedArchivedTodos = sortArchivedTodos(archivedTodos, archiveSortBy, archiveSortOrder)

    if (todos.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <StyledText style={styles.emptyText}>No tasks yet</StyledText>
                <StyledText style={styles.emptySubtext}>Add a new task to get started</StyledText>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
            {/* To Do Section */}
            <View style={styles.sectionContainer}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => setTodoExpanded(!todoExpanded)}
                >
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons
                            name="list-circle"
                            size={24}
                            color="#5BC0EB"
                        />
                        <StyledText style={styles.sectionTitle}>
                            To Do ({sortedPendingTodos.length})
                        </StyledText>
                    </View>
                    <View style={styles.sectionControls}>
                        {todoExpanded && (
                            <SortControls
                                sortBy={todoSortBy}
                                sortOrder={todoSortOrder}
                                onToggleSortBy={() => setTodoSortBy(prev => prev === "date" ? "text" : "date")}
                                onToggleSortOrder={() => setTodoSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                            />
                        )}
                        <Ionicons
                            name={todoExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={COLORS.PRIMARY_TEXT}
                        />
                    </View>
                </TouchableOpacity>
                {todoExpanded && sortedPendingTodos.map(item => (
                    <TodoItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        isCompleted={item.isCompleted}
                        createdAt={item.createdAt}
                        completedAt={item.completedAt}
                        updatedAt={item.updatedAt}
                        deleteTodo={onDeleteTodo}
                        checkTodo={onCheckTodo}
                        editTodo={onEditTodo}
                    />
                ))}
            </View>

            {/* Divider */}
            <View style={styles.sectionDivider} />

            {/* Done Section */}
            <View style={styles.sectionContainer}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => setDoneExpanded(!doneExpanded)}
                >
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons
                            name="checkmark-done-circle"
                            size={24}
                            color="#4ECDC4"
                        />
                        <StyledText style={styles.sectionTitle}>
                            Done ({sortedCompletedTodos.length})
                        </StyledText>
                    </View>
                    <View style={styles.sectionControls}>
                        {doneExpanded && (
                            <SortControls
                                sortBy={doneSortBy}
                                sortOrder={doneSortOrder}
                                onToggleSortBy={() => setDoneSortBy(prev => prev === "date" ? "text" : "date")}
                                onToggleSortOrder={() => setDoneSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                            />
                        )}
                        <Ionicons
                            name={doneExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={COLORS.PRIMARY_TEXT}
                        />
                    </View>
                </TouchableOpacity>
                {doneExpanded && sortedCompletedTodos.map(item => (
                    <TodoItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        isCompleted={item.isCompleted}
                        createdAt={item.createdAt}
                        completedAt={item.completedAt}
                        updatedAt={item.updatedAt}
                        deleteTodo={onDeleteTodo}
                        checkTodo={onCheckTodo}
                        editTodo={onEditTodo}
                        archiveTodo={onArchiveTodo}
                    />
                ))}
            </View>

            {/* Divider */}
            <View style={styles.sectionDivider} />

            {/* Archive Section */}
            <View style={styles.sectionContainer}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => setArchiveExpanded(!archiveExpanded)}
                    activeOpacity={0.7}
                >
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons
                            name="archive"
                            size={24}
                            color="#888"
                        />
                        <StyledText style={styles.sectionTitle}>
                            Archive ({archivedTodos.length})
                        </StyledText>
                    </View>
                    <View style={styles.sectionControls}>
                        {archivedTodos.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setIsClearArchiveModalOpen(true)}
                                style={{ marginRight: 10 }}
                            >
                                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                            </TouchableOpacity>
                        )}
                        {archiveExpanded && (
                            <SortControls
                                sortBy={archiveSortBy}
                                sortOrder={archiveSortOrder}
                                onToggleSortBy={() => setArchiveSortBy(archiveSortBy === "date" ? "text" : "date")}
                                onToggleSortOrder={() => setArchiveSortOrder(archiveSortOrder === "asc" ? "desc" : "asc")}
                            />
                        )}
                        <Ionicons
                            name={archiveExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={COLORS.PRIMARY_TEXT}
                        />
                    </View>
                </TouchableOpacity>
                {archiveExpanded && sortedArchivedTodos.map(item => (
                    <TodoItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        isCompleted={item.isCompleted}
                        isArchived={item.isArchived}
                        createdAt={item.createdAt}
                        completedAt={item.completedAt}
                        updatedAt={item.updatedAt}
                        archivedAt={item.archivedAt}
                        deleteTodo={onDeleteTodo}
                        checkTodo={onCheckTodo}
                        editTodo={onEditTodo}
                    />
                ))}
            </View>

            <ClearArchiveModal
                isOpen={isClearArchiveModalOpen}
                onClose={() => setIsClearArchiveModalOpen(false)}
                onClear={onClearArchive}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.PRIMARY_TEXT,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.PLACEHOLDER,
    },
    sectionContainer: {
        marginTop: 10,
    },
    sortContainer: {
        flexDirection: "row",
        gap: 5,
        marginRight: 10,
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2f37",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 3,
    },
    sortText: {
        fontSize: 10,
        color: COLORS.PRIMARY_TEXT,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.PRIMARY_TEXT,
    },
    sectionControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionDivider: {
        height: 0.5,
        backgroundColor: "#3a3f47",
        marginHorizontal: 15,
        marginVertical: 10,
    },
})

export default TodoList