import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { COLORS } from "@/constants/ui";
import { useTheme } from "@/hooks/useTheme";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

type EditTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onUpdate: (title: string) => void
    title: Todo["title"]
}

const EditTodoModal: React.FC<EditTodoModalProps> = ({
    isOpen, onClose, onUpdate, title }) => {
    const { t } = useTheme();

    const [isFocused, setIsFocused] = useState(false)
    const [updatedTitle, setUpdateTitle] = useState(title)
    const [inputError, setInputError] = useState(false)

    useEffect(() => {
        if (inputError && updatedTitle) setInputError(false)
    }, [updatedTitle])

    useEffect(() => {
        if (isOpen) {
            setUpdateTitle(title)
            setInputError(false)
            setIsFocused(false)
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
            <View style={modalStyles.modalContainer}>
                <View style={[modalStyles.iconContainer, { backgroundColor: "rgba(91, 192, 235, 0.15)" }]}>
                    <Ionicons name="create-outline" size={28} color="#5BC0EB" />
                </View>

                <StyledText style={modalStyles.headerText}>{t("edit")}</StyledText>

                <View style={modalStyles.divider} />

                <View style={[
                    localStyles.inputWrapper,
                    isFocused && localStyles.inputFocused,
                    inputError && localStyles.inputError
                ]}>
                    <TextInput
                        style={localStyles.textInput}
                        placeholder={t("todo_placeholder")}
                        placeholderTextColor="#666"
                        value={updatedTitle}
                        onChangeText={setUpdateTitle}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        multiline={true}
                    />
                </View>

                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="blue_button"
                    />
                    <StyledButton
                        label={t("save")}
                        onPress={onPressSave}
                        variant="blue_button"
                    />
                </View>
            </View>
        </StyledModal>
    )
}

const localStyles = StyleSheet.create({
    inputWrapper: {
        backgroundColor: "#151616ff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#3a3f47",
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 60,
        width: "100%",
    },
    inputFocused: {
        borderColor: "#888282ff",
        backgroundColor: "#151616ff",
    },
    inputError: {
        borderColor: COLORS.ERROR_INPUT_TEXT,
    },
    textInput: {
        color: COLORS.PRIMARY_TEXT,
        fontSize: 14,
        minHeight: 40,
    },
})

export default EditTodoModal
