import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { schedulePushNotification } from "@/constants/notifications";
import { COLORS } from "@/constants/ui";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch } from "@/store";
import { addNotification } from "@/store/slices/notificationSlice";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

type EditTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onUpdate: (title: string, reminder?: string) => void
    title: Todo["title"]
    reminder?: string
}

const EditTodoModal: React.FC<EditTodoModalProps> = ({
    isOpen, onClose, onUpdate, title, reminder }) => {
    const { t, lang, notificationsEnabled } = useTheme();
    const dispatch = useAppDispatch();

    const [isFocused, setIsFocused] = useState(false)
    const [updatedTitle, setUpdateTitle] = useState(title)
    const [inputError, setInputError] = useState(false)

    // Reminder state
    const [reminderDate, setReminderDate] = useState<Date | undefined>(reminder ? new Date(reminder) : undefined)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [tempDate, setTempDate] = useState<Date | undefined>(undefined) // For iOS intermediate state

    useEffect(() => {
        if (inputError && updatedTitle) setInputError(false)
    }, [updatedTitle])

    useEffect(() => {
        if (isOpen) {
            setUpdateTitle(title)
            setReminderDate(reminder ? new Date(reminder) : undefined)
            setInputError(false)
            setIsFocused(false)
        }
    }, [isOpen, title, reminder])

    const onPressSave = async () => {
        if (!updatedTitle.trim()) {
            setInputError(true)
            return
        }

        if (reminderDate && notificationsEnabled) {
            await schedulePushNotification(updatedTitle, t("reminder"), reminderDate);
            // Add to history
            dispatch(addNotification({
                id: Date.now().toString(),
                title: t("reminder"),
                body: `${t("title")}: ${updatedTitle}`,
                date: reminderDate.toISOString(),
            }));
        }

        onUpdate(updatedTitle, reminderDate?.toISOString())
        onClose()
    }

    const startReminderFlow = () => {
        Haptics.selectionAsync();
        if (Platform.OS === 'ios') {
            setTempDate(reminderDate || new Date());
        }
        setShowDatePicker(true);
    }

    // Date Picker Logic (Same as AddTodoModal)
    // Date Picker Logic
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
                }, 100);
            } else {
                // iOS: Update temp state only
                setTempDate(selectedDate);
            }
        } else {
            if (Platform.OS === 'android') setShowDatePicker(false);
        }
    };

    const confirmDateIOS = () => {
        const newDate = tempDate || reminderDate || new Date();
        if (!reminderDate) {
            const now = new Date();
            newDate.setHours(now.getHours() + 1);
            newDate.setMinutes(0);
        } else {
            newDate.setHours(reminderDate.getHours());
            newDate.setMinutes(reminderDate.getMinutes());
        }
        setReminderDate(newDate);
        setTempDate(newDate); // Sync temp for next step
        setShowDatePicker(false);
        setTimeout(() => {
            setShowTimePicker(true);
        }, 300);
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
                setReminderDate(newDate);
            } else {
                // iOS: Update temp state only
                const currentReminder = reminderDate || new Date();
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
        setReminderDate(finalDate);
        setShowTimePicker(false);
    };

    const getLocale = () => {
        switch (lang) {
            case 'az': return 'az-AZ';
            case 'ru': return 'ru-RU';
            default: return 'en-US';
        }
    }

    const formatDateVal = (date: Date) => date.toLocaleDateString(getLocale());
    const formatTimeVal = (date: Date) => date.toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' });

    const formatFullDate = (date: Date) => {
        return date.toLocaleString(getLocale(), {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={modalStyles.modalContainer}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: useTheme().colors.SECONDARY_BACKGROUND,
                    shadowColor: "#5BC0EB",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="create-outline" size={28} color="#5BC0EB" />
                </View>

                <StyledText style={modalStyles.headerText}>{t("edit")}</StyledText>

                <View style={modalStyles.divider} />

                <View style={[
                    localStyles.inputWrapper,
                    isFocused && localStyles.inputFocused,
                    inputError && localStyles.inputError
                ]}>
                    <TextInput
                        style={localStyles.textInput}
                        placeholder={t("todo_placeholder")}
                        placeholderTextColor="#666"
                        value={updatedTitle}
                        onChangeText={setUpdateTitle}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        multiline={true}
                    />
                </View>

                {/* Reminder Section */}
                <View style={{ marginBottom: 20 }}>
                    {!reminderDate ? (
                        <TouchableOpacity
                            style={localStyles.addReminderButton}
                            onPress={startReminderFlow}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="notifications-outline" size={20} color="#888" />
                            <StyledText style={localStyles.addReminderText}>{t("reminder")}</StyledText>
                            <Ionicons name="add-circle" size={20} color="#5BC0EB" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                    ) : (
                        <View style={localStyles.reminderChip}>
                            <View style={localStyles.chipContent}>
                                <Ionicons name="calendar" size={18} color="#fff" />
                                <StyledText style={localStyles.chipText}>
                                    {formatFullDate(reminderDate)}
                                </StyledText>
                            </View>
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
                        <View style={localStyles.iosPickerContainer}>
                            <View style={localStyles.iosHeader}>
                                <TouchableOpacity
                                    onPress={() => { setShowDatePicker(false); setShowTimePicker(false); }}
                                    style={localStyles.iconButton}
                                >
                                    <Ionicons name="close-circle" size={28} color={COLORS.ERROR_INPUT_TEXT} />
                                </TouchableOpacity>

                                <StyledText style={localStyles.iosTitle}>
                                    {showDatePicker ? t("date") : t("time")}
                                </StyledText>

                                <TouchableOpacity
                                    onPress={showDatePicker ? confirmDateIOS : confirmTimeIOS}
                                    style={localStyles.iconButton}
                                >
                                    <Ionicons
                                        name={showDatePicker ? "arrow-forward-circle" : "checkmark-circle"}
                                        size={28}
                                        color={COLORS.CHECKBOX_SUCCESS}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={localStyles.pickerWrapper}>
                                <DateTimePicker
                                    value={tempDate || reminderDate || new Date()}
                                    mode={showDatePicker ? "date" : "time"}
                                    display="spinner"
                                    onChange={showDatePicker ? onChangeDate : onChangeTime}
                                    minimumDate={showDatePicker ? new Date() : undefined}
                                    locale={getLocale()}
                                    textColor={COLORS.PRIMARY_TEXT}
                                    themeVariant={useTheme().theme}
                                />
                            </View>
                        </View>
                    </StyledModal>
                )}

                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="blue_button"
                    />
                    <StyledButton
                        label={t("save")}
                        onPress={onPressSave}
                        variant="blue_button"
                    />
                </View>
            </View>
        </StyledModal>
    )
}

const localStyles = StyleSheet.create({
    inputWrapper: {
        backgroundColor: "rgba(255, 255, 255, 0.05)", // Lighter transparency
        borderRadius: 16, // Softer corners
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)", // Subtle border
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 60,
        width: "100%",
        marginBottom: 20,
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
        fontSize: 18,
        minHeight: 40,
        textAlign: 'left',
        textAlignVertical: 'center',
        paddingHorizontal: 8,
    },
    sectionLabel: {
        fontSize: 12,
        color: "#888",
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5
    },
    pickerRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center"
    },
    pickerButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#151616ff",
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#3a3f47",
        gap: 8,
    },
    pickerButtonActive: {
        borderColor: "#5BC0EB",
        backgroundColor: "rgba(91, 192, 235, 0.05)"
    },
    pickerText: {
        color: "#888",
        fontSize: 14,
        fontWeight: "500"
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
        backgroundColor: "#5BC0EB",
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
        color: "#fff",
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
        overflow: 'hidden',
    },
    iosHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default EditTodoModal
