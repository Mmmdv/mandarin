import CustomSwitch from "@/components/ui/CustomSwitch";
import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { getModalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateAppSetting, UpdateAppSettingsPayload } from "@/store/slices/appSlice";
import { cancelAllNotifications } from "@/store/slices/notificationSlice";
import { cancelAllReminders, selectTodos } from "@/store/slices/todoSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React, { useMemo } from "react";
import { LayoutAnimation, Linking, Platform, TouchableOpacity, UIManager, View } from "react-native";
import { getSettingsStyles } from "../styles";

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

    const styles = useMemo(() => getSettingsStyles(colors), [colors]);
    const modalThemeStyles = useMemo(() => getModalStyles(colors), [colors]);

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
            dispatch(updateAppSetting({ notificationsEnabled: false }));
            await Notifications.cancelAllScheduledNotificationsAsync();
            dispatch(cancelAllNotifications());
            dispatch(cancelAllReminders());
            setIsConfirmDisableOpen(false);
        } catch (error) {
            console.error("Error disabling notifications:", error);
            setIsConfirmDisableOpen(false);
        }
    };

    const toggleNotificationCategory = async (key: keyof UpdateAppSettingsPayload, value: boolean) => {
        dispatch(updateAppSetting({ [key]: value }));

        if (!value) {
            if (key === 'todoNotifications') {
                try {
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
                <StyledText style={styles.sectionTitle}>{t("notifications")}</StyledText>
                <View style={styles.aboutContainer}>
                    <View style={[styles.aboutRow, !notificationsEnabled && { borderBottomWidth: 0 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons name="notifications" size={20} color={notificationsEnabled ? colors.CHECKBOX_SUCCESS : colors.PLACEHOLDER} />
                            <StyledText style={styles.aboutLabel}>{t("enable_notifications")}</StyledText>
                        </View>
                        <CustomSwitch
                            onValueChange={handleNotificationToggle}
                            value={notificationsEnabled ?? false}
                        />
                    </View>

                    {notificationsEnabled && (
                        <TouchableOpacity
                            style={[styles.aboutRow, { borderBottomWidth: 0 }]}
                            onPress={() => setIsManageModalOpen(true)}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Ionicons name="options-outline" size={20} color={colors.PLACEHOLDER} />
                                <StyledText style={styles.aboutLabel}>{t("manage_notification_categories")}</StyledText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.PLACEHOLDER} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Manage Notification Categories Modal */}
            <StyledModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)}>
                <View style={[modalThemeStyles.modalContainer, { width: '100%', paddingHorizontal: 0 }]}>
                    <View style={[modalThemeStyles.iconContainer, {
                        backgroundColor: colors.TAB_BAR,
                        shadowColor: colors.CHECKBOX_SUCCESS,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                        marginBottom: 10
                    }]}>
                        <Ionicons name="notifications" size={28} color={colors.CHECKBOX_SUCCESS} />
                    </View>

                    <StyledText style={modalThemeStyles.headerText}>{t("manage_notification_categories")}</StyledText>

                    <View style={[modalThemeStyles.divider, { marginVertical: 15, opacity: 0.3 }]} />

                    <View style={{ width: '100%', paddingHorizontal: 20 }}>
                        <View style={styles.aboutContainer}>
                            {subSwitches.map((item, index) => (
                                <View
                                    key={item.key}
                                    style={[styles.aboutRow, {
                                        borderBottomWidth: index < subSwitches.length - 1 ? 0.5 : 0,
                                        paddingVertical: 14,
                                        paddingHorizontal: 16,
                                    }]}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <Ionicons name={item.icon} size={20} color={colors.PRIMARY_TEXT} style={{ opacity: 0.7 }} />
                                        <StyledText style={styles.aboutLabel}>{item.label}</StyledText>
                                    </View>
                                    <CustomSwitch
                                        onValueChange={(value) => toggleNotificationCategory(item.key as any, value)}
                                        value={item.value}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={[modalThemeStyles.buttonsContainer, { paddingHorizontal: 20, marginTop: 24 }]}>
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
                <View style={modalThemeStyles.modalContainer}>
                    <View style={[modalThemeStyles.iconContainer, {
                        backgroundColor: colors.TAB_BAR,
                        shadowColor: "#FF6B6B",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5
                    }]}>
                        <Ionicons name="notifications-off" size={28} color="#FF6B6B" />
                    </View>

                    <StyledText style={modalThemeStyles.headerText}>{t("notifications")}</StyledText>

                    <View style={[modalThemeStyles.divider, { opacity: 0.3 }]} />

                    <StyledText style={modalThemeStyles.messageText}>
                        {t("disable_notifications_confirm")}
                    </StyledText>

                    <View style={modalThemeStyles.buttonsContainer}>
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
