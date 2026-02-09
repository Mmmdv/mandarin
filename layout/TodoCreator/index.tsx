import StyledButton from "@/components/StyledButton"
import StyledTextInput from "@/components/StyledTextInput"
import { COLORS } from "@/constants/ui"
import { Todo } from "@/types/todo"
import { useEffect, useState } from "react"
import { Keyboard, StyleSheet, View } from "react-native"


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
        Keyboard.dismiss();
        onAddTodo(text);
        setText("");
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
                backgroundColor={COLORS.PRIMARY_BACKGROUND_WHITE}
                value={text}
                onChangeText={setText}
                isError={inputError} />
            <StyledButton
                icon="add-circle-outline"
                size="large"
                variant="blue_icon"
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
        marginVertical: 15,
        paddingHorizontal: 30,
        paddingBottom: 15,
        gap: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "#3a3f47",
    },
})

export default TodoCreator