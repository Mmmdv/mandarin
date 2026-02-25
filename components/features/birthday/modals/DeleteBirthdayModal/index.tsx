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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', width: '100%' }}>
                    <View
                        style={[
                            modalStyles.iconContainer,
                            {
                                backgroundColor: colors.SECONDARY_BACKGROUND,
                                shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 2,
                                elevation: 2,
                                width: 42,
                                height: 42,
                                borderRadius: 21,
                                justifyContent: 'center',
                                alignItems: 'center'
                            },
                        ]}
                    >
                        <Ionicons name="trash" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                    </View>

                    <StyledText style={styles.headerText}>
                        {t("birthday_delete_title")}
                    </StyledText>
                </View>

                <View style={modalStyles.divider} />

                <StyledText style={styles.messageText}>
                    {t("birthday_delete_message")}
                </StyledText>

                {name && (
                    <View style={[
                        styles.recipientCard,
                        {
                            backgroundColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER + "80",
                            borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
                            borderWidth: 0.2,
                            marginTop: 8
                        }
                    ]}>
                        <View style={[
                            styles.recipientAvatar,
                            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                        ]}>
                            <StyledText style={{ color: colors.PRIMARY_TEXT, fontSize: 18, fontWeight: 'bold' }}>
                                {name?.charAt(0).toUpperCase()}
                            </StyledText>
                        </View>
                        <View style={styles.recipientInfo}>
                            <StyledText style={[styles.recipientName, { color: colors.PRIMARY_TEXT }]}>
                                {name}
                            </StyledText>
                        </View>
                    </View>
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
