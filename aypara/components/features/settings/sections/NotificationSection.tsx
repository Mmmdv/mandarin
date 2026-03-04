import CustomSwitch from "@/components/ui/CustomSwitch";
import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { getModalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/store";
import {
    updateAppSetting,
    UpdateAppSettingsPayload,
} from "@/store/slices/appSlice";
import { editBirthday, selectBirthdays } from "@/store/slices/birthdaySlice";
import {
    cancelAllNotifications,
    updateNotificationStatus,
} from "@/store/slices/notificationSlice";
import { cancelAllReminders, selectTodos } from "@/store/slices/todoSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import React, { useMemo } from "react";
import { Platform, TouchableOpacity, UIManager, View } from "react-native";
import { getSettingsStyles } from "../styles";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface NotificationSectionProps {
  visible: boolean;
  autoOpenManageModal?: boolean;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  visible,
  autoOpenManageModal,
}) => {
  const { colors, t, todoNotifications, birthdayNotifications } = useTheme();
  const dispatch = useAppDispatch();
  const todos = useAppSelector(selectTodos);
  const birthdays = useAppSelector(selectBirthdays);

  const styles = useMemo(() => getSettingsStyles(colors), [colors]);
  const modalThemeStyles = useMemo(() => getModalStyles(colors), [colors]);

  const [isManageModalOpen, setIsManageModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (autoOpenManageModal) {
      const timer = setTimeout(() => setIsManageModalOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [autoOpenManageModal]);
  const [pendingDisable, setPendingDisable] = React.useState<{
    key: keyof UpdateAppSettingsPayload;
    count: number;
  } | null>(null);

  const getActiveNotificationCount = (
    key: keyof UpdateAppSettingsPayload,
  ): number => {
    if (key === "todoNotifications") {
      return todos.filter(
        (todo) =>
          todo.notificationId &&
          !todo.isCompleted &&
          !todo.isArchived &&
          todo.reminder &&
          new Date(todo.reminder) > new Date() &&
          !todo.reminderCancelled,
      ).length;
    }
    if (key === "birthdayNotifications") {
      return birthdays.filter((b) => !!b.notificationId).length;
    }
    return 0;
  };

  const executeCategoryDisable = async (
    key: keyof UpdateAppSettingsPayload,
  ) => {
    dispatch(updateAppSetting({ [key]: false }));

    if (key === "todoNotifications") {
      try {
        for (const todo of todos) {
          if (todo.notificationId && !todo.isCompleted && !todo.isArchived) {
            await Notifications.cancelScheduledNotificationAsync(
              todo.notificationId,
            );
          }
        }
      } catch (error) {
        console.error("Error cancelling todo notifications:", error);
      }

      dispatch(cancelAllReminders());
      dispatch(cancelAllNotifications(t("tab_todo")));
    }

    if (key === "birthdayNotifications") {
      try {
        for (const birthday of birthdays) {
          if (birthday.notificationId) {
            await Notifications.cancelScheduledNotificationAsync(
              birthday.notificationId,
            );
            dispatch(
              updateNotificationStatus({
                id: birthday.notificationId,
                status: "Ləğv olunub",
              }),
            );
            dispatch(
              editBirthday({
                id: birthday.id,
                notificationId: null,
              }),
            );
          }
        }
      } catch (error) {
        console.error("Error cancelling birthday notifications:", error);
      }
    }
  };

  const handleToggle = (
    key: keyof UpdateAppSettingsPayload,
    value: boolean,
  ) => {
    if (value) {
      // Turning on — no confirmation needed
      dispatch(updateAppSetting({ [key]: true }));
      return;
    }

    // Turning off — check active notification count
    const count = getActiveNotificationCount(key);
    if (count > 0) {
      setIsManageModalOpen(false);
      setTimeout(() => setPendingDisable({ key, count }), 300);
    } else {
      dispatch(updateAppSetting({ [key]: false }));
    }
  };

  const confirmDisable = async () => {
    if (!pendingDisable) return;
    await executeCategoryDisable(pendingDisable.key);
    setPendingDisable(null);
    setTimeout(() => setIsManageModalOpen(true), 300);
  };

  const cancelDisable = () => {
    setPendingDisable(null);
    setTimeout(() => setIsManageModalOpen(true), 300);
  };

  const subSwitches = [
    {
      key: "todoNotifications",
      icon: "list" as const,
      label: t("notifications_todo"),
      value: todoNotifications ?? true,
    },
    {
      key: "birthdayNotifications",
      icon: "gift" as const,
      label: t("notifications_birthday"),
      value: birthdayNotifications ?? true,
    },
  ];

  return (
    <>
      <View style={styles.section}>
        <StyledText style={styles.sectionTitle}>
          {t("notifications")}
        </StyledText>
        <View style={styles.aboutContainer}>
          <TouchableOpacity
            style={[styles.aboutRow, { borderBottomWidth: 0 }]}
            onPress={() => setIsManageModalOpen(true)}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={colors.PLACEHOLDER}
              />
              <StyledText style={styles.aboutLabel}>
                {t("manage_notification_categories")}
              </StyledText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.PLACEHOLDER}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Manage Notification Categories Modal */}
      <StyledModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        closeOnOverlayPress={true}
      >
        <View style={[styles.modalPremiumContainer, { paddingHorizontal: 0 }]}>
          <View
            style={[
              modalThemeStyles.iconContainer,
              {
                backgroundColor: colors.TAB_BAR,
                shadowColor: colors.CHECKBOX_SUCCESS,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 2,
                marginBottom: 10,
              },
            ]}
          >
            <Ionicons
              name="notifications"
              size={28}
              color={colors.CHECKBOX_SUCCESS}
            />
          </View>

          <StyledText style={modalThemeStyles.headerText}>
            {t("manage_notification_categories")}
          </StyledText>

          <View
            style={[
              modalThemeStyles.divider,
              {
                backgroundColor: colors.PRIMARY_BORDER_DARK,
                marginVertical: 15,
                opacity: 0.3,
              },
            ]}
          />

          <View style={{ width: "100%", paddingHorizontal: 20 }}>
            <View style={styles.aboutContainer}>
              {subSwitches.map((item, index) => (
                <View
                  key={item.key}
                  style={[
                    styles.aboutRow,
                    {
                      borderBottomWidth:
                        index < subSwitches.length - 1 ? 0.5 : 0,
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={colors.PRIMARY_TEXT}
                      style={{ opacity: 0.7 }}
                    />
                    <StyledText style={styles.aboutLabel}>
                      {item.label}
                    </StyledText>
                  </View>
                  <CustomSwitch
                    onValueChange={(value) =>
                      handleToggle(item.key as any, value)
                    }
                    value={item.value}
                  />
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              modalThemeStyles.buttonsContainer,
              { paddingHorizontal: 20, marginTop: 10, width: "100%" },
            ]}
          >
            <StyledButton
              label={t("close")}
              onPress={() => setIsManageModalOpen(false)}
              variant="dark_button"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </StyledModal>

      {/* Disable Category Confirmation Modal */}
      <StyledModal
        isOpen={!!pendingDisable}
        onClose={cancelDisable}
        closeOnOverlayPress={true}
      >
        <View style={styles.modalPremiumContainer}>
          <View
            style={[
              modalThemeStyles.iconContainer,
              {
                backgroundColor: colors.TAB_BAR,
                shadowColor: "#FF6B6B",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 2,
              },
            ]}
          >
            <Ionicons name="notifications-off" size={28} color="#FF6B6B" />
          </View>

          <StyledText style={modalThemeStyles.headerText}>
            {t("attention")}
          </StyledText>

          <View
            style={[
              modalThemeStyles.divider,
              { backgroundColor: colors.PRIMARY_BORDER_DARK, opacity: 0.3 },
            ]}
          />

          <StyledText style={modalThemeStyles.messageText}>
            {pendingDisable
              ? t("disable_category_confirm").replace(
                  "{{count}}",
                  String(pendingDisable.count),
                )
              : ""}
          </StyledText>

          <View style={[modalThemeStyles.buttonsContainer, { marginTop: 10 }]}>
            <StyledButton
              label={t("cancel")}
              onPress={cancelDisable}
              variant="dark_button"
            />
            <StyledButton
              label={t("confirm")}
              onPress={confirmDisable}
              variant="dark_button"
            />
          </View>
        </View>
      </StyledModal>
    </>
  );
};

export default NotificationSection;
