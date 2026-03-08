import StyledText from "@/components/ui/StyledText";
import { formatDate } from "@/helpers/date";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { styles } from "./styles";

import { getReminderStatusProps } from "@/helpers/reminder";

interface ReminderBadgeProps {
  reminder?: string;
  reminderStatus?: string;
  reminderCancelled?: boolean;
  isDark: boolean;
  colors: any;
  lang: string;
  viewMode?: "list" | "card";
}

const ReminderBadge: React.FC<ReminderBadgeProps> = ({
  reminder,
  reminderStatus,
  reminderCancelled,
  isDark,
  colors,
  lang,
  viewMode = "list",
}) => {
  if (!reminder) return null;

  const { isCrossedOut, iconName, iconColor, opacity } = getReminderStatusProps(
    reminderStatus,
    reminderCancelled,
    false, // No completedAt locally in this badge typically, but handled outside
    colors,
  );

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      <View
        style={[
          styles.categoryBadge,
          {
            backgroundColor: colors.PLACEHOLDER_SECOND + (isDark ? "20" : "12"),
            borderColor: colors.PLACEHOLDER_SECOND + (isDark ? "40" : "30"),
            paddingVertical: viewMode === "card" ? 2 : 2.5,
            paddingHorizontal: viewMode === "card" ? 5 : 6,
            opacity: opacity,
          },
        ]}
      >
        <Ionicons
          name="alarm-outline"
          size={viewMode === "card" ? 10 : 11}
          color={colors.PLACEHOLDER_SECOND}
        />
        <StyledText
          style={{
            color: colors.PLACEHOLDER_SECOND,
            fontSize: viewMode === "card" ? 9 : 10,
            fontWeight: "700",
            textDecorationLine: isCrossedOut ? "line-through" : "none",
          }}
        >
          {formatDate(reminder, lang)}
        </StyledText>
      </View>
      {reminderStatus && (
        <View style={{ marginLeft: 2 }}>
          <Ionicons
            name={iconName as any}
            size={viewMode === "card" ? 11 : 12}
            color={iconColor}
          />
        </View>
      )}
    </View>
  );
};

export default ReminderBadge;
