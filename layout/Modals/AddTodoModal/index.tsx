import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { schedulePushNotification } from "@/constants/notifications";
import { COLORS } from "@/constants/ui";
import { useDateTimePicker } from "@/hooks/useDateTimePicker";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, Platform, Pressable, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { localStyles } from "./styles";

type AddTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onAdd: (title: string, reminder?: string, notificationId?: string) => void
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({
    isOpen, onClose, onAdd }) => {
    const { t, notificationsEnabled, todoNotifications } = useTheme();
    const dispatch = useAppDispatch();

    const [isFocused, setIsFocused] = useState(false)
    const [title, setTitle] = useState("")
    const [inputError, setInputError] = useState(false)

    const inputRef = useRef<TextInput>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPressAdd = async (dateOverride?: Date) => {
        if (!title.trim()) {
            setInputError(true)
            return
        }
        const finalDate = dateOverride || picker.reminderDate;
        let notificationId: string | undefined;

        if (finalDate && notificationsEnabled && todoNotifications) {
            notificationId = await schedulePushNotification(title, t("reminder"), finalDate);
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

    const picker = useDateTimePicker({
        onDateConfirmedAndroid: (date) => {
            setTimeout(() => onPressAdd(date), 100);
        }
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
        if (inputError && title) setInputError(false)
    }, [title])

    useEffect(() => {
        if (isOpen) {
            setTitle("")
            setInputError(false)
            setIsFocused(false)
            picker.resetState(undefined)
        }
    }, [isOpen])

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

                    {/* Reminder Section */}
                    <View style={{ marginBottom: 10 }}>
                        {!picker.reminderDate ? (
                            <TouchableOpacity
                                style={localStyles.addReminderButton}
                                onPress={picker.startReminderFlow}
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
                                    onPress={picker.startReminderFlow}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="calendar" size={18} color="#fff" />
                                    <StyledText style={localStyles.chipText}>
                                        {picker.formatFullDate(picker.reminderDate)}
                                    </StyledText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => picker.setReminderDate(undefined)}
                                    style={localStyles.clearButton}
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
                            minimumDate={new Date()}
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
                            <View style={modalStyles.modalContainer}>
                                <View style={[modalStyles.iconContainer, {
                                    backgroundColor: COLORS.SECONDARY_BACKGROUND,
                                    shadowColor: picker.showDatePicker ? "#5BC0EB" : "#FFD166",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 5
                                }]}>
                                    <Ionicons
                                        name={picker.showDatePicker ? "calendar" : "time"}
                                        size={28}
                                        color={picker.showDatePicker ? "#5BC0EB" : "#FFD166"}
                                    />
                                </View>

                                <StyledText style={modalStyles.headerText}>
                                    {picker.showDatePicker ? t("date") : t("time")}
                                </StyledText>

                                <View style={modalStyles.divider} />

                                <View style={{ width: '100%', height: 150, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                    <DateTimePicker
                                        value={picker.tempDate || picker.reminderDate || new Date()}
                                        mode={picker.showDatePicker ? "date" : "time"}
                                        display="spinner"
                                        onChange={picker.showDatePicker ? picker.onChangeDate : picker.onChangeTime}
                                        minimumDate={picker.showDatePicker ? new Date() : undefined}
                                        locale={picker.getLocale()}
                                        textColor={COLORS.PRIMARY_TEXT}
                                        themeVariant={useTheme().theme}
                                        style={{ width: '100%', transform: [{ scale: 0.85 }] }}
                                    />
                                </View>

                                <View style={[modalStyles.buttonsContainer, { marginTop: 20 }]}>
                                    <StyledButton
                                        label={t("cancel")}
                                        onPress={picker.closePickers}
                                        variant="dark_button"
                                        style={{ flex: 1 }}
                                    />
                                    <StyledButton
                                        label={picker.showDatePicker ? t("next") : t("save")}
                                        onPress={picker.showDatePicker ? picker.confirmDateIOS : picker.confirmTimeIOS}
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
                    <StyledModal isOpen={picker.showPermissionModal} onClose={() => picker.setShowPermissionModal(false)}>
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
                                    onPress={() => picker.setShowPermissionModal(false)}
                                    variant="dark_button"
                                />
                                <StyledButton
                                    label={t("enable")}
                                    onPress={() => {
                                        dispatch(updateAppSetting({ notificationsEnabled: true }));
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
                                    onPress={() => picker.setShowPastDateAlert(false)}
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

export default AddTodoModal
