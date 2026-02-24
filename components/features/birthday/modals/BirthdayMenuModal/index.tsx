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
    onViewDetails?: () => void;
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
    onViewDetails,
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

        // Estimate menu height based on number of items
        let itemCount = 0;
        if (onViewDetails) itemCount++;
        if (isToday && onGreet) itemCount++;
        if (onReschedule) itemCount++;
        if (onDelete) itemCount++;

        const ESTIMATED_HEIGHT = itemCount * 54 + 2; // padding + borders
        const MARGIN = 10;

        // Determine if menu should open upwards or downwards
        const spaceBelow = windowHeight - (anchorPosition.y + anchorPosition.height + MARGIN);
        const shouldOpenUpwards = spaceBelow < ESTIMATED_HEIGHT && anchorPosition.y > ESTIMATED_HEIGHT;

        let top = anchorPosition.y + anchorPosition.height + 5;
        if (shouldOpenUpwards) {
            top = anchorPosition.y - ESTIMATED_HEIGHT - 5;
        }

        // Final safety check for top boundary
        if (top < MARGIN) top = MARGIN;
        // Final safety check for bottom boundary
        if (top + ESTIMATED_HEIGHT > windowHeight - MARGIN) {
            top = windowHeight - ESTIMATED_HEIGHT - MARGIN;
        }

        const isLeft = anchorPosition.x + (anchorPosition.width / 2) < windowWidth / 2;

        if (isLeft) {
            const left = anchorPosition.x;
            return {
                position: 'absolute' as const,
                top: top,
                left: left < MARGIN ? MARGIN : left,
            };
        } else {
            const right = windowWidth - (anchorPosition.x + anchorPosition.width);
            return {
                position: 'absolute' as const,
                top: top,
                right: right < MARGIN ? MARGIN : right,
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
                        {onViewDetails && (
                            <MenuItem
                                icon="eye-outline"
                                label={t("task_details_modal")}
                                onPress={onViewDetails}
                                color={colors.PRIMARY_TEXT}
                            />
                        )}
                        {isToday && onGreet && (
                            <MenuItem
                                icon="paper-plane-outline"
                                label={alreadyGreeted ? t("birthday_greeting_sent") : t("birthday_send_greeting")}
                                onPress={alreadyGreeted ? undefined : onGreet}
                                disabled={alreadyGreeted}
                            />
                        )}
                        {onReschedule && (
                            <MenuItem
                                icon="notifications-outline"
                                label={t("edit")}
                                onPress={onReschedule}
                                color={colors.PRIMARY_TEXT}
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
