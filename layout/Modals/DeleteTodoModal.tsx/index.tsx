import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type DeleteTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onDelete: () => void
};

const DeleteTodoModal: React.FC<DeleteTodoModalProps> = ({
    isOpen,
    onClose,
    onDelete }) => {
    const { t } = useTheme();

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={modalStyles.modalContainer}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: useTheme().colors.SECONDARY_BACKGROUND,
                    shadowColor: "#FF6B6B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="trash-outline" size={28} color="#FF6B6B" />
                </View>

                <StyledText style={modalStyles.headerText}>{t("delete_confirm_title")}</StyledText>

                <View style={modalStyles.divider} />

                <StyledText style={modalStyles.messageText}>
                    {t("delete_confirm_message")}
                </StyledText>

                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="blue_button"
                    />
                    <StyledButton
                        label={t("delete")}
                        onPress={onDelete}
                        variant="blue_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default DeleteTodoModal
