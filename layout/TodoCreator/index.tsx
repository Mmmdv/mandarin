import StyledButton from "@/components/StyledButton"
import StyledTextInput from "@/components/StyledTextInput"
import { Todo } from "@/types/todo"
import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"


type TodoCreatorProps = {
    onAddTodo: (title: Todo["title"]) => void
}

const TodoCreator: React.FC<TodoCreatorProps> = ({ onAddTodo }) => {

    const [text, setText] = useState("")
    const [inputError, setInputError] = useState(false)
    const onPressAdd = () => {
        if (!text) {
            setInputError(true)
            return
        }
        onAddTodo(text)
        setText("")
    }

    useEffect(() => {
        if (inputError && text) {
            setInputError(false)
        }
    }, [text])

    return (
        <View style={styles.container}>
            <StyledTextInput
                placeholder="Add a new task.."
                value={text}
                onChangeText={setText}
                isError={inputError} />
            <StyledButton
                icon="add-circle-sharp"
                size="large"
                variant="add"
                onPress={onPressAdd}
                disabled={inputError} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
        paddingHorizontal: 15,
        gap: 20,
    }
})

export default TodoCreator