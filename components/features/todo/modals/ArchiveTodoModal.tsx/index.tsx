import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

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
    const { colors, t, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    const handleArchive = () => {
        onArchive()
        onClose()
    }

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
                    <Ionicons name="archive-outline" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                </View>

                <StyledText style={styles.headerText}>{t("archive_confirm_title")}</StyledText>

                <View style={modalStyles.divider} />

                <StyledText style={styles.messageText}>
                    {t("archive_confirm_message")}
                </StyledText>

                <View style={[modalStyles.buttonsContainer, { marginTop: 10 }]}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                    <StyledButton
                        label={t("archive_button")}
                        onPress={handleArchive}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default ArchiveTodoModal;

