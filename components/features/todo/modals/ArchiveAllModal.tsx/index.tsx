import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

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
    const { colors, t, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    const handleArchiveAll = () => {
        onArchiveAll()
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

                <StyledText style={styles.headerText}>{t("archive_all_completed_title")}</StyledText>

                <View style={[modalStyles.divider]} />

                <StyledText style={styles.messageText}>
                    {t("archive_all_completed_message")}
                </StyledText>

                <View style={[modalStyles.buttonsContainer, { marginTop: 10 }]}>
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

