import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { checkSystemNotifications } from "@/constants/notifications";
import { useTheme } from "@/hooks/useTheme";
import NotificationPermissionModal from "@/layout/Modals/NotificationPermissionModal";
import OSPermissionModal from "@/layout/Modals/OSPermissionModal";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectAppSettings, updateAppSetting } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { getStyles } from "./styles";

type RetryTodoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRetry: (delayType: "hour" | "day" | "week" | "month") => void;
};

const RetryTodoModal: React.FC<RetryTodoModalProps> = ({
  isOpen,
  onClose,
  onRetry,
}) => {
  const { t, colors, isDark } = useTheme();
  const settings = useAppSelector(selectAppSettings);
  const dispatch = useAppDispatch();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showOSPermissionModal, setShowOSPermissionModal] = useState(false);
  const [pendingRetry, setPendingRetry] = useState<
    "hour" | "day" | "week" | "month" | null
  >(null);

  const handleRetry = async (delayType: "hour" | "day" | "week" | "month") => {
    const osGranted = await checkSystemNotifications();
    if (!osGranted) {
      setShowOSPermissionModal(true);
      return;
    }

    if (!settings.todoNotifications) {
      setPendingRetry(delayType);
      setShowPermissionModal(true);
      return;
    }

    onRetry(delayType);
  };

  return (
    <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true}>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
            width: "100%",
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
              },
            ]}
          >
            <Ionicons
              name="sync-outline"
              size={28}
              color={colors.PRIMARY_ACTIVE_BUTTON}
            />
          </View>
          <StyledText style={styles.headerText}>
            {t("retry_confirm_title")}
          </StyledText>
        </View>

        <View style={modalStyles.divider} />

        <StyledText style={styles.messageText}>
          {t("retry_confirm_message")}
        </StyledText>

        <View style={styles.tableContainer}>
          <TouchableOpacity
            style={styles.tableRow}
            onPress={() => handleRetry("hour")}
          >
            <View style={styles.tableLabelColumn}>
              <Ionicons
                name="time-outline"
                size={18}
                color={colors.SECTION_TEXT}
              />
              <StyledText style={styles.tableLabelText}>
                {t("retry_1_hour")}
              </StyledText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.SECTION_TEXT}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tableRow, styles.tableRowBorder]}
            onPress={() => handleRetry("day")}
          >
            <View style={styles.tableLabelColumn}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.SECTION_TEXT}
              />
              <StyledText style={styles.tableLabelText}>
                {t("retry_1_day")}
              </StyledText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.SECTION_TEXT}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tableRow, styles.tableRowBorder]}
            onPress={() => handleRetry("week")}
          >
            <View style={styles.tableLabelColumn}>
              <Ionicons
                name="calendar-number-outline"
                size={18}
                color={colors.SECTION_TEXT}
              />
              <StyledText style={styles.tableLabelText}>
                {t("retry_1_week")}
              </StyledText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.SECTION_TEXT}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tableRow, styles.tableRowBorder]}
            onPress={() => handleRetry("month")}
          >
            <View style={styles.tableLabelColumn}>
              <Ionicons
                name="rocket-outline"
                size={18}
                color={colors.SECTION_TEXT}
              />
              <StyledText style={styles.tableLabelText}>
                {t("retry_1_month")}
              </StyledText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.SECTION_TEXT}
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            modalStyles.buttonsContainer,
            { justifyContent: "center", marginTop: 8 },
          ]}
        >
          <StyledButton
            label={t("cancel")}
            onPress={onClose}
            variant="dark_button"
            style={{ width: "100%" }}
          />
        </View>
      </View>

      <NotificationPermissionModal
        isOpen={showPermissionModal}
        onClose={() => {
          setShowPermissionModal(false);
          setPendingRetry(null);
        }}
        onConfirm={() => {
          dispatch(updateAppSetting({ todoNotifications: true }));
          setShowPermissionModal(false);
          if (pendingRetry) {
            onRetry(pendingRetry);
            setPendingRetry(null);
          }
        }}
      />

      <OSPermissionModal
        isOpen={showOSPermissionModal}
        onClose={() => setShowOSPermissionModal(false)}
      />
    </StyledModal>
  );
};

export default RetryTodoModal;
