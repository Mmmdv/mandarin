import { COLORS } from "@/constants/ui"
import { useTheme } from "@/hooks/useTheme"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"

type TodoCreatorProps = {
    onAddTodo: (title: Todo["title"]) => void
}

const TodoCreator: React.FC<TodoCreatorProps> = ({ onAddTodo }) => {

    const { colors, t } = useTheme()

    const [isFocused, setIsFocused] = useState(false)
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
            <View style={[
                styles.inputContainer,
                isFocused && styles.inputFocused,
                inputError && styles.inputError
            ]}>
                <Ionicons name="add-outline" size={20} color={isFocused ? "#ffffff" : "#666"} style={styles.inputIcon} />
                <TextInput
                    style={styles.textInput}
                    placeholder={t("todo_placeholder")} //"Add a new task..."
                    placeholderTextColor="#666"
                    value={text}
                    onChangeText={setText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onSubmitEditing={onPressAdd}
                    returnKeyType="done"
                />
            </View>
            <TouchableOpacity
                style={[styles.addButton, inputError && styles.addButtonDisabled]}
                onPress={onPressAdd}
                activeOpacity={0.7}
                disabled={inputError}
            >
                <Ionicons name="arrow-up-circle" size={40} color={inputError ? "#3a3f47" : COLORS.PRIMARY_TEXT} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 15,
        gap: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "#3a3f47",
    },
    inputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#151616ff",
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "#606875ff",
        paddingHorizontal: 12,
        paddingVertical: 12, // Increased padding for better look
        gap: 8,
    },
    inputFocused: {
        borderColor: "#888282ff",
        backgroundColor: "#1c1f24",
    },
    inputError: {
        borderColor: COLORS.ERROR_INPUT_TEXT,
    },
    inputIcon: {
        marginLeft: 2,
    },
    textInput: {
        flex: 1,
        color: COLORS.PRIMARY_TEXT,
        fontSize: 14,
    },
    addButton: {
        padding: 0,
    },
    addButtonDisabled: {
        opacity: 0.5,
    },
})

export default TodoCreator
