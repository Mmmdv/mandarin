import { useTheme } from "@/hooks/useTheme";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform } from "react-native";

type UseDateTimePickerOptions = {
    initialDate?: Date;
    onDateConfirmedAndroid?: (date: Date) => void;
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

    const startReminderFlow = () => {
        Haptics.selectionAsync();
        if (!notificationsEnabled) {
            setShowPermissionModal(true);
            return;
        }
        proceedWithReminder();
    };

    const proceedWithReminder = () => {
        if (Platform.OS === 'ios') {
            setTempDate(reminderDate || new Date());
        }
        setShowDatePicker(true);
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
            setTimeout(() => {
                setShowPastDateAlert(true);
            }, 100);
            return;
        }

        setTempDate(newDate);
        setShowDatePicker(false);
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
                    setShowTimePicker(false);
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
            setShowTimePicker(false);
            setTimeout(() => {
                setShowPastDateAlert(true);
            }, 100);
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
    };

    return {
        // State
        reminderDate,
        setReminderDate,
        showDatePicker,
        showTimePicker,
        tempDate,
        showPermissionModal,
        setShowPermissionModal,
        showPastDateAlert,
        setShowPastDateAlert,

        // Actions
        startReminderFlow,
        proceedWithReminder,
        onChangeDate,
        confirmDateIOS,
        onChangeTime,
        confirmTimeIOS,
        closePickers,
        resetState,

        // Helpers
        getLocale,
        formatFullDate,
    };
}
