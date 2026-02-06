import StyledButton from "@/components/StyledButton"
import StyledCheckBox from "@/components/StyledCheckBox"
import StyledText from "@/components/StyledText"
import { COLORS } from "@/constants/ui"
import { Todo } from "@/types/todo"
import { useState } from "react"
import { StyleSheet, Vibration, View } from "react-native"
import DeleteTodoModal from "../Modals/DeleteTodoModal.tsx"
import EditTodoModal from "../Modals/EditTodoModal.tsx"

type TodoItemProps = Todo & {
    checkTodo: (id: Todo["id"]) => void
    deleteTodo: (id: Todo["id"]) => void
    editTodo: (id: Todo["id"], title: Todo["title"]) => void
}

const TodoItem: React.FC<TodoItemProps> = ({ id, title, isCompleted, checkTodo, deleteTodo, editTodo }) => {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const onPressDelete = () => {
        setIsDeleteModalOpen(true);
        Vibration.vibrate(100);
    }

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
                <StyledCheckBox
                    checked={isCompleted}
                    onCheck={onCheckTodo} />
                <StyledText
                    style={[{ textDecorationLine: isCompleted ? "line-through" : "none" }]}>
                    {title}
                </StyledText>
            </View>
            <View style={styles.controlsContainer}>

                <StyledButton
                    icon="pencil-sharp"
                    size="small"
                    variant="edit"
                    onPress={onPressEdit}>
                </StyledButton>
                <EditTodoModal
                    title={title}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={(title) => editTodo(id, title)} />

                <StyledButton
                    icon="trash-sharp"
                    size="small"
                    variant="delete"
                    onPress={onPressDelete}>
                </StyledButton>
                <DeleteTodoModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDelete={() => deleteTodo(id)}
                />

            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 5,
        marginHorizontal: 5,
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    controlsContainer: {
        flexDirection: "row",
        paddingHorizontal: 0,
        paddingVertical: 0,
        gap: 5,
    },
    checKTitleConainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    }
})
export default TodoItem