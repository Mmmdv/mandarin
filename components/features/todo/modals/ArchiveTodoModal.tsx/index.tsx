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
    title: string
};

const ArchiveTodoModal: React.FC<ArchiveTodoModalProps> = ({
    isOpen,
    onClose,
    onArchive,
    title
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', width: '100%', marginBottom: 4 }}>
                    <View style={[modalStyles.iconContainer, {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 2,
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        flexShrink: 0
                    }]}>
                        <Ionicons name="archive-outline" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                    </View>
                    <StyledText style={[styles.headerText, { textAlign: 'left' }]}>{t("archive_confirm_title")}</StyledText>
                </View>

                <View style={modalStyles.divider} />

                <View style={styles.tableContainer}>
                    <View style={[styles.tableRow, { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
                        <View style={[styles.tableLabelColumn, { flex: 0, width: '100%' }]}>
                            <Ionicons name="document-text-outline" size={18} color={colors.SECTION_TEXT} />
                            <StyledText style={styles.tableLabelText}>{t("title")}</StyledText>
                        </View>
                        <View style={[styles.tableValueColumn, { flex: 0, width: '100%', alignItems: 'flex-start', paddingLeft: 28 }]}>
                            <StyledText style={[styles.tableValueText, { textAlign: 'left' }]}>
                                {title}
                            </StyledText>
                        </View>
                    </View>
                </View>

                <StyledText style={[styles.messageText, { marginTop: 16 }]}>
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

