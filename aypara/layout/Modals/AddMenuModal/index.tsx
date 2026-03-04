import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import React, { useMemo } from "react";
import { Dimensions, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

type AddMenuModalProps = {
    isOpen: boolean
    onClose: () => void
    onAddTask: () => void
    onAddBirthday: () => void
    onAddMovie: () => void
};

const AddMenuModal: React.FC<AddMenuModalProps> = ({
    isOpen,
    onClose,
    onAddTask,
    onAddBirthday,
    onAddMovie
}) => {
    const { colors, t, isDark } = useTheme();
    const { width } = Dimensions.get('window');
    const pathname = usePathname();

    const menuItems = useMemo(() => {
        const items = [
            {
                id: 'task',
                icon: "checkbox-outline" as const,
                label: t("menu_add_task"),
                onPress: onAddTask,
                color: colors.PRIMARY_TEXT,
                disabled: false
            },
            {
                id: 'birthday',
                icon: "gift-outline" as const,
                label: t("menu_add_birthday"),
                onPress: onAddBirthday,
                color: colors.PRIMARY_TEXT,
                disabled: false
            },
            {
                id: 'movie',
                icon: "film-outline" as const,
                label: t("menu_add_movie"),
                onPress: onAddMovie,
                color: colors.PRIMARY_TEXT,
                disabled: true
            }
        ];

        if (pathname.includes('todo')) {
            return items;
        } else if (pathname.includes('birthday')) {
            const task = items[0];
            const birthday = items[1];
            return [birthday, task, items[2]];
        }
        return items;
    }, [pathname, t, isDark, colors, onAddTask, onAddBirthday, onAddMovie]);

    const MenuItem = ({ icon, label, onPress, disabled = false, color }: { icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void, disabled?: boolean, color?: string }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
            style={[
                styles.menuItem,
                {
                    opacity: disabled ? 0.3 : 1,
                    borderBottomColor: colors.PRIMARY_BORDER_DARK,
                    borderBottomWidth: disabled ? 0 : 0.5,
                }
            ]}
        >
            <View style={[
                styles.iconContainer,
                {
                    backgroundColor: isDark
                        ? "rgba(255,255,255,0.12)"
                        : (color ? `${color}15` : "rgba(0,0,0,0.06)")
                }
            ]}>
                <Ionicons name={icon} size={20} color={color || colors.PRIMARY_TEXT} />
            </View>
            <StyledText style={[styles.menuLabel, { color: colors.PRIMARY_TEXT }]}>{label}</StyledText>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <View style={[
                        styles.menuContainer,
                        {
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                            opacity: 0.90,
                            borderColor: colors.PRIMARY_BORDER_DARK,
                            bottom: 68,
                            left: width / 2 + 20,
                        }
                    ]}>
                        {menuItems.map((item, index) => (
                            <MenuItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                onPress={item.onPress}
                                color={item.color}
                                disabled={item.disabled}
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
        backgroundColor: 'rgba(0,0,0,0.70)',
    },
    menuContainer: {
        position: 'absolute',
        width: '35%',
        borderRadius: 16,
        borderWidth: 0.2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
        paddingVertical: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    menuLabel: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    }
});

export default AddMenuModal;
