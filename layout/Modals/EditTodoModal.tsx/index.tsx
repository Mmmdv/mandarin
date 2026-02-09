import StyledButton from "@/components/StyledButton"
import StyledModal from "@/components/StyledModal"
import StyledText from "@/components/StyledText"
import { COLORS } from "@/constants/ui"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { StyleSheet, TextInput, View } from "react-native"

type EditTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onUpdate: (title: string) => void
    title: Todo["title"]
}

const EditTodoModal: React.FC<EditTodoModalProps> = ({
    isOpen, onClose, onUpdate, title }) => {

    const [updatedTitle, setUpdateTitle] = useState(title)
    const [inputError, setInputError] = useState(false)

    useEffect(() => {
        if (inputError && updatedTitle) {
            setInputError(false)
        }
    }, [updatedTitle])

    useEffect(() => {
        if (isOpen) {
            setUpdateTitle(title)
            setInputError(false)
        }
    }, [isOpen, title])

    const onPressSave = () => {
        if (!updatedTitle.trim()) {
            setInputError(true)
            return
        }
        onUpdate(updatedTitle)
        onClose()
    }

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="create-outline" size={28} color="#5BC0EB" />
                </View>

                <StyledText style={styles.headerText}>Edit Task</StyledText>

                <View style={[styles.inputWrapper, inputError && styles.inputError]}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Update your task..."
                        placeholderTextColor="#666"
                        value={updatedTitle}
                        onChangeText={setUpdateTitle}
                        multiline={true}
                    />
                </View>

                <View style={styles.buttonsContainer}>
                    <StyledButton
                        label="Cancel"
                        onPress={onClose}
                        variant="blue_button"
                    />
                    <StyledButton
                        label="Save"
                        onPress={onPressSave}
                        variant="blue_button"
                    />
                </View>
            </View>
        </StyledModal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 15,
        borderWidth: 0.5,
        borderColor: "#3a3f47",
        padding: 20,
        minWidth: 280,
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(91, 192, 235, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "600",
        color: COLORS.PRIMARY_TEXT,
    },
    inputWrapper: {
        backgroundColor: "#1c1f24",
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: "#3a3f47",
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 60,
        width: "100%",
    },
    inputError: {
        borderColor: COLORS.ERROR_INPUT_TEXT,
    },
    textInput: {
        color: COLORS.PRIMARY_TEXT,
        fontSize: 14,
        minHeight: 40,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginTop: 8,
    },
})

export default EditTodoModal
