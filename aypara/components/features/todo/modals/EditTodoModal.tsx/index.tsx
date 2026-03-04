import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { getModalStyles, modalStyles } from "@/constants/modalStyles";
import { schedulePushNotification } from "@/constants/notifications";
import { TODO_CATEGORIES } from "@/constants/todo";
import { useDateTimePicker } from "@/hooks/useDateTimePicker";
import { useTheme } from "@/hooks/useTheme";
import OSPermissionModal from "@/layout/Modals/OSPermissionModal";
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
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getEditStyles } from "./styles";

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
  const { t, colors, isDark, todoNotifications, theme, lang } = useTheme();
  const dispatch = useAppDispatch();

  const themedModalStyles = useMemo(() => getModalStyles(colors), [colors]);
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
    const day = date.getDate().toString().padStart(2, "0");
    const months = [
      "Yan",
      "Fev",
      "Mar",
      "Apr",
      "May",
      "İyn",
      "İyl",
      "Avq",
      "Sen",
      "Okt",
      "Noy",
      "Dek",
    ];
    const enMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const ruMonths = [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ];

    const monthNames =
      lang === "az" ? months : lang === "ru" ? ruMonths : enMonths;
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
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

    if (
      picker.reminderDate &&
      picker.reminderDate < new Date() &&
      picker.reminderDate.toISOString() !== reminder
    ) {
      picker.setShowPastDateAlert(true);
      return;
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
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                  style={[
                    themedLocalStyles.categoryItem,
                    {
                      backgroundColor:
                        selectedCategory === cat.id
                          ? isDark
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.05)"
                          : "transparent",
                      borderColor:
                        selectedCategory === cat.id
                          ? colors.PRIMARY_ACTIVE_BUTTON
                          : isDark
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                      borderWidth: selectedCategory === cat.id ? 1.5 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={14}
                    color={
                      selectedCategory === cat.id
                        ? colors.PRIMARY_ACTIVE_BUTTON
                        : colors.SECTION_TEXT
                    }
                  />
                  <StyledText
                    style={{
                      fontSize: 11,
                      color:
                        selectedCategory === cat.id
                          ? colors.PRIMARY_TEXT
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
        <View style={[themedLocalStyles.tableContainer, { marginTop: 16 }]}>
          {/* Date Row */}
          <TouchableOpacity
            style={themedLocalStyles.tableRow}
            onPress={() => picker.startReminderFlow()}
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
              onPress={() => picker.startReminderFlow()}
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
        {Platform.OS === "ios" && (
          <StyledModal
            isOpen={picker.showDatePicker || picker.showTimePicker}
            onClose={picker.closePickers}
          >
            <View style={themedModalStyles.modalContainer}>
              <View
                style={[
                  themedModalStyles.iconContainer,
                  {
                    backgroundColor: colors.TAB_BAR,
                    shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  },
                ]}
              >
                <Ionicons
                  name={picker.showDatePicker ? "calendar" : "time"}
                  size={28}
                  color={colors.PRIMARY_ACTIVE_BUTTON}
                />
              </View>

              <StyledText style={themedModalStyles.headerText}>
                {picker.showDatePicker ? t("date") : t("time")}
              </StyledText>

              <View style={themedModalStyles.divider} />

              <View
                style={{
                  width: "100%",
                  height: 150,
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <DateTimePicker
                  value={picker.tempDate || picker.reminderDate || new Date()}
                  mode={picker.showDatePicker ? "date" : "time"}
                  display="spinner"
                  onChange={
                    picker.showDatePicker
                      ? picker.onChangeDate
                      : picker.onChangeTime
                  }
                  minimumDate={picker.showDatePicker ? new Date() : undefined}
                  locale={picker.getLocale()}
                  textColor={colors.PRIMARY_TEXT}
                  themeVariant={theme}
                  style={{ width: "100%", transform: [{ scale: 0.85 }] }}
                />
              </View>

              <View
                style={[themedModalStyles.buttonsContainer, { marginTop: 20 }]}
              >
                <StyledButton
                  label={picker.showTimePicker ? t("back") : t("close")}
                  onPress={
                    picker.showTimePicker
                      ? picker.goBackToDatePicker
                      : picker.closePickers
                  }
                  variant="dark_button"
                  style={{ flex: 1 }}
                />
                <StyledButton
                  label={
                    picker.showDatePicker
                      ? reminder
                        ? t("back")
                        : t("next")
                      : t("save")
                  }
                  onPress={
                    picker.showDatePicker
                      ? reminder
                        ? picker.goBackToTimePicker
                        : picker.confirmDateIOS
                      : picker.confirmTimeIOS
                  }
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
        <StyledModal
          isOpen={picker.showPermissionModal}
          onClose={() => picker.setShowPermissionModal(false)}
        >
          <View style={themedModalStyles.modalContainer}>
            <View
              style={[
                themedModalStyles.iconContainer,
                {
                  backgroundColor: colors.TAB_BAR,
                  shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                },
              ]}
            >
              <Ionicons
                name="notifications"
                size={28}
                color={colors.PRIMARY_ACTIVE_BUTTON}
              />
            </View>

            <StyledText style={themedModalStyles.headerText}>
              {t("enable_notifications")}
            </StyledText>

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
                  dispatch(
                    updateAppSetting({
                      todoNotifications: true,
                    }),
                  );
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
        <StyledModal
          isOpen={picker.showPastDateAlert}
          onClose={() => picker.setShowPastDateAlert(false)}
        >
          <View style={themedModalStyles.modalContainer}>
            <View
              style={[
                themedModalStyles.iconContainer,
                {
                  backgroundColor: colors.TAB_BAR,
                  shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={28}
                color={colors.PRIMARY_ACTIVE_BUTTON}
              />
            </View>

            <StyledText style={themedModalStyles.headerText}>
              {t("attention")}
            </StyledText>

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
        <OSPermissionModal
          isOpen={picker.showOSPermissionModal}
          onClose={() => picker.setShowOSPermissionModal(false)}
        />
      </View>
    </StyledModal>
  );
};

export default EditTodoModal;
