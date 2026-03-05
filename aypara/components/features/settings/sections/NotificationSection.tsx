import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import ManageNotificationsModal from "@/layout/Modals/ManageNotificationsModal";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { getSettingsStyles } from "../styles";

interface NotificationSectionProps {
  visible: boolean;
  autoOpenManageModal?: boolean;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  visible,
  autoOpenManageModal,
}) => {
  const { colors, t } = useTheme();
  const styles = useMemo(() => getSettingsStyles(colors), [colors]);

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  useEffect(() => {
    if (autoOpenManageModal) {
      const timer = setTimeout(() => setIsManageModalOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [autoOpenManageModal]);

  if (!visible) return null;

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

      <ManageNotificationsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </>
  );
};

export default NotificationSection;
