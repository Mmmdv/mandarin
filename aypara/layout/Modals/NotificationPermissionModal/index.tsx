import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

type NotificationPermissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
};

const NotificationPermissionModal: React.FC<
  NotificationPermissionModalProps
> = ({ isOpen, onClose, onConfirm, onCancel, title, description }) => {
  const { t, colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <StyledModal isOpen={isOpen} onClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="notifications-outline"
              size={28}
              color={colors.PRIMARY_ACTIVE_BUTTON}
            />
          </View>

          <StyledText style={styles.headerText}>
            {title || t("enable_notifications")}
          </StyledText>
        </View>

        <View style={styles.divider} />

        <StyledText style={styles.messageText}>
          {description || t("enable_notifications_desc")}
        </StyledText>

        <View style={styles.buttonsContainer}>
          <StyledButton
            label={t("cancel")}
            onPress={handleCancel}
            variant="dark_button"
            style={{ flex: 1 }}
          />
          <StyledButton
            label={t("enable")}
            onPress={onConfirm}
            variant="dark_button"
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </StyledModal>
  );
};

export default NotificationPermissionModal;
