import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

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
    const { colors, t, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    return (
        <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true}>
            <View style={styles.container}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: colors.TAB_BAR,
                    shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 2
                }]}>
                    <Ionicons name="checkmark-circle" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                </View>

                <StyledText style={styles.headerText}>{t("success")}</StyledText>

                <View style={modalStyles.divider} />

                <StyledText style={styles.messageText}>
                    {message || t("task_added_success")}
                </StyledText>

                <View style={[modalStyles.buttonsContainer, { marginTop: 10, width: '100%' }]}>
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

