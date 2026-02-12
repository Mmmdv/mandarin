import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import { cancelAllNotifications } from "@/store/slices/notificationSlice";
import { cancelAllReminders, selectTodos } from "@/store/slices/todoSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React from "react";
import { LayoutAnimation, Linking, Platform, Switch, UIManager, View } from "react-native";
import { styles } from "../styles";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface NotificationSectionProps {
    visible: boolean;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({ visible }) => {
    const { colors, t, notificationsEnabled, todoNotifications, birthdayNotifications, movieNotifications } = useTheme();
    const dispatch = useAppDispatch();
    const todos = useAppSelector(selectTodos);

    const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);
    const [isConfirmDisableOpen, setIsConfirmDisableOpen] = React.useState(false);

    React.useEffect(() => {
        if (visible) {
            checkPermissions();
        }
    }, [visible]);

    const checkPermissions = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted' && notificationsEnabled) {
            dispatch(updateAppSetting({ notificationsEnabled: false }));
        }
    };

    const handleNotificationToggle = async (value: boolean) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (value) {
            setIsLoadingNotifications(true);
            const { status } = await Notifications.getPermissionsAsync();

            if (status === 'granted') {
                dispatch(updateAppSetting({ notificationsEnabled: true }));
            } else {
                const { status: newStatus } = await Notifications.requestPermissionsAsync();
                if (newStatus === 'granted') {
                    dispatch(updateAppSetting({ notificationsEnabled: true }));
                } else {
                    dispatch(updateAppSetting({ notificationsEnabled: false }));
                    Linking.openSettings();
                }
            }
            setIsLoadingNotifications(false);
        } else {
            const hasActiveReminders = todos.some(todo =>
                !todo.isCompleted &&
                !todo.isArchived &&
                todo.reminder &&
                new Date(todo.reminder) > new Date() &&
                !todo.reminderCancelled
            );

            if (hasActiveReminders) {
                setIsConfirmDisableOpen(true);
            } else {
                confirmDisableNotifications();
            }
        }
    };

    const confirmDisableNotifications = async () => {
        dispatch(updateAppSetting({ notificationsEnabled: false }));
        await Notifications.cancelAllScheduledNotificationsAsync();
        dispatch(cancelAllNotifications());
        dispatch(cancelAllReminders());
        setIsConfirmDisableOpen(false);
    };

    const toggleTodoNotifications = (value: boolean) => {
        dispatch(updateAppSetting({ todoNotifications: value }));
    };

    const toggleBirthdayNotifications = (value: boolean) => {
        dispatch(updateAppSetting({ birthdayNotifications: value }));
    };

    const toggleMovieNotifications = (value: boolean) => {
        dispatch(updateAppSetting({ movieNotifications: value }));
    };

    const subSwitches = [
        { icon: "list" as const, label: t("notifications_todo"), value: todoNotifications ?? true, onToggle: toggleTodoNotifications },
        { icon: "gift" as const, label: t("notifications_birthday"), value: birthdayNotifications ?? true, onToggle: toggleBirthdayNotifications },
        { icon: "videocam" as const, label: t("notifications_movie"), value: movieNotifications ?? true, onToggle: toggleMovieNotifications },
    ];

    return (
        <>
            <View style={styles.section}>
                <StyledText style={[styles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>{t("notifications")}</StyledText>
                <View style={styles.aboutContainer}>
                    <View style={[styles.aboutRow, { borderColor: colors.PRIMARY_BORDER_DARK, borderBottomWidth: 0 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons name="notifications" size={20} color={notificationsEnabled ? colors.CHECKBOX_SUCCESS : "#888"} />
                            <StyledText style={[styles.aboutLabel, { color: colors.PRIMARY_TEXT }]}>{t("enable_notifications")}</StyledText>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: colors.CHECKBOX_SUCCESS }}
                            thumbColor={"#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={handleNotificationToggle}
                            value={notificationsEnabled ?? false}
                        />
                    </View>

                    {notificationsEnabled && (
                        <View style={{
                            borderRadius: 12,
                            marginHorizontal: 4,
                            marginBottom: 0,
                            marginTop: 0,
                            paddingVertical: 4
                        }}>
                            {subSwitches.map((item, index) => (
                                <View
                                    key={item.icon}
                                    style={[styles.aboutRow, {
                                        borderBottomWidth: index < subSwitches.length - 1 ? 1 : 0,
                                        borderColor: colors.PRIMARY_BORDER_DARK,
                                        paddingHorizontal: 12
                                    }]}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name={item.icon} size={18} color={colors.PRIMARY_TEXT} style={{ opacity: 0.7 }} />
                                        <StyledText style={[styles.aboutLabel, { color: colors.PRIMARY_TEXT, fontSize: 15 }]}>{item.label}</StyledText>
                                    </View>
                                    <Switch
                                        trackColor={{ false: "#767577", true: colors.CHECKBOX_SUCCESS }}
                                        thumbColor={"#f4f3f4"}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={item.onToggle}
                                        value={item.value}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            {/* Notification Disable Confirmation Modal */}
            <StyledModal isOpen={isConfirmDisableOpen} onClose={() => setIsConfirmDisableOpen(false)}>
                <View style={modalStyles.modalContainer}>
                    <View style={[modalStyles.iconContainer, {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        shadowColor: "#FF6B6B",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5
                    }]}>
                        <Ionicons name="notifications-off" size={28} color={colors.ERROR_INPUT_TEXT} />
                    </View>

                    <StyledText style={modalStyles.headerText}>{t("notifications")}</StyledText>

                    <View style={modalStyles.divider} />

                    <StyledText style={modalStyles.messageText}>
                        {t("disable_notifications_confirm")}
                    </StyledText>

                    <View style={modalStyles.buttonsContainer}>
                        <StyledButton
                            label={t("cancel")}
                            onPress={() => setIsConfirmDisableOpen(false)}
                            variant="dark_button"
                        />
                        <StyledButton
                            label={t("delete")}
                            onPress={confirmDisableNotifications}
                            variant="dark_button"
                        />
                    </View>
                </View>
            </StyledModal>
        </>
    );
};

export default NotificationSection;
