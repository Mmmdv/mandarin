import StyledText from "@/components/StyledText"
import { COLORS } from "@/constants/ui"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import TodoItem from "../TodoItem"

type SortBy = "date" | "text"
type SortOrder = "asc" | "desc"

type TodoListProps = {
    todos: Todo[]
    onDeleteTodo: (id: Todo["id"]) => void
    onCheckTodo: (id: Todo["id"]) => void
    onEditTodo: (id: Todo["id"], title: Todo["title"]) => void
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

const TodoList: React.FC<TodoListProps> = ({ todos, onDeleteTodo, onCheckTodo, onEditTodo }) => {
    // Separate sort states for each section
    const [todoSortBy, setTodoSortBy] = useState<SortBy>("date")
    const [todoSortOrder, setTodoSortOrder] = useState<SortOrder>("desc")
    const [doneSortBy, setDoneSortBy] = useState<SortBy>("date")
    const [doneSortOrder, setDoneSortOrder] = useState<SortOrder>("desc")

    const [todoExpanded, setTodoExpanded] = useState(true)
    const [doneExpanded, setDoneExpanded] = useState(true)

    // Filter todos into pending and completed
    const pendingTodos = todos.filter(todo => !todo.isCompleted)
    const completedTodos = todos.filter(todo => todo.isCompleted)

    // Sort function
    const sortTodos = (todoList: Todo[], sortBy: SortBy, sortOrder: SortOrder) => {
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

    const sortedPendingTodos = sortTodos(pendingTodos, todoSortBy, todoSortOrder)
    const sortedCompletedTodos = sortTodos(completedTodos, doneSortBy, doneSortOrder)

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
                        <SortControls
                            sortBy={todoSortBy}
                            sortOrder={todoSortOrder}
                            onToggleSortBy={() => setTodoSortBy(prev => prev === "date" ? "text" : "date")}
                            onToggleSortOrder={() => setTodoSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                        />
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
                        deleteTodo={onDeleteTodo}
                        checkTodo={onCheckTodo}
                        editTodo={onEditTodo}
                    />
                ))}
            </View>

            {/* Done Section */}
            <View style={styles.sectionContainer}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => setDoneExpanded(!doneExpanded)}
                >
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#4ECDC4"
                        />
                        <StyledText style={styles.sectionTitle}>
                            Done ({sortedCompletedTodos.length})
                        </StyledText>
                    </View>
                    <View style={styles.sectionControls}>
                        <SortControls
                            sortBy={doneSortBy}
                            sortOrder={doneSortOrder}
                            onToggleSortBy={() => setDoneSortBy(prev => prev === "date" ? "text" : "date")}
                            onToggleSortOrder={() => setDoneSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                        />
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
                        deleteTodo={onDeleteTodo}
                        checkTodo={onCheckTodo}
                        editTodo={onEditTodo}
                    />
                ))}
            </View>
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
})

export default TodoList