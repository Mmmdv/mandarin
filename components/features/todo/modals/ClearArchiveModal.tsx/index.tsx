import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

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
    const { colors, t, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    const handleClear = () => {
        onClear()
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
                    <Ionicons name="trash-outline" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                </View>

                <StyledText style={styles.headerText}>{t("clear_archive_title")}</StyledText>

                <View style={modalStyles.divider} />

                <StyledText style={styles.messageText}>
                    {t("clear_archive_message")}
                </StyledText>

                <View style={[modalStyles.buttonsContainer, { marginTop: 10 }]}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                    <StyledButton
                        label={t("clear_archive_title")}
                        onPress={handleClear}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default ClearArchiveModal;

