import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, useWindowDimensions } from "react-native";

type TodoMenuModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onRetry?: () => void;
    onDelete?: () => void;
    onArchive?: () => void;
    onView?: () => void;
    isCompleted: boolean;
    isArchived: boolean;
    archiveTodoAvailable: boolean;
    anchorPosition?: { x: number, y: number, width: number, height: number };
};

const TodoMenuModal: React.FC<TodoMenuModalProps> = ({
    isOpen,
    onClose,
    onEdit,
    onRetry,
    onDelete,
    onArchive,
    onView,
    isCompleted,
    isArchived,
    archiveTodoAvailable,
    anchorPosition,
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
                        borderBottomWidth: isLast ? 0 : 0.5,
                    }
                ]}
            >
                <View style={[styles.iconContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }]}>
                    <Ionicons name={icon} size={16} color={color || colors.PRIMARY_TEXT} />
                </View>
                <StyledText style={[styles.menuLabel, { color: colors.PRIMARY_TEXT }]}>{label}</StyledText>
            </TouchableOpacity>
        );
    };

    const getMenuPosition = () => {
        if (!anchorPosition) return {};

        // Calculate position
        const top = anchorPosition.y + anchorPosition.height + 5; // 5px gap

        // Check if the button is on the left or right side of the screen
        const isLeft = anchorPosition.x + (anchorPosition.width / 2) < windowWidth / 2;

        if (isLeft) {
            // Position bottom-right of button (align left edge of menu with left edge of button)
            const left = anchorPosition.x;
            return {
                position: 'absolute' as const,
                top: top,
                left: left < 10 ? 10 : left, // Keep at least 10px from edge
            };
        } else {
            // Position bottom-left of button (align right edge of menu with right edge of button)
            const right = windowWidth - (anchorPosition.x + anchorPosition.width);
            return {
                position: 'absolute' as const,
                top: top,
                right: right < 10 ? 10 : right, // Keep at least 10px from edge
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
                        {/* Common Actions */}
                        {onView && <MenuItem icon="information-circle-outline" label={t("task_details_modal")} onPress={onView} color={colors.PRIMARY_TEXT} />}

                        {/* Active Todo Actions */}
                        {!isCompleted && !isArchived && (
                            <>
                                {onEdit && <MenuItem icon="create-outline" label={t("edit")} onPress={onEdit} color={colors.PRIMARY_TEXT} />}
                                {onRetry && <MenuItem icon="sync-outline" label={t("retry")} onPress={onRetry} color={colors.PRIMARY_TEXT} />}
                            </>
                        )}

                        {/* Completed Todo Actions */}
                        {isCompleted && !isArchived && (
                            <>
                                {onRetry && <MenuItem icon="sync-outline" label={t("retry")} onPress={onRetry} color={colors.PRIMARY_TEXT} />}
                                {archiveTodoAvailable && onArchive && <MenuItem icon="archive-outline" label={t("archive")} onPress={onArchive} color={colors.PRIMARY_TEXT} />}
                            </>
                        )}

                        {/* Common Delete Action */}
                        {!isCompleted && !isArchived && onDelete && (
                            <MenuItem icon="trash-outline" label={t("delete")} onPress={onDelete} color={colors.ERROR_INPUT_TEXT} isLast={true} />
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
        borderWidth: 0.5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
        overflow: 'hidden',
        paddingVertical: 1,
        // Center if no position
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
        width: 32,
        height: 32,
        borderRadius: 10,
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

export default TodoMenuModal;
