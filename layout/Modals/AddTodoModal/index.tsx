import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { COLORS } from "@/constants/ui";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import { schedulePushNotification } from "@/constants/notifications";
import { useAppDispatch } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import { addNotification } from "@/store/slices/notificationSlice";

type AddTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onAdd: (title: string, reminder?: string, notificationId?: string) => void
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({
    isOpen, onClose, onAdd }) => {
    const { t, lang, notificationsEnabled } = useTheme();
    const dispatch = useAppDispatch();

    const [isFocused, setIsFocused] = useState(false)
    const [title, setTitle] = useState("")
    const [inputError, setInputError] = useState(false)

    // Reminder state
    const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined)

    // Picker visibility controls
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [tempDate, setTempDate] = useState<Date | undefined>(undefined) // For iOS intermediate state

    const inputRef = useRef<TextInput>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.1 : 1,
            useNativeDriver: false, // Required for layout animation (minHeight)
            friction: 8,
            tension: 40
        }).start();
    }, [isFocused]);

    useEffect(() => {
        if (inputError && title) setInputError(false)
    }, [title])

    useEffect(() => {
        if (isOpen) {
            setTitle("")
            setInputError(false)
            setIsFocused(false)
            setReminderDate(undefined)
        }
    }, [isOpen])

    const onPressAdd = async (dateOverride?: Date) => {
        if (!title.trim()) {
            setInputError(true)
            return
        }
        const finalDate = dateOverride || reminderDate;
        let notificationId: string | undefined;

        if (finalDate && notificationsEnabled) {
            notificationId = await schedulePushNotification(title, t("reminder"), finalDate);
            // Add to history
            if (notificationId) {
                dispatch(addNotification({
                    id: notificationId,
                    title: t("reminder"),
                    body: `${t("title")}: ${title}`,
                    date: finalDate.toISOString(),
                }));
            }
        }

        onAdd(title, finalDate?.toISOString(), notificationId)
        onClose()
    }

    const startReminderFlow = () => {
        Haptics.selectionAsync();

        if (!notificationsEnabled) {
            setShowPermissionModal(true);
            return;
        }
        proceedWithReminder();
    }

    const proceedWithReminder = () => {
        if (Platform.OS === 'ios') {
            setTempDate(new Date());
        }
        setShowDatePicker(true);
    }

    const onChangeDate = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            if (Platform.OS === 'android') {
                if (event.type === 'dismissed') {
                    setShowDatePicker(false);
                    return;
                }
                setShowDatePicker(false);
                const newDate = new Date(selectedDate);

                if (!reminderDate) {
                    const now = new Date();
                    newDate.setHours(now.getHours() + 1);
                    newDate.setMinutes(0);
                } else {
                    newDate.setHours(reminderDate.getHours());
                    newDate.setMinutes(reminderDate.getMinutes());
                }

                setReminderDate(newDate);

                // Auto-trigger time picker on Android
                setTimeout(() => {
                    setShowTimePicker(true);
                }, 0);
            } else {
                // iOS: Update temp state only
                setTempDate(selectedDate);
            }
        } else {
            if (Platform.OS === 'android') setShowDatePicker(false);
        }
    };

    const confirmDateIOS = () => {
        const newDate = tempDate || new Date();
        // Default logic same as Android
        if (!reminderDate) {
            const now = new Date();
            newDate.setHours(now.getHours() + 1);
            newDate.setMinutes(0);
        } else {
            newDate.setHours(reminderDate.getHours());
            newDate.setMinutes(reminderDate.getMinutes());
        }

        // Validate Day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(newDate);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate < today) {
            setTimeout(() => {
                setShowPastDateAlert(true);
            }, 100);
            return;
        }

        // removed setReminderDate(newDate) - wait for time confirmation
        setTempDate(newDate); // Pass to time picker via temp state
        setShowDatePicker(false);
        setTimeout(() => {
            setShowTimePicker(true);
        }, 350); // Small delay for smooth transition
    };

    const onChangeTime = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            if (Platform.OS === 'android') {
                if (event.type === 'dismissed') {
                    setShowTimePicker(false);
                    return;
                }
                setShowTimePicker(false);

                const currentReminder = reminderDate || new Date();
                const newDate = new Date(currentReminder);

                newDate.setHours(selectedTime.getHours());
                newDate.setMinutes(selectedTime.getMinutes());

                if (newDate < new Date()) {
                    setShowTimePicker(false); // Close picker first
                    // Slight delay to ensure picker is gone/closed
                    setTimeout(() => {
                        setShowPastDateAlert(true);
                    }, 100);
                    return;
                }

                setReminderDate(newDate);

                // Auto-save
                setTimeout(() => {
                    onPressAdd(newDate);
                }, 100);
            } else {
                // iOS: Update temp state only
                const currentReminder = tempDate || reminderDate || new Date();
                const newDate = new Date(currentReminder);

                newDate.setHours(selectedTime.getHours());
                newDate.setMinutes(selectedTime.getMinutes());

                setTempDate(newDate);
            }
        } else {
            if (Platform.OS === 'android') setShowTimePicker(false);
        }
    }

    const confirmTimeIOS = () => {
        const finalDate = tempDate || reminderDate || new Date();

        if (finalDate < new Date()) {
            setShowTimePicker(false);
            setTimeout(() => {
                setShowPastDateAlert(true);
            }, 100);
            return;
        }

        setReminderDate(finalDate); // Validate and Save
        setShowTimePicker(false);
        // Note: Auto-save onPressAdd not needed here, user still needs to click Add Task
    };

    // Locale helper
    const getLocale = () => {
        switch (lang) {
            case 'az': return 'az-AZ';
            case 'ru': return 'ru-RU';
            default: return 'en-US';
        }
    }

    const formatFullDate = (date: Date) => {
        return date.toLocaleString(getLocale(), {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Permission Modal state
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showPastDateAlert, setShowPastDateAlert] = useState(false);

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={modalStyles.modalContainer}>
                    <View style={[modalStyles.iconContainer, {
                        backgroundColor: COLORS.SECONDARY_BACKGROUND,
                        shadowColor: COLORS.CHECKBOX_SUCCESS,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5
                    }]}>
                        <Ionicons name="add" size={28} color={COLORS.CHECKBOX_SUCCESS} />
                    </View>

                    <StyledText style={modalStyles.headerText}>{t("add")}</StyledText>

                    <View style={modalStyles.divider} />

                    <Pressable onPress={() => inputRef.current?.focus()} style={{ width: '100%', alignItems: 'center', zIndex: 10 }}>
                        <Animated.View style={[
                            localStyles.inputWrapper,
                            isFocused && localStyles.inputFocused,
                            inputError && localStyles.inputError,
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
                                style={[localStyles.textInput, { fontSize: title ? 16 : 12 }]}
                                placeholder={t("todo_placeholder")}
                                placeholderTextColor="#666"
                                value={title}
                                onChangeText={setTitle}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                multiline={true}
                            />
                        </Animated.View>
                    </Pressable>

                    {/* Simplified Reminder Section */}
                    <View style={{ marginBottom: 10 }}>
                        {!reminderDate ? (
                            <TouchableOpacity
                                style={localStyles.addReminderButton}
                                onPress={startReminderFlow}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="notifications-outline" size={20} color="#888" />
                                <StyledText style={localStyles.addReminderText}>{t("reminder")}</StyledText>
                                <Ionicons name="add-circle" size={20} color={COLORS.CHECKBOX_SUCCESS} style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        ) : (
                            <View style={localStyles.reminderChip}>
                                <TouchableOpacity
                                    style={localStyles.chipContent}
                                    onPress={startReminderFlow}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="calendar" size={18} color="#fff" />
                                    <StyledText style={localStyles.chipText}>
                                        {formatFullDate(reminderDate)}
                                    </StyledText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setReminderDate(undefined)}
                                    style={localStyles.clearButton}
                                >
                                    <Ionicons name="close-circle" size={20} color="#fff" style={{ opacity: 0.8 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Android Pickers */}
                    {Platform.OS === 'android' && showDatePicker && (
                        <DateTimePicker
                            value={reminderDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                            minimumDate={new Date()}
                            locale={getLocale()}
                        />
                    )}

                    {Platform.OS === 'android' && showTimePicker && (
                        <DateTimePicker
                            value={reminderDate || new Date()}
                            mode="time"
                            display="default"
                            onChange={onChangeTime}
                            locale={getLocale()}
                            is24Hour={true}
                        />
                    )}

                    {/* iOS Pickers Wrapper */}
                    {Platform.OS === 'ios' && (
                        <StyledModal
                            isOpen={showDatePicker || showTimePicker}
                            onClose={() => {
                                setShowDatePicker(false);
                                setShowTimePicker(false);
                            }}
                        >
                            <View style={modalStyles.modalContainer}>
                                <View style={[modalStyles.iconContainer, {
                                    backgroundColor: COLORS.SECONDARY_BACKGROUND,
                                    shadowColor: showDatePicker ? "#5BC0EB" : "#FFD166",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 5
                                }]}>
                                    <Ionicons
                                        name={showDatePicker ? "calendar" : "time"}
                                        size={28}
                                        color={showDatePicker ? "#5BC0EB" : "#FFD166"}
                                    />
                                </View>

                                <StyledText style={modalStyles.headerText}>
                                    {showDatePicker ? t("date") : t("time")}
                                </StyledText>

                                <View style={modalStyles.divider} />

                                <View style={{ width: '100%', height: 150, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                    <DateTimePicker
                                        value={tempDate || reminderDate || new Date()}
                                        mode={showDatePicker ? "date" : "time"}
                                        display="spinner"
                                        onChange={showDatePicker ? onChangeDate : onChangeTime}
                                        minimumDate={showDatePicker ? new Date() : undefined}
                                        locale={getLocale()}
                                        textColor={COLORS.PRIMARY_TEXT}
                                        themeVariant={useTheme().theme}
                                        style={{ width: '100%', transform: [{ scale: 0.85 }] }}
                                    />
                                </View>

                                <View style={[modalStyles.buttonsContainer, { marginTop: 20 }]}>
                                    <StyledButton
                                        label={t("cancel")}
                                        onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }}
                                        variant="dark_button"
                                        style={{ flex: 1 }}
                                    />
                                    <StyledButton
                                        label={showDatePicker ? t("next") : t("save")}
                                        onPress={showDatePicker ? confirmDateIOS : confirmTimeIOS}
                                        variant="dark_button"
                                        style={{ flex: 1 }}
                                    />
                                </View>
                            </View>
                        </StyledModal>
                    )}

                    <View style={modalStyles.buttonsContainer}>
                        <StyledButton
                            label={t("cancel")}
                            onPress={onClose}
                            variant="dark_button"
                        />
                        <StyledButton
                            label={t("add")}
                            onPress={() => onPressAdd()}
                            variant="dark_button"
                        />
                    </View>

                    {/* Permission Modal */}
                    <StyledModal isOpen={showPermissionModal} onClose={() => setShowPermissionModal(false)}>
                        <View style={modalStyles.modalContainer}>
                            <View style={[modalStyles.iconContainer, {
                                backgroundColor: COLORS.SECONDARY_BACKGROUND,
                                shadowColor: "#FFD166",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 5
                            }]}>
                                <Ionicons name="notifications" size={28} color="#FFD166" />
                            </View>

                            <StyledText style={modalStyles.headerText}>{t("enable_notifications")}</StyledText>

                            <View style={modalStyles.divider} />

                            <StyledText style={modalStyles.messageText}>
                                {t("enable_notifications_desc")}
                            </StyledText>

                            <View style={modalStyles.buttonsContainer}>
                                <StyledButton
                                    label={t("cancel")}
                                    onPress={() => setShowPermissionModal(false)}
                                    variant="dark_button"
                                />
                                <StyledButton
                                    label={t("enable")}
                                    onPress={() => {
                                        dispatch(updateAppSetting({ notificationsEnabled: true }));
                                        setShowPermissionModal(false);
                                        // Slight delay to allow modal close animation before opening picker
                                        setTimeout(() => {
                                            proceedWithReminder();
                                        }, 300);
                                    }}
                                    variant="dark_button"
                                />
                            </View>
                        </View>
                    </StyledModal>

                    {/* Past Date Alert Modal */}
                    <StyledModal isOpen={showPastDateAlert} onClose={() => setShowPastDateAlert(false)}>
                        <View style={modalStyles.modalContainer}>
                            <View style={[modalStyles.iconContainer, {
                                backgroundColor: COLORS.SECONDARY_BACKGROUND,
                                shadowColor: "#FFB74D",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 5
                            }]}>
                                <Ionicons name="alert-circle" size={28} color="#FFB74D" />
                            </View>

                            <StyledText style={modalStyles.headerText}>{t("attention")}</StyledText>

                            <View style={modalStyles.divider} />

                            <StyledText style={modalStyles.messageText}>
                                {t("past_reminder_error")}
                            </StyledText>

                            <View style={modalStyles.buttonsContainer}>
                                <StyledButton
                                    label={t("close")}
                                    onPress={() => setShowPastDateAlert(false)}
                                    variant="dark_button"
                                />
                            </View>
                        </View>
                    </StyledModal>

                </View>
            </TouchableWithoutFeedback>
        </StyledModal>
    )
}

const localStyles = StyleSheet.create({
    inputWrapper: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 60,
        width: "100%",
        // marginBottom removed, handled by animation
    },
    inputFocused: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderColor: "rgba(255, 255, 255, 0.3)",
        borderWidth: 1,
        shadowColor: "rgba(255, 255, 255, 0.5)",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    inputError: {
        borderColor: COLORS.ERROR_INPUT_TEXT,
    },
    textInput: {
        color: COLORS.PRIMARY_TEXT,
        fontSize: 16,
        minHeight: 40,
        textAlign: 'left',
        textAlignVertical: 'center',
        paddingHorizontal: 8,
        lineHeight: 16, // Reduced line spacing
    },
    addReminderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: "#151616ff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#3a3f47",
        gap: 10,
    },
    addReminderText: {
        color: "#888",
        fontSize: 14,
        fontWeight: "500",
    },
    reminderChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#5BC0EB", // Changed from CHECKBOX_SUCCESS (turquoise) to Sky Blue
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 40, // Increased to account for absolute button
        position: 'relative',
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    chipText: {
        color: "#000", // Darker text as requested
        fontSize: 15,
        fontWeight: "600",
        textAlign: 'center',
    },
    clearButton: {
        position: 'absolute',
        right: 10,
        padding: 4,
    },
    iosPickerContainer: {
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 20,
        paddingBottom: 20,
        width: '100%',
        overflow: 'hidden', // Clip the picker highlight
    },
    iosHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    iosTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.PRIMARY_TEXT,
    },
    iconButton: {
        padding: 4,
    },
    pickerWrapper: {
        marginTop: 10,
        width: '100%',
        height: 150,
        justifyContent: 'center',
        overflow: 'hidden',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)', // Thin separator lines
    }
})

export default AddTodoModal
