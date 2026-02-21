import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { getModalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
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
    const styles = useMemo(() => getModalStyles(colors), [colors]);

    const handleArchiveAll = () => {
        onArchiveAll()
        onClose()
    }

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={[styles.iconContainer, {
                    backgroundColor: colors.TAB_BAR,
                    shadowColor: "#4ECDC4",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="archive-outline" size={28} color="#4ECDC4" />
                </View>

                <StyledText style={styles.headerText}>{t("archive_all_completed_title")}</StyledText>

                <View style={[styles.divider, { opacity: 0.3 }]} />

                <StyledText style={styles.messageText}>
                    {t("archive_all_completed_message")}
                </StyledText>

                <View style={styles.buttonsContainer}>
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
