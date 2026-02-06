import StyledText from "@/components/StyledText"
import { COLORS } from "@/constants/ui"
import { Todo } from "@/types/todo"
import { FlatList, StyleSheet, View } from "react-native"
import TodoItem from "../TodoItem"

type TodoListProps = {
    todos: Todo[]
    onDeleteTodo: (id: Todo["id"]) => void
    onCheckTodo: (id: Todo["id"]) => void
    onEditTodo: (id: Todo["id"], title: Todo["title"]) => void
}

const TodoList: React.FC<TodoListProps> = ({ todos, onDeleteTodo, onCheckTodo, onEditTodo }) => {

    if (todos.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <StyledText style={styles.emptyText}>No tasks yet</StyledText>
                <StyledText style={styles.emptySubtext}>Add a new task to get started</StyledText>
            </View>
        )
    }

    return (
        <View>
            <FlatList
                data={todos}
                keyExtractor={(todo) => todo.id.toString()}
                renderItem={({ item }) =>
                    <TodoItem
                        id={item.id}
                        title={item.title}
                        isCompleted={item.isCompleted}
                        deleteTodo={onDeleteTodo}
                        checkTodo={onCheckTodo}
                        editTodo={onEditTodo} />
                } />
        </View>
    )
}

const styles = StyleSheet.create({
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
    }
})

export default TodoList