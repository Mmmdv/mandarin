import { checkSystemNotifications } from "@/constants/notifications";
import { useTheme } from "@/hooks/useTheme";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform } from "react-native";

const isValidDate = (d: any): d is Date =>
  d instanceof Date && !isNaN(d.getTime());

type UseDateTimePickerOptions = {
  initialDate?: Date;
  onDateConfirmedAndroid?: (date: Date) => void;
  tabSettingEnabled?: boolean;
};

export function useDateTimePicker(options: UseDateTimePickerOptions = {}) {
  const { lang } = useTheme();

  const [reminderDate, setReminderDate] = useState<Date | undefined>(
    isValidDate(options.initialDate) ? options.initialDate : undefined,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showOSPermissionModal, setShowOSPermissionModal] = useState(false);
  const [showPastDateAlert, setShowPastDateAlert] = useState(false);
  const [pickerToReopen, setPickerToReopen] = useState<"date" | "time" | null>(
    null,
  );
  const [activeMode, setActiveMode] = useState<"date" | "time" | null>(null);
  const [todayStart, setTodayStart] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const startReminderFlow = async (mode?: "date" | "time") => {
    Haptics.selectionAsync();

    const osGranted = await checkSystemNotifications();
    if (!osGranted) {
      setShowOSPermissionModal(true);
      return;
    }

    if (options.tabSettingEnabled === false) {
      setShowPermissionModal(true);
      return;
    }
    proceedWithReminder(mode);
  };

  const proceedWithReminder = (mode?: "date" | "time") => {
    setActiveMode(mode || null);
    if (Platform.OS === "ios") {
      let initialTemp = isValidDate(reminderDate) ? reminderDate : new Date();
      // If the current reminder is in the past, the picker might jump or fail
      // if minimumDate is set to today. So we ensure tempDate is at least todayStart.
      if (initialTemp < todayStart) {
        initialTemp = new Date(); // Start at now
      }
      setTempDate(initialTemp);
    }

    if (mode === "date") {
      setShowDatePicker(true);
      setShowTimePicker(false);
    } else if (mode === "time") {
      setShowTimePicker(true);
      setShowDatePicker(false);
    } else {
      // Original logic for backward compatibility
      if (isValidDate(reminderDate)) {
        setShowTimePicker(true);
      } else {
        setShowDatePicker(true);
      }
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      if (Platform.OS === "android") {
        if (event.type === "dismissed") {
          setShowDatePicker(false);
          return;
        }
        setShowDatePicker(false);
        const newDate = new Date(selectedDate);

        if (!isValidDate(reminderDate)) {
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
      if (Platform.OS === "android") setShowDatePicker(false);
    }
  };

  const confirmDateIOS = () => {
    const baseDate = isValidDate(tempDate)
      ? tempDate
      : isValidDate(reminderDate)
        ? reminderDate
        : new Date();
    const newDate = new Date(baseDate);

    if (!isValidDate(reminderDate)) {
      const now = new Date();
      newDate.setHours(now.getHours() + 1);
      newDate.setMinutes(0);
    } else {
      newDate.setHours(reminderDate.getHours());
      newDate.setMinutes(reminderDate.getMinutes());
    }

    setTempDate(newDate);
    setReminderDate(newDate); // Save the date part to reminderDate
    setShowDatePicker(false);
    setTimeout(() => {
      setShowTimePicker(true);
    }, 350);
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      if (Platform.OS === "android") {
        if (event.type === "dismissed") {
          setShowTimePicker(false);
          return;
        }
        setShowTimePicker(false);
        const currentReminder = isValidDate(reminderDate)
          ? reminderDate
          : new Date();
        const newDate = new Date(currentReminder);
        newDate.setHours(selectedTime.getHours());
        newDate.setMinutes(selectedTime.getMinutes());

        setReminderDate(newDate);

        // Call Android callback if provided (for auto-save in AddTodoModal)
        if (options.onDateConfirmedAndroid) {
          setTimeout(() => {
            options.onDateConfirmedAndroid!(newDate);
          }, 100);
        }
      } else {
        const currentReminder = isValidDate(tempDate)
          ? tempDate
          : isValidDate(reminderDate)
            ? reminderDate
            : new Date();
        const newDate = new Date(currentReminder);
        newDate.setHours(selectedTime.getHours());
        newDate.setMinutes(selectedTime.getMinutes());
        setTempDate(newDate);
      }
    } else {
      if (Platform.OS === "android") setShowTimePicker(false);
    }
  };

  const confirmTimeIOS = () => {
    const finalDate = isValidDate(tempDate)
      ? tempDate
      : isValidDate(reminderDate)
        ? reminderDate
        : new Date();

    setReminderDate(finalDate);
    setShowTimePicker(false);
  };

  const getLocale = () => {
    switch (lang) {
      case "az":
        return "az-AZ";
      case "ru":
        return "ru-RU";
      default:
        return "en-US";
    }
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleString(getLocale(), {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        if (pickerToReopen === "date") setShowDatePicker(true);
        else if (pickerToReopen === "time") setShowTimePicker(true);
        setPickerToReopen(null);
      }, 350);
    }
  };

  const closePickers = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const resetState = (initialDate?: Date) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setTodayStart(d);
    setReminderDate(isValidDate(initialDate) ? initialDate : undefined);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setTempDate(undefined);
    setShowPermissionModal(false);
    setShowPastDateAlert(false);
    setPickerToReopen(null);
    setActiveMode(null);
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
    showOSPermissionModal,
    setShowOSPermissionModal,
    showPastDateAlert,
    setShowPastDateAlert,
    activeMode,
    todayStart,
    setPickerToReopen,
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
