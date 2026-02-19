import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type ArchiveAllModalProps = {
    isOpen: boolean
    onClose: () => void
    onArchiveAll: () => void
};

const ArchiveAllModal: React.FC<ArchiveAllModalProps> = ({
    isOpen,
    onClose,
    onArchiveAll,
}) => {
    const { colors, t } = useTheme();

    const handleArchiveAll = () => {
        onArchiveAll()
        onClose()
    }

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={[modalStyles.modalContainer, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: colors.PRIMARY_BORDER_DARK, borderWidth: 1 }]}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: colors.SECONDARY_BACKGROUND,
                    shadowColor: "#4ECDC4",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="archive-outline" size={28} color="#4ECDC4" />
                </View>

                <StyledText style={[modalStyles.headerText, { color: colors.PRIMARY_TEXT }]}>{t("archive_all_completed_title")}</StyledText>

                <View style={[modalStyles.divider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />

                <StyledText style={[modalStyles.messageText, { color: colors.PRIMARY_TEXT }]}>
                    {t("archive_all_completed_message")}
                </StyledText>

                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                    <StyledButton
                        label={t("archive_button")}
                        onPress={handleArchiveAll}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default ArchiveAllModal;
