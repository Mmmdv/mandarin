import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import {
    checkSystemNotifications,
    schedulePushNotification,
} from "@/constants/notifications";
import { TODO_CATEGORIES } from "@/constants/todo";
import { getFullFormatDate } from "@/helpers/date";
import { useDateTimePicker } from "@/hooks/useDateTimePicker";
import { useTheme } from "@/hooks/useTheme";
import IOSPickerModal from "@/layout/Modals/IOSPickerModal";
import NotificationPermissionModal from "@/layout/Modals/NotificationPermissionModal";
import OSPermissionModal from "@/layout/Modals/OSPermissionModal";
import PastDateModal from "@/layout/Modals/PastDateModal";
import { useAppDispatch } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import {
    addNotification,
    updateNotificationStatus,
} from "@/store/slices/notificationSlice";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    LayoutAnimation,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import { getEditStyles } from "./styles";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type EditTodoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (
    title: string,
    reminder?: string,
    notificationId?: string,
    category?: string,
  ) => void;
  title: Todo["title"];
  reminder?: string;
  notificationId?: string;
  reminderCancelled?: boolean;
  category?: string;
  categoryTitle?: string;
  categoryIcon?: string;
};

const EditTodoModal: React.FC<EditTodoModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  title,
  reminder,
  reminderCancelled,
  notificationId,
  category,
  categoryTitle,
  categoryIcon,
}) => {
  const { t, colors, isDark, todoNotifications, lang } = useTheme();
  const dispatch = useAppDispatch();

  const themedLocalStyles = useMemo(
    () => getEditStyles(colors, isDark),
    [colors, isDark],
  );

  const [updatedTitle, setUpdateTitle] = useState(title);
  const [inputError, setInputError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    category || "personal",
  );

  const inputRef = useRef<TextInput>(null);
  const categoryScrollRef = useRef<ScrollView>(null);

  const picker = useDateTimePicker({
    initialDate: reminder ? new Date(reminder) : undefined,
    tabSettingEnabled: todoNotifications,
  });

  useEffect(() => {
    if (inputError && updatedTitle) setInputError(false);
  }, [updatedTitle, inputError]);

  useEffect(() => {
    if (isOpen) {
      setUpdateTitle(title);
      setSelectedCategory(category || "personal");
      picker.resetState(reminder ? new Date(reminder) : undefined);
      setInputError(false);

      // Auto focus input immediately or with a minimal delay
      // to ensure it works across all devices
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, title, reminder, category]);

  useEffect(() => {
    if (selectedCategory) {
      categoryScrollRef.current?.scrollTo({ x: 0, animated: true });
    }
  }, [selectedCategory]);

  const formatDateOnly = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "";
    return getFullFormatDate(date, lang);
  };

  const formatTimeOnly = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const onPressSave = async () => {
    if (!updatedTitle.trim()) {
      setInputError(true);
      return;
    }

    if (picker.reminderDate) {
      const osGranted = await checkSystemNotifications();
      if (!osGranted) {
        picker.setShowOSPermissionModal(true);
        return;
      }

      if (!todoNotifications) {
        picker.setShowPermissionModal(true);
        return;
      }

      if (picker.reminderDate < new Date()) {
        picker.setPickerToReopen(null);
        picker.setShowPastDateAlert(true);
        return;
      }
    }

    let newNotificationId = notificationId;

    if (notificationId && picker.reminderDate?.toISOString() !== reminder) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch {
        // silently ignore
      }

      dispatch(
        updateNotificationStatus({
          id: notificationId,
          status: "Dəyişdirilib və ləğv olunub",
        }),
      );
    }

    if (
      picker.reminderDate &&
      todoNotifications &&
      picker.reminderDate?.toISOString() !== reminder
    ) {
      const displayTitle = categoryTitle || t("notifications_todo");

      const newId = await schedulePushNotification(
        displayTitle,
        updatedTitle,
        picker.reminderDate,
        categoryIcon,
      );
      newNotificationId = newId;

      if (newId) {
        dispatch(
          addNotification({
            id: newId,
            title: displayTitle,
            body: updatedTitle,
            date: picker.reminderDate.toISOString(),
            status: "Gözlənilir",
            categoryIcon: categoryIcon,
          }),
        );
      }
    }

    onUpdate(
      updatedTitle,
      picker.reminderDate?.toISOString(),
      newNotificationId,
      selectedCategory,
    );
    onClose();
  };

  return (
    <StyledModal isOpen={isOpen} onClose={onClose} expectsKeyboard={true}>
      <View style={themedLocalStyles.container}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
            width: "100%",
            marginBottom: 4,
          }}
        >
          <View
            style={[
              modalStyles.iconContainer,
              {
                backgroundColor: colors.SECONDARY_BACKGROUND,
                shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 2,
                width: 42,
                height: 42,
                borderRadius: 21,
                flexShrink: 0,
              },
            ]}
          >
            <Ionicons
              name="create-outline"
              size={28}
              color={colors.PRIMARY_ACTIVE_BUTTON}
            />
          </View>
          <StyledText
            style={[themedLocalStyles.headerText, { textAlign: "left" }]}
          >
            {t("edit")}
          </StyledText>
        </View>

        <View style={modalStyles.divider} />

        {/* 1. Title Section */}
        <View style={themedLocalStyles.tableContainer}>
          <View
            style={[
              themedLocalStyles.tableRow,
              { flexDirection: "column", alignItems: "flex-start", gap: 8 },
              inputError && themedLocalStyles.inputError,
            ]}
          >
            <View
              style={[
                themedLocalStyles.tableLabelColumn,
                { flex: 0, width: "100%" },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={colors.SECTION_TEXT}
              />
              <StyledText style={themedLocalStyles.tableLabelText}>
                {t("title")} *
              </StyledText>
            </View>
            <View
              style={[
                themedLocalStyles.tableValueColumn,
                {
                  flex: 0,
                  width: "100%",
                  alignItems: "flex-start",
                  paddingLeft: 28,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[
                  themedLocalStyles.tableValueText,
                  { textAlign: "left", fontSize: 14, width: "100%" },
                ]}
                placeholder={t("todo_placeholder")}
                placeholderTextColor={colors.PLACEHOLDER}
                value={updatedTitle}
                onChangeText={setUpdateTitle}
                multiline={true}
                autoFocus={true}
                blurOnSubmit={false}
                showSoftInputOnFocus={true}
              />
            </View>
          </View>
        </View>

        {/* 1.5. Category Section */}
        <View
          style={[
            themedLocalStyles.categoryContainer,
            { marginTop: 3, width: "100%" },
          ]}
        >
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={themedLocalStyles.categoryList}
          >
            {[...TODO_CATEGORIES]
              .sort((a, b) =>
                a.id === selectedCategory
                  ? -1
                  : b.id === selectedCategory
                    ? 1
                    : 0,
              )
              .map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.spring,
                    );
                    setSelectedCategory(cat.id);
                  }}
                  activeOpacity={0.7}
                  style={[
                    themedLocalStyles.categoryItem,
                    {
                      backgroundColor:
                        selectedCategory === cat.id
                          ? colors.REMINDER + (isDark ? "30" : "15")
                          : colors.SECTION_TEXT + (isDark ? "10" : "08"),
                      borderColor:
                        selectedCategory === cat.id
                          ? colors.REMINDER
                          : colors.SECTION_TEXT + (isDark ? "20" : "15"),
                      borderWidth: selectedCategory === cat.id ? 0.5 : 0.2,
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={14}
                    color={
                      selectedCategory === cat.id
                        ? colors.REMINDER
                        : colors.SECTION_TEXT
                    }
                  />
                  <StyledText
                    style={{
                      fontSize: 10,
                      color:
                        selectedCategory === cat.id
                          ? colors.REMINDER
                          : colors.SECTION_TEXT,
                      fontWeight: selectedCategory === cat.id ? "700" : "500",
                    }}
                  >
                    {t(cat.label as any)}
                  </StyledText>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {/* 2. Reminder Section */}
        <View style={[themedLocalStyles.tableContainer, { marginTop: 3 }]}>
          {/* Date Row */}
          <TouchableOpacity
            style={themedLocalStyles.tableRow}
            onPress={() => picker.startReminderFlow("date")}
            activeOpacity={0.7}
          >
            <View style={themedLocalStyles.tableLabelColumn}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.SECTION_TEXT}
              />
              <StyledText style={themedLocalStyles.tableLabelText}>
                {t("date")}
              </StyledText>
            </View>
            <View style={themedLocalStyles.tableValueColumn}>
              <StyledText
                style={[
                  themedLocalStyles.tableValueText,
                  !picker.reminderDate && { color: colors.PLACEHOLDER },
                ]}
              >
                {picker.reminderDate
                  ? formatDateOnly(picker.reminderDate)
                  : t("select_placeholder")}
              </StyledText>
            </View>
          </TouchableOpacity>

          <View
            style={[
              themedLocalStyles.tableRow,
              themedLocalStyles.tableRowBorder,
              { flexDirection: "row", alignItems: "center" },
            ]}
          >
            <TouchableOpacity
              onPress={() => picker.startReminderFlow("time")}
              activeOpacity={0.7}
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <View style={themedLocalStyles.tableLabelColumn}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={colors.SECTION_TEXT}
                />
                <StyledText style={themedLocalStyles.tableLabelText}>
                  {t("time")}
                </StyledText>
              </View>
              <View style={[themedLocalStyles.tableValueColumn, { flex: 1 }]}>
                <StyledText
                  style={[
                    themedLocalStyles.tableValueText,
                    !picker.reminderDate && { color: colors.PLACEHOLDER },
                  ]}
                >
                  {picker.reminderDate
                    ? formatTimeOnly(picker.reminderDate)
                    : t("select_placeholder")}
                </StyledText>
              </View>
            </TouchableOpacity>
            {picker.reminderDate && (
              <TouchableOpacity
                onPress={() => picker.setReminderDate(undefined)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                style={{ paddingLeft: 10 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.SECTION_TEXT}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View
          style={{
            width: "100%",
            paddingHorizontal: 4,
            marginTop: 0,
            marginBottom: 4,
          }}
        >
          <StyledText
            style={{
              fontSize: 9.5,
              color: colors.SECTION_TEXT,
              opacity: 0.7,
              textAlign: "center",
              lineHeight: 10,
            }}
          >
            {t("reminder_hint")}
          </StyledText>
        </View>

        {/* Android Pickers */}
        {Platform.OS === "android" && picker.showDatePicker && (
          <DateTimePicker
            value={picker.reminderDate || new Date()}
            mode="date"
            display="default"
            onChange={picker.onChangeDate}
            minimumDate={picker.todayStart}
            locale={picker.getLocale()}
          />
        )}

        {Platform.OS === "android" && picker.showTimePicker && (
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
        <IOSPickerModal picker={picker} reminder={reminder} />

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
        <NotificationPermissionModal
          isOpen={picker.showPermissionModal}
          onClose={() => picker.setShowPermissionModal(false)}
          onConfirm={() => {
            dispatch(updateAppSetting({ todoNotifications: true }));
            picker.setShowPermissionModal(false);
            setTimeout(() => {
              picker.proceedWithReminder();
            }, 300);
          }}
        />

        <PastDateModal
          isOpen={picker.showPastDateAlert}
          onClose={picker.closePastDateAlert}
        />
        <OSPermissionModal
          isOpen={picker.showOSPermissionModal}
          onClose={() => picker.setShowOSPermissionModal(false)}
        />
      </View>
    </StyledModal>
  );
};

export default EditTodoModal;
