import StyledButton from "@/components/StyledButton"
import StyledCheckBox from "@/components/StyledCheckBox"
import StyledText from "@/components/StyledText"
import { COLORS } from "@/constants/ui"
import { Todo } from "@/types/todo"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import EditTodoModal from "../Modals/EditTodoModal.tsx"

type TodoItemProps = Todo & {
    deleteTodo: (id: Todo["id"]) => void
    checkTodo: (id: Todo["id"]) => void
    editTodo: (id: Todo["id"], title: Todo["title"]) => void
}

const TodoItem: React.FC<TodoItemProps> = ({ id, title, isCompleted, checkTodo, deleteTodo, editTodo }) => {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const onPressEdit = () => {
        setIsEditModalOpen(true)
    }

    const onCheckTodo = () => {
        checkTodo(id)
    }

    const onDeleteTodo = () => {
        deleteTodo(id)
    }

    return (
        <View style={styles.container}>
            <View style={styles.checKTitleConainer}>
                <StyledCheckBox checked={isCompleted} onCheck={onCheckTodo} />
                <StyledText style={[{ textDecorationLine: isCompleted ? "line-through" : "none" }]}>{title}</StyledText>
            </View>
            <View style={styles.controlsContainer}>
                <StyledButton icon="pencil-sharp" size="small" variant="edit" onPress={onPressEdit}></StyledButton>
                <EditTodoModal title={title} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={(title) => editTodo(id, title)} />
                <StyledButton icon="trash-sharp" size="small" variant="delete" onPress={onDeleteTodo}></StyledButton>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 8,
        marginVertical: 5,
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
    },
    controlsContainer: {
        flexDirection: "row",
        paddingHorizontal: 0,
        paddingVertical: 0,
        gap: 8,
    },
    checKTitleConainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    }
})
export default TodoItem