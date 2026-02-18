import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

type TaskSuccessModalProps = {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
};

const TaskSuccessModal: React.FC<TaskSuccessModalProps> = ({
    isOpen,
    onClose,
    message,
}) => {
    const { colors, t } = useTheme();

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={modalStyles.modalContainer}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    shadowColor: "#4CAF50",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                </View>

                <StyledText style={modalStyles.headerText}>{t("success")}</StyledText>

                <View style={modalStyles.divider} />

                <StyledText style={modalStyles.messageText}>
                    {message || t("task_added_success")}
                </StyledText>

                <View style={[modalStyles.buttonsContainer, { width: '100%' }]}>
                    <StyledButton
                        label={t("close")}
                        onPress={onClose}
                        variant="dark_button"
                        style={{ flex: 1 }}
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default TaskSuccessModal;
