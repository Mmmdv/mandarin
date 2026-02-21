import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { getModalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
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
    const styles = useMemo(() => getModalStyles(colors), [colors]);

    const handleArchive = () => {
        onArchive()
        onClose()
    }

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={[styles.iconContainer, {
                    backgroundColor: colors.TAB_BAR,
                    shadowColor: colors.PLACEHOLDER,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="archive-outline" size={28} color={colors.PLACEHOLDER} />
                </View>

                <StyledText style={styles.headerText}>{t("archive_confirm_title")}</StyledText>

                <View style={[styles.divider, { opacity: 0.3 }]} />

                <StyledText style={styles.messageText}>
                    {t("archive_confirm_message")}
                </StyledText>

                <View style={styles.buttonsContainer}>
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
