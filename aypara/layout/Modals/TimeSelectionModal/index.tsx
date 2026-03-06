import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

type TimeSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TimeSelectionModal: React.FC<TimeSelectionModalProps> = ({
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
              name="time-outline"
              size={28}
              color={colors.PRIMARY_ACTIVE_BUTTON}
            />
          </View>

          <StyledText style={styles.headerText}>{t("attention")}</StyledText>
        </View>

        <View style={styles.divider} />

        <StyledText style={styles.messageText}>{t("select_time")}</StyledText>

        <View style={styles.buttonsContainer}>
          <StyledButton
            label={t("close")}
            onPress={onClose}
            variant="dark_button"
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </StyledModal>
  );
};

export default TimeSelectionModal;
