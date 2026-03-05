import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { useAppSelector } from "@/store";
import { selectAppSettings, updateAppSetting } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, Linking, Platform, View } from "react-native";
import { useDispatch } from "react-redux";
import { getStyles } from "./styles";

const ReducedMotionModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { colors, t, isDark } = useTheme();
  const dispatch = useDispatch();
  const { reducedMotionDismissed } = useAppSelector(selectAppSettings);

  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  useEffect(() => {
    // Check reduced motion on mount
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (enabled && !reducedMotionDismissed) {
        setVisible(true);
      }
    });

    // Listen for changes to reduced motion setting
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        if (!enabled) {
          // User fixed it — close the modal automatically
          setVisible(false);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [reducedMotionDismissed]);

  const handleOpenSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("App-Prefs:ACCESSIBILITY");
    } else {
      Linking.openSettings();
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    dispatch(updateAppSetting({ reducedMotionDismissed: true }));
  };

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <StyledModal
      isOpen={visible}
      onClose={handleClose}
      closeOnOverlayPress={true}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="speedometer-outline"
              size={28}
              color={colors.CHECKBOX_SUCCESS}
            />
          </View>

          <StyledText style={styles.headerText}>
            {t("reduced_motion_title")}
          </StyledText>
        </View>

        <View style={styles.divider} />

        {/* Message */}
        <StyledText style={styles.messageText}>
          {t("reduced_motion_message")}
        </StyledText>

        {/* Instructions */}
        <View style={styles.instructionBox}>
          {Platform.OS === "android" ? (
            <>
              <StyledText style={styles.instructionText}>
                {t("reduced_motion_android_path")}
              </StyledText>
              <StyledText style={styles.instructionDetail}>
                {t("reduced_motion_android_desc")}
              </StyledText>
            </>
          ) : (
            <>
              <StyledText style={styles.instructionText}>
                {t("reduced_motion_ios_path")}
              </StyledText>
              <StyledText style={styles.instructionDetail}>
                {t("reduced_motion_ios_desc")}
              </StyledText>
            </>
          )}
        </View>

        {/* Buttons */}
        <View
          style={[
            modalStyles.buttonsContainer,
            { marginTop: 10, width: "100%" },
          ]}
        >
          <StyledButton
            label={t("reduced_motion_dismiss")}
            onPress={handleDismiss}
            variant="dark_button"
          />
          <StyledButton
            label={t("reduced_motion_open_settings")}
            onPress={handleOpenSettings}
            variant="dark_button"
          />
        </View>
      </View>
    </StyledModal>
  );
};

export default React.memo(ReducedMotionModal);
