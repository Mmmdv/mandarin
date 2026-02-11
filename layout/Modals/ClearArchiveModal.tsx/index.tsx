import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type ClearArchiveModalProps = {
    isOpen: boolean
    onClose: () => void
    onClear: () => void
};

const ClearArchiveModal: React.FC<ClearArchiveModalProps> = ({
    isOpen,
    onClose,
    onClear,
}) => {
    const { colors, t } = useTheme();

    const handleClear = () => {
        onClear()
        onClose()
    }

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={[modalStyles.modalContainer, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: colors.PRIMARY_BORDER_DARK, borderWidth: 1 }]}>
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

                <StyledText style={[modalStyles.headerText, { color: colors.PRIMARY_TEXT }]}>{t("clear_archive_title")}</StyledText>

                <View style={[modalStyles.divider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />

                <StyledText style={[modalStyles.messageText, { color: colors.PRIMARY_TEXT }]}>
                    {t("clear_archive_message")}
                </StyledText>

                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="blue_button"
                    />
                    <StyledButton
                        label={t("clear_archive_title")}
                        onPress={handleClear}
                        variant="delete_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default ClearArchiveModal
