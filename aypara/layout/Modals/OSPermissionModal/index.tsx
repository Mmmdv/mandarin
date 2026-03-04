import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Linking, View } from "react-native";
import { getStyles } from "./styles";

type OSPermissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const OSPermissionModal: React.FC<OSPermissionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <StyledModal isOpen={isOpen} onClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="warning-outline"
              size={22}
              color={colors.PRIMARY_ACTIVE_BUTTON}
            />
          </View>

          <StyledText style={styles.headerText}>
            {t("os_notifications_disabled_title")}
          </StyledText>
        </View>

        <View style={styles.divider} />

        <StyledText style={styles.messageText}>
          {t("os_notifications_disabled")}
        </StyledText>

        <View style={styles.buttonsContainer}>
          <StyledButton
            label={t("cancel")}
            onPress={onClose}
            variant="dark_button"
          />
          <StyledButton
            label={t("go_to_os_settings")}
            onPress={() => {
              onClose();
              Linking.openSettings();
            }}
            variant="dark_button"
          />
        </View>
      </View>
    </StyledModal>
  );
};

export default OSPermissionModal;
