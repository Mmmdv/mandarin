import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { getModalStyles, modalStyles } from "@/constants/modalStyles";
import { schedulePushNotification } from "@/constants/notifications";
import { useDateTimePicker } from "@/hooks/useDateTimePicker";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import { addNotification, selectNotificationById, updateNotificationStatus } from "@/store/slices/notificationSlice";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Platform, Pressable, TextInput, TouchableOpacity, View } from "react-native";
import { getEditStyles } from "./styles";

type EditTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onUpdate: (title: string, reminder?: string, notificationId?: string) => void
    title: Todo["title"]
    reminder?: string
    notificationId?: string
    reminderCancelled?: boolean
    categoryTitle?: string
    categoryIcon?: string
}

const EditTodoModal: React.FC<EditTodoModalProps> = ({
    isOpen, onClose, onUpdate, title, reminder, reminderCancelled, notificationId, categoryTitle, categoryIcon }) => {
    const { t, colors, isDark, notificationsEnabled, todoNotifications, theme } = useTheme();
    const dispatch = useAppDispatch();

    const themedModalStyles = useMemo(() => getModalStyles(colors), [colors]);
    const themedLocalStyles = useMemo(() => getEditStyles(colors, isDark), [colors, isDark]);

    const notification = useAppSelector(state => notificationId ? selectNotificationById(state, notificationId) : undefined);
    const reminderStatus = notification?.status;

    const [isFocused, setIsFocused] = useState(false)
    const [updatedTitle, setUpdateTitle] = useState(title)
    const [inputError, setInputError] = useState(false)

    const inputRef = useRef<TextInput>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const picker = useDateTimePicker({
        initialDate: reminder ? new Date(reminder) : undefined,
        tabSettingEnabled: todoNotifications
    });

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.1 : 1,
            useNativeDriver: false,
            friction: 8,
            tension: 40
        }).start();
    }, [isFocused]);

    useEffect(() => {
        if (inputError && updatedTitle) setInputError(false)
    }, [updatedTitle])

    useEffect(() => {
        if (isOpen) {
            setUpdateTitle(title)
            picker.resetState(reminder ? new Date(reminder) : undefined)
            setInputError(false)
            setIsFocused(false)
        }
    }, [isOpen, title, reminder])

    const onPressSave = async () => {
        if (!updatedTitle.trim()) {
            setInputError(true)
            return
        }

        if (picker.reminderDate && picker.reminderDate < new Date() && picker.reminderDate.toISOString() !== reminder) {
            picker.setShowPastDateAlert(true);
            return;
        }

        let newNotificationId = notificationId;

        if (notificationId && (picker.reminderDate?.toISOString() !== reminder)) {
            try {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
            } catch (error) {
                // silently ignore
            }

            dispatch(updateNotificationStatus({
                id: notificationId,
                status: 'Dəyişdirilib və ləğv olunub'
            }));
        }

        if (picker.reminderDate && notificationsEnabled && todoNotifications && (picker.reminderDate?.toISOString() !== reminder)) {
            const displayTitle = categoryTitle || t("tab_todo");
            const newId = await schedulePushNotification(displayTitle, updatedTitle, picker.reminderDate, categoryIcon);
            newNotificationId = newId;

            if (newId) {
                dispatch(addNotification({
                    id: newId,
                    title: displayTitle,
                    body: updatedTitle,
                    date: picker.reminderDate.toISOString(),
                    status: 'Gözlənilir',
                    categoryIcon,
                }));
            }
        }

        onUpdate(updatedTitle, picker.reminderDate?.toISOString(), newNotificationId)
        onClose()
    }

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={themedLocalStyles.container}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: colors.TAB_BAR,
                    shadowColor: "#5BC0EB",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 2
                }]}>
                    <Ionicons name="create-outline" size={28} color="#5BC0EB" />
                </View>

                <StyledText style={themedLocalStyles.headerText}>{t("edit")}</StyledText>

                <View style={modalStyles.divider} />

                <Pressable onPress={() => inputRef.current?.focus()} style={{ width: '100%', alignItems: 'center', zIndex: 10 }}>
                    <Animated.View style={[
                        themedLocalStyles.inputWrapper,
                        isFocused && themedLocalStyles.inputFocused,
                        inputError && themedLocalStyles.inputError,
                        {
                            minHeight: scaleAnim.interpolate({
                                inputRange: [1, 1.1],
                                outputRange: [60, 120]
                            }),
                            marginTop: scaleAnim.interpolate({
                                inputRange: [1, 1.1],
                                outputRange: [0, 5]
                            }),
                            marginBottom: scaleAnim.interpolate({
                                inputRange: [1, 1.1],
                                outputRange: [12, 15]
                            }),
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}>
                        <TextInput
                            ref={inputRef}
                            style={[themedLocalStyles.textInput, { fontSize: updatedTitle ? 16 : 12 }]}
                            placeholder={t("todo_placeholder")}
                            placeholderTextColor={colors.PLACEHOLDER}
                            value={updatedTitle}
                            onChangeText={setUpdateTitle}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            multiline={true}
                        />
                    </Animated.View>
                </Pressable>

                {/* Reminder Section */}
                <View style={{ marginBottom: 10, width: '100%' }}>
                    {!picker.reminderDate ? (
                        <TouchableOpacity
                            style={themedLocalStyles.addReminderButton}
                            onPress={picker.startReminderFlow}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="notifications-outline" size={20} color={colors.PLACEHOLDER} />
                            <StyledText style={themedLocalStyles.addReminderText}>{t("reminder")}</StyledText>
                            <Ionicons name="add-circle" size={20} color="#5BC0EB" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                    ) : (
                        <View style={themedLocalStyles.reminderChip}>
                            <TouchableOpacity
                                style={themedLocalStyles.chipContent}
                                onPress={picker.startReminderFlow}
                                activeOpacity={0.7}
                            >
                                <Ionicons name={(reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub' || reminderCancelled) ? "notifications-off" : "calendar"} size={18} color="#fff" />
                                <StyledText style={[themedLocalStyles.chipText, (reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub' || reminderCancelled) && { textDecorationLine: 'line-through', opacity: 0.7 }]}>
                                    {picker.formatFullDate(picker.reminderDate)}
                                </StyledText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => picker.setReminderDate(undefined)}
                                style={themedLocalStyles.clearButton}
                            >
                                <Ionicons name="close-circle" size={20} color="#fff" style={{ opacity: 0.8 }} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Android Pickers */}
                {Platform.OS === 'android' && picker.showDatePicker && (
                    <DateTimePicker
                        value={picker.reminderDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={picker.onChangeDate}
                        locale={picker.getLocale()}
                    />
                )}

                {Platform.OS === 'android' && picker.showTimePicker && (
                    <DateTimePicker
                        value={picker.reminderDate || new Date()}
                        mode="time"
                        display="default"
                        onChange={picker.onChangeTime}
                        locale={picker.getLocale()}
                        is24Hour={true}
                    />
                )}

                {/* iOS Pickers */}
                {Platform.OS === 'ios' && (
                    <StyledModal
                        isOpen={picker.showDatePicker || picker.showTimePicker}
                        onClose={picker.closePickers}
                    >
                        <View style={themedModalStyles.modalContainer}>
                            <View style={[themedModalStyles.iconContainer, {
                                backgroundColor: colors.TAB_BAR,
                                shadowColor: picker.showDatePicker ? "#5BC0EB" : colors.REMINDER,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 5
                            }]}>
                                <Ionicons
                                    name={picker.showDatePicker ? "calendar" : "time"}
                                    size={28}
                                    color={picker.showDatePicker ? "#5BC0EB" : colors.REMINDER}
                                />
                            </View>

                            <StyledText style={themedModalStyles.headerText}>
                                {picker.showDatePicker ? t("date") : t("time")}
                            </StyledText>

                            <View style={themedModalStyles.divider} />

                            <View style={{ width: '100%', height: 150, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                <DateTimePicker
                                    value={picker.tempDate || picker.reminderDate || new Date()}
                                    mode={picker.showDatePicker ? "date" : "time"}
                                    display="spinner"
                                    onChange={picker.showDatePicker ? picker.onChangeDate : picker.onChangeTime}
                                    minimumDate={picker.showDatePicker ? new Date() : undefined}
                                    locale={picker.getLocale()}
                                    textColor={colors.PRIMARY_TEXT}
                                    themeVariant={theme}
                                    style={{ width: '100%', transform: [{ scale: 0.85 }] }}
                                />
                            </View>

                            <View style={[themedModalStyles.buttonsContainer, { marginTop: 20 }]}>
                                <StyledButton
                                    label={picker.showTimePicker ? t("back") : t("close")}
                                    onPress={picker.showTimePicker ? picker.goBackToDatePicker : picker.closePickers}
                                    variant="dark_button"
                                    style={{ flex: 1 }}
                                />
                                <StyledButton
                                    label={picker.showDatePicker ? (reminder ? t("back") : t("next")) : t("save")}
                                    onPress={picker.showDatePicker ? (reminder ? picker.goBackToTimePicker : picker.confirmDateIOS) : picker.confirmTimeIOS}
                                    variant="dark_button"
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>
                    </StyledModal>
                )}

                <View style={[modalStyles.buttonsContainer, { marginTop: 8 }]}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                    <StyledButton
                        label={t("save")}
                        onPress={onPressSave}
                        variant="dark_button"
                    />
                </View>

                {/* Permission Modal */}
                <StyledModal isOpen={picker.showPermissionModal} onClose={() => picker.setShowPermissionModal(false)}>
                    <View style={themedModalStyles.modalContainer}>
                        <View style={[themedModalStyles.iconContainer, {
                            backgroundColor: colors.TAB_BAR,
                            shadowColor: colors.REMINDER,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5
                        }]}>
                            <Ionicons name="notifications" size={28} color={colors.REMINDER} />
                        </View>

                        <StyledText style={themedModalStyles.headerText}>{t("enable_notifications")}</StyledText>

                        <View style={themedModalStyles.divider} />

                        <StyledText style={themedModalStyles.messageText}>
                            {t("enable_notifications_desc")}
                        </StyledText>

                        <View style={themedModalStyles.buttonsContainer}>
                            <StyledButton
                                label={t("cancel")}
                                onPress={() => picker.setShowPermissionModal(false)}
                                variant="dark_button"
                            />
                            <StyledButton
                                label={t("enable")}
                                onPress={() => {
                                    dispatch(updateAppSetting({
                                        notificationsEnabled: true,
                                        todoNotifications: true
                                    }));
                                    picker.setShowPermissionModal(false);
                                    setTimeout(() => {
                                        picker.proceedWithReminder();
                                    }, 300);
                                }}
                                variant="dark_button"
                            />
                        </View>
                    </View>
                </StyledModal>

                {/* Past Date Alert Modal */}
                <StyledModal isOpen={picker.showPastDateAlert} onClose={() => picker.setShowPastDateAlert(false)}>
                    <View style={themedModalStyles.modalContainer}>
                        <View style={[themedModalStyles.iconContainer, {
                            backgroundColor: colors.TAB_BAR,
                            shadowColor: "#FFB74D",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5
                        }]}>
                            <Ionicons name="alert-circle" size={28} color="#FFB74D" />
                        </View>

                        <StyledText style={themedModalStyles.headerText}>{t("attention")}</StyledText>

                        <View style={themedModalStyles.divider} />

                        <StyledText style={themedModalStyles.messageText}>
                            {t("past_reminder_error")}
                        </StyledText>

                        <View style={themedModalStyles.buttonsContainer}>
                            <StyledButton
                                label={t("close")}
                                onPress={picker.closePastDateAlert}
                                variant="dark_button"
                            />
                        </View>
                    </View>
                </StyledModal>

            </View>
        </StyledModal>
    )
}

export default EditTodoModal;
