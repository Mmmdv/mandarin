import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { getModalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
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
    const { t, colors } = useTheme();
    const styles = useMemo(() => getModalStyles(colors), [colors]);

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={[styles.iconContainer, {
                    backgroundColor: colors.SECONDARY_BACKGROUND,
                    shadowColor: "#FF6B6B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="trash-outline" size={28} color="#FF6B6B" />
                </View>

                <StyledText style={styles.headerText}>{t("delete_confirm_title")}</StyledText>

                <View style={[styles.divider, { opacity: 0.3 }]} />

                <StyledText style={styles.messageText}>
                    {t("delete_confirm_message")}
                </StyledText>

                <View style={styles.buttonsContainer}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                    <StyledButton
                        label={t("delete")}
                        onPress={onDelete}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default DeleteTodoModal
