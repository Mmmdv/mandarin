import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, useWindowDimensions } from "react-native";

type BirthdayMenuModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onDelete?: () => void;
    onGreet?: () => void;
    isToday: boolean;
    alreadyGreeted: boolean;
    isCancelled: boolean;
    anchorPosition?: { x: number, y: number, width: number, height: number };
    onReschedule?: () => void;
};

const BirthdayMenuModal: React.FC<BirthdayMenuModalProps> = ({
    isOpen,
    onClose,
    onDelete,
    onGreet,
    isToday,
    alreadyGreeted,
    isCancelled,
    anchorPosition,
    onReschedule,
}) => {
    const { colors, t, isDark } = useTheme();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();

    const MenuItem = ({ icon, label, onPress, color, disabled = false, isLast = false }: { icon: keyof typeof Ionicons.glyphMap, label: string, onPress?: () => void, color?: string, disabled?: boolean, isLast?: boolean }) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    onPress && onPress();
                    onClose();
                }}
                disabled={disabled}
                activeOpacity={0.7}
                style={[
                    styles.menuItem,
                    {
                        opacity: disabled ? 0.3 : 1,
                        borderBottomColor: colors.PRIMARY_BORDER_DARK,
                        borderBottomWidth: isLast ? 0 : 0.2,
                    }
                ]}
            >
                <View style={[styles.iconContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)" }]}>
                    <Ionicons name={icon} size={16} color={color || colors.PRIMARY_TEXT} />
                </View>
                <StyledText style={[styles.menuLabel, { color: colors.PRIMARY_TEXT }]}>{label}</StyledText>
            </TouchableOpacity>
        );
    };

    const getMenuPosition = () => {
        if (!anchorPosition) return {};

        const top = anchorPosition.y + anchorPosition.height + 5;
        const isLeft = anchorPosition.x + (anchorPosition.width / 2) < windowWidth / 2;

        if (isLeft) {
            const left = anchorPosition.x;
            return {
                position: 'absolute' as const,
                top: top,
                left: left < 10 ? 10 : left,
            };
        } else {
            const right = windowWidth - (anchorPosition.x + anchorPosition.width);
            return {
                position: 'absolute' as const,
                top: top,
                right: right < 10 ? 10 : right,
            };
        }
    };

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }]}>
                    <View style={[
                        styles.menuContainer,
                        {
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                            borderColor: colors.PRIMARY_BORDER_DARK,
                            width: windowWidth * 0.45,
                            minWidth: 160,
                            shadowColor: "#000",
                        },
                        anchorPosition ? getMenuPosition() : {}
                    ]}>
                        {isToday && onGreet && (
                            <MenuItem
                                icon={alreadyGreeted ? "checkmark-circle" : "paper-plane-outline"}
                                label={alreadyGreeted ? t("birthday_greeting_sent") : t("birthday_send_greeting")}
                                onPress={alreadyGreeted ? undefined : onGreet}
                                color={alreadyGreeted ? "#4ECDC4" : undefined}
                                disabled={alreadyGreeted}
                            />
                        )}
                        {onReschedule && (
                            <MenuItem
                                icon="notifications-outline"
                                label={t("reschedule")}
                                onPress={onReschedule}
                                color={colors.REMINDER}
                            />
                        )}
                        {onDelete && (
                            <MenuItem
                                icon="trash-outline"
                                label={t("delete")}
                                onPress={onDelete}
                                color={colors.ERROR_INPUT_TEXT}
                                isLast={true}
                            />
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    menuContainer: {
        borderRadius: 16,
        borderWidth: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
        overflow: 'hidden',
        paddingVertical: 1,
        alignSelf: 'center',
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    }
});

export default BirthdayMenuModal;
