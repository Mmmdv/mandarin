import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type ResetSuccessModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ResetSuccessModal: React.FC<ResetSuccessModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { colors, t } = useTheme();

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={modalStyles.modalContainer}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: colors.SECONDARY_BACKGROUND,
                    shadowColor: colors.CHECKBOX_SUCCESS,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="checkmark-circle" size={28} color={colors.CHECKBOX_SUCCESS} />
                </View>

                <StyledText style={modalStyles.headerText}>{t("success")}</StyledText>

                <View style={modalStyles.divider} />

                <StyledText style={modalStyles.messageText}>
                    {t("reset_success_message")}
                </StyledText>

                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("close")}
                        onPress={onClose}
                        variant="dark_button"
                        style={{ width: '100%' }}
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default ResetSuccessModal;
