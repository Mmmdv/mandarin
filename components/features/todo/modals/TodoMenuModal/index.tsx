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

        // Calculate visible items to get accurate height
        let visibleItems = [];
        if (onView) visibleItems.push('view');

        if (!isCompleted && !isArchived) {
            if (onEdit) visibleItems.push('edit');
            if (onRetry) visibleItems.push('retry');
            if (onDelete) visibleItems.push('delete');
        } else if (isCompleted && !isArchived) {
            if (onRetry) visibleItems.push('retry');
            if (archiveTodoAvailable && onArchive) visibleItems.push('archive');
            if (onDelete) visibleItems.push('delete'); // Allow delete for completed too
        } else if (isArchived) {
            if (onDelete) visibleItems.push('delete');
        }

        const ITEM_HEIGHT = 54;
        const ESTIMATED_HEIGHT = visibleItems.length * ITEM_HEIGHT + 2;
        const MARGIN = 10;
        const SCREEN_MARGIN = 20;

        // Determine if menu should open upwards or downwards
        const spaceBelow = windowHeight - (anchorPosition.y + anchorPosition.height + MARGIN);
        const shouldOpenUpwards = spaceBelow < ESTIMATED_HEIGHT && anchorPosition.y > ESTIMATED_HEIGHT;

        let top = anchorPosition.y + anchorPosition.height + 5;
        if (shouldOpenUpwards) {
            top = anchorPosition.y - ESTIMATED_HEIGHT - 5;
        }

        // Safety checks for screen boundaries
        if (top < SCREEN_MARGIN) top = SCREEN_MARGIN;
        if (top + ESTIMATED_HEIGHT > windowHeight - SCREEN_MARGIN) {
            top = windowHeight - ESTIMATED_HEIGHT - SCREEN_MARGIN;
        }

        const isLeft = anchorPosition.x + (anchorPosition.width / 2) < windowWidth / 2;

        if (isLeft) {
            let left = anchorPosition.x;
            if (left < MARGIN) left = MARGIN;
            return {
                position: 'absolute' as const,
                top: top,
                left: left,
            };
        } else {
            let right = windowWidth - (anchorPosition.x + anchorPosition.width);
            if (right < MARGIN) right = MARGIN;
            return {
                position: 'absolute' as const,
                top: top,
                right: right,
            };
        }
    };

    const getVisibleItems = () => {
        let items = [];
        if (onView) items.push({ id: 'view', icon: 'eye-outline', label: t("task_details_modal"), onPress: onView, color: colors.PRIMARY_TEXT });

        if (!isCompleted && !isArchived) {
            if (onEdit) items.push({ id: 'edit', icon: 'create-outline', label: t("edit"), onPress: onEdit, color: colors.PRIMARY_TEXT });
            if (onRetry) items.push({ id: 'retry', icon: 'sync-outline', label: t("retry"), onPress: onRetry, color: colors.PRIMARY_TEXT });
            if (onDelete) items.push({ id: 'delete', icon: 'trash-outline', label: t("delete"), onPress: onDelete, color: colors.ERROR_INPUT_TEXT });
        } else if (isCompleted && !isArchived) {
            if (onRetry) items.push({ id: 'retry', icon: 'sync-outline', label: t("retry"), onPress: onRetry, color: colors.PRIMARY_TEXT });
            if (archiveTodoAvailable && onArchive) items.push({ id: 'archive', icon: 'archive-outline', label: t("archive_action"), onPress: onArchive, color: colors.PRIMARY_TEXT });
            if (onDelete) items.push({ id: 'delete', icon: 'trash-outline', label: t("delete"), onPress: onDelete, color: colors.ERROR_INPUT_TEXT });
        } else if (isArchived) {
            if (onDelete) items.push({ id: 'delete', icon: 'trash-outline', label: t("delete"), onPress: onDelete, color: colors.ERROR_INPUT_TEXT });
        }
        return items;
    };

    const menuItems = getVisibleItems();

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
                            minWidth: 170,
                            shadowColor: "#000",
                        },
                        anchorPosition ? getMenuPosition() : {}
                    ]}>
                        {menuItems.map((item, index) => (
                            <MenuItem
                                key={item.id}
                                icon={item.icon as any}
                                label={item.label}
                                onPress={item.onPress}
                                color={item.color}
                                isLast={index === menuItems.length - 1}
                            />
                        ))}
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

export default TodoMenuModal;
