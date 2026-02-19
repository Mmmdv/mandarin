import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

type RetryTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onRetry: (delayType: 'hour' | 'day' | 'week' | 'month') => void
};

const RetryTodoModal: React.FC<RetryTodoModalProps> = ({
    isOpen,
    onClose,
    onRetry }) => {
    const { t, colors } = useTheme();

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={modalStyles.modalContainer}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: colors.SECONDARY_BACKGROUND,
                    shadowColor: "#4F46E5",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="sync-outline" size={28} color="#4F46E5" />
                </View>

                <StyledText style={modalStyles.headerText}>{t("retry_confirm_title")}</StyledText>

                <View style={modalStyles.divider} />

                <StyledText style={modalStyles.messageText}>
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

                <View style={[modalStyles.buttonsContainer, { marginTop: 10 }]}>
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

const styles = StyleSheet.create({
    optionsContainer: {
        width: '100%',
        gap: 10,
        marginVertical: 15,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
    },
    optionButton: {
        flex: 1,
    }
});

export default RetryTodoModal
