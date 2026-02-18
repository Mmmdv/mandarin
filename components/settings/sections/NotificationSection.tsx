import CustomSwitch from "@/components/CustomSwitch";
import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateAppSetting, UpdateAppSettingsPayload } from "@/store/slices/appSlice";
import { cancelAllNotifications } from "@/store/slices/notificationSlice";
import { cancelAllReminders, selectTodos } from "@/store/slices/todoSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React from "react";
import { LayoutAnimation, Linking, Platform, TouchableOpacity, UIManager, View } from "react-native";
import { styles } from "../styles";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface NotificationSectionProps {
    visible: boolean;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({ visible }) => {
    const {
        colors,
        t,
        notificationsEnabled,
        todoNotifications,
        birthdayNotifications,
        movieNotifications,
        shoppingNotifications,
        eventsNotifications,
        expensesNotifications
    } = useTheme();
    const dispatch = useAppDispatch();
    const todos = useAppSelector(selectTodos);

    const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);
    const [isConfirmDisableOpen, setIsConfirmDisableOpen] = React.useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = React.useState(false);

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
        try {
            // Update global setting
            dispatch(updateAppSetting({ notificationsEnabled: false }));

            // Cancel ALL scheduled notifications in the OS
            await Notifications.cancelAllScheduledNotificationsAsync();

            // Synchronize state and history
            dispatch(cancelAllNotifications());
            dispatch(cancelAllReminders());

            setIsConfirmDisableOpen(false);
        } catch (error) {
            console.error("Error disabling notifications:", error);
            // Even if OS cancellation fails, we should still update state
            setIsConfirmDisableOpen(false);
        }
    };

    const toggleNotificationCategory = async (key: keyof UpdateAppSettingsPayload, value: boolean) => {
        dispatch(updateAppSetting({ [key]: value }));

        if (!value) {
            // If toggling off, handle cancellations and status updates
            if (key === 'todoNotifications') {
                try {
                    // Cancel specifically using todo notification IDs for reliability
                    for (const todo of todos) {
                        if (todo.notificationId && !todo.isCompleted && !todo.isArchived) {
                            await Notifications.cancelScheduledNotificationAsync(todo.notificationId);
                        }
                    }
                } catch (error) {
                    console.error("Error cancelling todo notifications:", error);
                }

                dispatch(cancelAllReminders());
                dispatch(cancelAllNotifications(t("tab_todo")));
            }
        }
    };

    const subSwitches = [
        { key: 'todoNotifications', icon: "list" as const, label: t("notifications_todo"), value: todoNotifications ?? true },
        { key: 'birthdayNotifications', icon: "gift" as const, label: t("notifications_birthday"), value: birthdayNotifications ?? true },
        { key: 'movieNotifications', icon: "videocam" as const, label: t("notifications_movie"), value: movieNotifications ?? true },
        { key: 'shoppingNotifications', icon: "cart" as const, label: t("notifications_shopping"), value: shoppingNotifications ?? true },
        { key: 'eventsNotifications', icon: "ticket" as const, label: t("notifications_events"), value: eventsNotifications ?? true },
        { key: 'expensesNotifications', icon: "wallet" as const, label: t("notifications_expenses"), value: expensesNotifications ?? true },
    ];

    return (
        <>
            <View style={styles.section}>
                <StyledText style={[styles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>{t("notifications")}</StyledText>
                <View style={styles.aboutContainer}>
                    <View style={[styles.aboutRow, { borderColor: colors.PRIMARY_BORDER_DARK, borderBottomWidth: notificationsEnabled ? 1 : 0, backgroundColor: colors.SECONDARY_BACKGROUND }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons name="notifications" size={20} color={notificationsEnabled ? colors.CHECKBOX_SUCCESS : "#888"} />
                            <StyledText style={[styles.aboutLabel, { color: colors.PRIMARY_TEXT }]}>{t("enable_notifications")}</StyledText>
                        </View>
                        <CustomSwitch
                            onValueChange={handleNotificationToggle}
                            value={notificationsEnabled ?? false}
                        />
                    </View>

                    {notificationsEnabled && (
                        <TouchableOpacity
                            style={[styles.aboutRow, { borderColor: colors.PRIMARY_BORDER_DARK, borderBottomWidth: 0, backgroundColor: colors.SECONDARY_BACKGROUND }]}
                            onPress={() => setIsManageModalOpen(true)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Ionicons name="options-outline" size={20} color={colors.PLACEHOLDER} />
                                <StyledText style={[styles.aboutLabel, { color: colors.PRIMARY_TEXT }]}>{t("manage_notification_categories")}</StyledText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.PLACEHOLDER} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Manage Notification Categories Modal */}
            <StyledModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)}>
                <View style={[modalStyles.modalContainer, { width: '100%', paddingHorizontal: 0 }]}>
                    <View style={[modalStyles.iconContainer, {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        shadowColor: colors.CHECKBOX_SUCCESS,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                        marginBottom: 10
                    }]}>
                        <Ionicons name="notifications" size={28} color={colors.CHECKBOX_SUCCESS} />
                    </View>

                    <StyledText style={modalStyles.headerText}>{t("manage_notification_categories")}</StyledText>

                    <View style={[modalStyles.divider, { marginVertical: 15 }]} />

                    <View style={{ width: '100%', paddingHorizontal: 20 }}>
                        {subSwitches.map((item, index) => (
                            <View
                                key={item.key}
                                style={[styles.aboutRow, {
                                    borderBottomWidth: index < subSwitches.length - 1 ? 1 : 0,
                                    borderColor: colors.PRIMARY_BORDER_DARK,
                                    paddingVertical: 14,
                                    paddingHorizontal: 0,
                                    backgroundColor: colors.SECONDARY_BACKGROUND
                                }]}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Ionicons name={item.icon} size={20} color={colors.PRIMARY_TEXT} style={{ opacity: 0.7 }} />
                                    <StyledText style={[styles.aboutLabel, { color: colors.PRIMARY_TEXT, fontSize: 16 }]}>{item.label}</StyledText>
                                </View>
                                <CustomSwitch
                                    onValueChange={(value) => toggleNotificationCategory(item.key as any, value)}
                                    value={item.value}
                                />
                            </View>
                        ))}
                    </View>

                    <View style={[modalStyles.buttonsContainer, { paddingHorizontal: 20, marginTop: 20 }]}>
                        <StyledButton
                            label={t("close")}
                            onPress={() => setIsManageModalOpen(false)}
                            variant="dark_button"
                            style={{ width: '100%' }}
                        />
                    </View>
                </View>
            </StyledModal>

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
