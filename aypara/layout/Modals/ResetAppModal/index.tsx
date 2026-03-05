import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

type ResetAppModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
};

const ResetAppModal: React.FC<ResetAppModalProps> = ({
  isOpen,
  onClose,
  onReset,
}) => {
  const { colors, t, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="trash-outline" size={28} color="#FF6B6B" />
          </View>

          <StyledText style={styles.headerText}>
            {t("reset_factory_confirm_title")}
          </StyledText>
        </View>

        <View style={styles.divider} />

        <StyledText style={styles.messageText}>
          {t("reset_factory_confirm_message")}
        </StyledText>

        <View
          style={[
            modalStyles.buttonsContainer,
            { marginTop: 10, width: "100%" },
          ]}
        >
          <StyledButton
            label={t("cancel")}
            onPress={onClose}
            variant="dark_button"
          />
          <StyledButton
            label={t("reset_factory")}
            onPress={onReset}
            variant="dark_button"
          />
        </View>
      </View>
    </StyledModal>
  );
};

export default ResetAppModal;
