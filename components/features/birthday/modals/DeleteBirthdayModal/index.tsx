import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

// ─── Əsas səhifədəki birthday kartına uyğun rəng paleti ───
const BIRTHDAY_PRIMARY = "#9D6506";
const BIRTHDAY_LIGHT = "#D4880F";

type DeleteBirthdayModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    name?: string;
};

const DeleteBirthdayModal: React.FC<DeleteBirthdayModalProps> = ({
    isOpen,
    onClose,
    onDelete,
    name,
}) => {
    const { t, colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.container}>
                <View
                    style={[
                        modalStyles.iconContainer,
                        {
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                            shadowColor: "#FF6B6B",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                            elevation: 2
                        },
                    ]}
                >
                    <Ionicons name="trash" size={28} color="#FF6B6B" />
                </View>

                <StyledText style={styles.headerText}>
                    {t("birthday_delete_title")}
                </StyledText>

                <View style={modalStyles.divider} />

                <StyledText style={styles.messageText}>
                    {t("birthday_delete_message")}
                </StyledText>

                {name && (
                    <StyledText
                        style={[styles.messageText, { fontWeight: "600", color: BIRTHDAY_LIGHT }]}
                    >
                        {name}
                    </StyledText>
                )}

                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                    <StyledButton
                        label={t("delete")}
                        onPress={() => {
                            onDelete();
                            onClose();
                        }}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default React.memo(DeleteBirthdayModal);
