import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type ArchiveTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onArchive: () => void
};

const ArchiveTodoModal: React.FC<ArchiveTodoModalProps> = ({
    isOpen,
    onClose,
    onArchive,
}) => {
    const { colors, t } = useTheme();

    const handleArchive = () => {
        onArchive()
        onClose()
    }

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={[modalStyles.modalContainer, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: colors.PRIMARY_BORDER_DARK, borderWidth: 1 }]}>
                <View style={[modalStyles.iconContainer, { backgroundColor: "rgba(136, 136, 136, 0.15)" }]}>
                    <Ionicons name="archive-outline" size={28} color="#888" />
                </View>

                <StyledText style={[modalStyles.headerText, { color: colors.PRIMARY_TEXT }]}>{t("archive_confirm_title")}</StyledText>

                <View style={[modalStyles.divider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />

                <StyledText style={[modalStyles.messageText, { color: colors.PRIMARY_TEXT }]}>
                    {t("archive_confirm_message")}
                </StyledText>

                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="blue_button"
                    />
                    <StyledButton
                        label={t("archive_button")}
                        onPress={handleArchive}
                        variant="blue_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default ArchiveTodoModal
