import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
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
    const { colors, t } = useTheme();
    const { width } = Dimensions.get('window');

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
                    borderBottomWidth: disabled ? 0 : 0.2,
                }
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.PRIMARY_INACTIVE_BUTTON }]}>
                <Ionicons name={icon} size={14} color={color || colors.PRIMARY_TEXT} />
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
                        <MenuItem
                            icon="checkbox-outline"
                            label={t("menu_add_task")}
                            onPress={onAddTask}
                            color="#4ECDC4"
                        />
                        <MenuItem
                            icon="gift-outline"
                            label={t("menu_add_birthday")}
                            onPress={onAddBirthday}
                            disabled={false}
                            color="#9D6506"
                        />
                        <View style={{ marginBottom: 0 }}>
                            <MenuItem
                                icon="film-outline"
                                label={t("menu_add_movie")}
                                onPress={onAddMovie}
                                disabled={true}
                            />
                        </View>
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
        width: 150,
        borderRadius: 16,
        borderWidth: 0.2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        paddingVertical: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    iconContainer: {
        width: 20,
        height: 20,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    menuLabel: {
        fontSize: 11,
        fontWeight: '600',
        flex: 1,
    }
});

export default AddMenuModal;
