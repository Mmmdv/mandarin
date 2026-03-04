import { useTheme } from "@/hooks/useTheme";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform } from "react-native";

type UseDateTimePickerOptions = {
    initialDate?: Date;
    onDateConfirmedAndroid?: (date: Date) => void;
    tabSettingEnabled?: boolean;
};

export function useDateTimePicker(options: UseDateTimePickerOptions = {}) {
    const { lang, notificationsEnabled } = useTheme();

    const [reminderDate, setReminderDate] = useState<Date | undefined>(
        options.initialDate
    );
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | undefined>(undefined);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showPastDateAlert, setShowPastDateAlert] = useState(false);
    const [pickerToReopen, setPickerToReopen] = useState<'date' | 'time' | null>(null);

    const startReminderFlow = () => {
        Haptics.selectionAsync();
        if (!notificationsEnabled || options.tabSettingEnabled === false) {
            setShowPermissionModal(true);
            return;
        }
        proceedWithReminder();
    };

    const proceedWithReminder = () => {
        if (Platform.OS === 'ios') {
            setTempDate(reminderDate || new Date());
        }
        if (reminderDate) {
            setShowTimePicker(true);
        } else {
            setShowDatePicker(true);
        }
    };

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

                setTimeout(() => {
                    setShowTimePicker(true);
                }, 0);
            } else {
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(newDate);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate < today) {
            setPickerToReopen('date');
            setShowDatePicker(false);
            setTimeout(() => {
                setShowPastDateAlert(true);
            }, 350);
            return;
        }

        setTempDate(newDate);
        setShowDatePicker(false);
        // If we came from time picker (reminderDate was set) and just changing date, 
        // we might want to go back to time or just finish.
        // User asked: "yox yenisi təyin olunursa tarix barabanından" (if new, start from date) -> then it continues to time.
        // If changing existing, starts from time.

        // Logical flow: If it's a new one, we MUST go to time.
        // If it's an existing one and user manually went back to date, we probably want to go back to time to confirm.
        setTimeout(() => {
            setShowTimePicker(true);
        }, 350);
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
                    setPickerToReopen('time');
                    setTimeout(() => {
                        setShowPastDateAlert(true);
                    }, 100);
                    return;
                }

                setReminderDate(newDate);

                // Call Android callback if provided (for auto-save in AddTodoModal)
                if (options.onDateConfirmedAndroid) {
                    setTimeout(() => {
                        options.onDateConfirmedAndroid!(newDate);
                    }, 100);
                }
            } else {
                const currentReminder = tempDate || reminderDate || new Date();
                const newDate = new Date(currentReminder);
                newDate.setHours(selectedTime.getHours());
                newDate.setMinutes(selectedTime.getMinutes());
                setTempDate(newDate);
            }
        } else {
            if (Platform.OS === 'android') setShowTimePicker(false);
        }
    };

    const confirmTimeIOS = () => {
        const finalDate = tempDate || reminderDate || new Date();

        if (finalDate < new Date()) {
            setPickerToReopen('time');
            setShowTimePicker(false); // Close current picker first
            setTimeout(() => {
                setShowPastDateAlert(true);
            }, 350);
            return;
        }

        setReminderDate(finalDate);
        setShowTimePicker(false);
    };

    const getLocale = () => {
        switch (lang) {
            case 'az': return 'az-AZ';
            case 'ru': return 'ru-RU';
            default: return 'en-US';
        }
    };

    const formatFullDate = (date: Date) => {
        return date.toLocaleString(getLocale(), {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const goBackToDatePicker = () => {
        setShowTimePicker(false);
        setTimeout(() => {
            setShowDatePicker(true);
        }, 350);
    };

    const goBackToTimePicker = () => {
        setShowDatePicker(false);
        setTimeout(() => {
            setShowTimePicker(true);
        }, 350);
    };

    const closePastDateAlert = () => {
        setShowPastDateAlert(false);
        if (pickerToReopen) {
            setTimeout(() => {
                if (pickerToReopen === 'date') setShowDatePicker(true);
                else if (pickerToReopen === 'time') setShowTimePicker(true);
                setPickerToReopen(null);
            }, 350);
        }
    };

    const closePickers = () => {
        setShowDatePicker(false);
        setShowTimePicker(false);
    };

    const resetState = (initialDate?: Date) => {
        setReminderDate(initialDate);
        setShowDatePicker(false);
        setShowTimePicker(false);
        setTempDate(undefined);
        setShowPermissionModal(false);
        setShowPastDateAlert(false);
        setPickerToReopen(null);
    };

    return {
        // State
        reminderDate,
        setReminderDate,
        showDatePicker,
        setShowDatePicker,
        showTimePicker,
        setShowTimePicker,
        tempDate,
        showPermissionModal,
        setShowPermissionModal,
        showPastDateAlert,
        setShowPastDateAlert,
        closePastDateAlert,

        // Actions
        startReminderFlow,
        proceedWithReminder,
        onChangeDate,
        confirmDateIOS,
        onChangeTime,
        confirmTimeIOS,
        goBackToDatePicker,
        goBackToTimePicker,
        closePickers,
        resetState,

        // Helpers
        getLocale,
        formatFullDate,
    };
}
