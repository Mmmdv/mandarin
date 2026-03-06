import CustomSwitch from "@/components/ui/CustomSwitch";
import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
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
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

interface ManageNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageNotificationsModal: React.FC<ManageNotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { colors, t, isDark, todoNotifications, birthdayNotifications } =
    useTheme();
  const dispatch = useAppDispatch();
  const todos = useAppSelector(selectTodos);
  const birthdays = useAppSelector(selectBirthdays);

  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [pendingDisable, setPendingDisable] = useState<{
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
      dispatch(updateAppSetting({ [key]: true }));
      return;
    }

    const count = getActiveNotificationCount(key);
    if (count > 0) {
      setPendingDisable({ key, count });
    } else {
      dispatch(updateAppSetting({ [key]: false }));
    }
  };

  const confirmDisable = async () => {
    if (!pendingDisable) return;
    await executeCategoryDisable(pendingDisable.key);
    setPendingDisable(null);
  };

  const subSwitches = [
    {
      key: "todoNotifications",
      icon: "list-outline" as const,
      label: t("notifications_todo"),
      value: todoNotifications ?? true,
    },
    {
      key: "birthdayNotifications",
      icon: "gift-outline" as const,
      label: t("notifications_birthday"),
      value: birthdayNotifications ?? true,
    },
  ];

  return (
    <StyledModal
      isOpen={isOpen || !!pendingDisable}
      onClose={() => (pendingDisable ? setPendingDisable(null) : onClose())}
      closeOnOverlayPress={true}
    >
      <View style={styles.container}>
        {!pendingDisable ? (
          <>
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.iconContainer,
                  { shadowColor: colors.PRIMARY_ACTIVE_BUTTON },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={28}
                  color={colors.PRIMARY_ACTIVE_BUTTON}
                />
              </View>
              <StyledText style={styles.headerText}>
                {t("manage_notification_categories")}
              </StyledText>
            </View>

            <View style={styles.divider} />

            <View style={{ width: "100%" }}>
              <View style={styles.listContainer}>
                {subSwitches.map((item, index) => (
                  <View
                    key={item.key}
                    style={[
                      styles.row,
                      {
                        borderBottomWidth:
                          index < subSwitches.length - 1 ? 0.5 : 0,
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
                      <StyledText style={styles.rowLabel}>
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

            <View style={[modalStyles.buttonsContainer, { width: "100%" }]}>
              <StyledButton
                label={t("close")}
                onPress={onClose}
                variant="dark_button"
                style={{ flex: 1 }}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.headerRow}>
              <View style={[styles.iconContainer, { shadowColor: "#FF6B6B" }]}>
                <Ionicons
                  name="notifications-off-outline"
                  size={28}
                  color="#FF6B6B"
                />
              </View>
              <StyledText style={styles.headerText}>
                {t("attention")}
              </StyledText>
            </View>

            <View style={styles.divider} />

            <StyledText style={styles.messageText}>
              {t("disable_category_confirm").replace(
                "{{count}}",
                String(pendingDisable.count),
              )}
            </StyledText>

            <View style={[modalStyles.buttonsContainer, { marginTop: 10 }]}>
              <StyledButton
                label={t("cancel")}
                onPress={() => setPendingDisable(null)}
                variant="dark_button"
              />
              <StyledButton
                label={t("confirm")}
                onPress={confirmDisable}
                variant="dark_button"
              />
            </View>
          </>
        )}
      </View>
    </StyledModal>
  );
};

export default ManageNotificationsModal;
