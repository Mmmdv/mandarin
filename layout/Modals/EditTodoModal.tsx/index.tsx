import StyledButton from "@/components/StyledButton"
import StyledModal from "@/components/StyledModal"
import StyledText from "@/components/StyledText"
import StyledTextInput from "@/components/StyledTextInput"
import { COLORS } from "@/constants/ui"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"

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

    // Modal save duymesi error verdikde, tekrar daxil edende error itir
    useEffect(() => {
        if (inputError && updatedTitle) {
            setInputError(false)
        }
    }, [updatedTitle])

    // Modal açıldıqda və ya title dəyişdikdə state-i sıfırla
    useEffect(() => {
        if (isOpen) {
            setUpdateTitle(title)
            setInputError(false)
        }
    }, [isOpen, title])

    // Modal save duymesi, title varsa save edir yoxdursa error verir
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
                {/* Header with icon */}
                <View style={styles.headerContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="pencil" size={24} color="#5BC0EB" />
                    </View>
                    <StyledText variant="heading" style={styles.headerText}>
                        Edit Task
                    </StyledText>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Content */}
                <View style={styles.contentContainer}>
                    <StyledText style={styles.label}>Task Description</StyledText>
                    <View style={styles.inputContainer}>
                        <StyledTextInput
                            placeholder="Update your task.."
                            value={updatedTitle}
                            onChangeText={setUpdateTitle}
                            isError={inputError}
                            multiline={true}
                        />
                    </View>
                    {inputError && (
                        <StyledText style={styles.errorText}>
                            Please enter a task description
                        </StyledText>
                    )}
                </View>

                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                    <StyledButton
                        label="Cancel"
                        onPress={onClose}
                        variant="blue_button"
                    />
                    <StyledButton
                        label="Save"
                        onPress={onPressSave}
                        disabled={inputError}
                        activeOpacity={0.7}
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
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: "#3a3f47",
        minWidth: 300,
    },
    headerContainer: {
        alignItems: "center",
        gap: 12,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(91, 192, 235, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        textAlign: "center",
    },
    divider: {
        height: 0.5,
        backgroundColor: "#3a3f47",
        marginVertical: 20,
    },
    contentContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        color: "#888",
        marginBottom: 5,
    },
    inputContainer: {
        backgroundColor: "#1a1d21",
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: "#3a3f47",
        minHeight: 80,
        overflow: "hidden",
    },
    errorText: {
        fontSize: 12,
        color: COLORS.ERROR_INPUT_TEXT,
        marginTop: 5,
    },
    buttonsContainer: {
        flexDirection: "row",
        marginTop: 25,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
})

export default EditTodoModal
