import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type ResetAppModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onReset: () => void;
};

const ResetAppModal: React.FC<ResetAppModalProps> = ({
    isOpen,
    onClose,
    onReset,
}) => {
    const { colors, t } = useTheme();

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={modalStyles.modalContainer}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: colors.SECONDARY_BACKGROUND,
                    shadowColor: "#FF6B6B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="trash-bin" size={28} color="#FF6B6B" />
                </View>

                <StyledText style={modalStyles.headerText}>{t("reset_factory_confirm_title")}</StyledText>

                <View style={modalStyles.divider} />

                <StyledText style={modalStyles.messageText}>
                    {t("reset_factory_confirm_message")}
                </StyledText>

                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                    <StyledButton
                        label={t("reset_factory")}
                        onPress={onReset}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default ResetAppModal;
