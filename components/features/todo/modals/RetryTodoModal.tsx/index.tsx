import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

type RetryTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onRetry: (delayType: 'hour' | 'day' | 'week' | 'month') => void
};

const RetryTodoModal: React.FC<RetryTodoModalProps> = ({
    isOpen,
    onClose,
    onRetry
}) => {
    const { t, colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    return (
        <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true}>
            <View style={styles.container}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: colors.TAB_BAR,
                    shadowColor: "#4F46E5",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 2
                }]}>
                    <Ionicons name="sync-outline" size={28} color="#4F46E5" />
                </View>

                <StyledText style={styles.headerText}>{t("retry_confirm_title")}</StyledText>

                <View style={modalStyles.divider} />

                <StyledText style={styles.messageText}>
                    {t("retry_confirm_message")}
                </StyledText>

                <View style={styles.optionsContainer}>
                    <View style={styles.buttonRow}>
                        <StyledButton
                            label={t("retry_1_hour")}
                            onPress={() => onRetry('hour')}
                            variant="dark_button"
                            style={styles.optionButton}
                        />
                        <StyledButton
                            label={t("retry_1_day")}
                            onPress={() => onRetry('day')}
                            variant="dark_button"
                            style={styles.optionButton}
                        />
                    </View>
                    <View style={styles.buttonRow}>
                        <StyledButton
                            label={t("retry_1_week")}
                            onPress={() => onRetry('week')}
                            variant="dark_button"
                            style={styles.optionButton}
                        />
                        <StyledButton
                            label={t("retry_1_month")}
                            onPress={() => onRetry('month')}
                            variant="dark_button"
                            style={styles.optionButton}
                        />
                    </View>
                </View>

                <View style={[modalStyles.buttonsContainer, { justifyContent: "center", marginTop: 8 }]}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="dark_button"
                        style={{ width: '100%' }}
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default RetryTodoModal;

