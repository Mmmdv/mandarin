import StyledButton from "@/components/StyledButton"
import StyledModal from "@/components/StyledModal"
import StyledText from "@/components/StyledText"
import StyledTextInput from "@/components/StyledTextInput"
import { Todo } from "@/types/todo"
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
            <View style={styles.modalContentContainer}>
                <StyledText variant="heading">Edit to do task</StyledText>
                <View style={styles.inputContainer}>
                    <StyledTextInput
                        placeholder="Update your to do task.."
                        value={updatedTitle}
                        onChangeText={setUpdateTitle}
                        isError={inputError}
                    />
                </View>
                <View style={styles.buttonsContainer}>
                    <StyledButton
                        label="Cancel"
                        onPress={onClose}
                        variant="modal_cancel"
                    />
                    <StyledButton
                        label="Save"
                        onPress={onPressSave}
                        disabled={inputError}
                        activeOpacity={0.7}
                        variant="modal_save"
                    />
                </View>
            </View>
        </StyledModal>
    )
}

const styles = StyleSheet.create({
    modalContentContainer: {
        gap: 20
    },
    inputContainer: {
        minHeight: 60,
        width: "100%"

    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    }
})

export default EditTodoModal
