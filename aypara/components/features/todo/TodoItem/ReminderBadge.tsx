import StyledText from "@/components/ui/StyledText";
import { formatDate } from "@/helpers/date";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { styles } from "./styles";

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

  const isCrossedOut =
    reminderStatus === "Ləğv olunub" ||
    reminderStatus === "Dəyişdirilib və ləğv olunub" ||
    reminderCancelled;

  const isSent =
    reminderStatus === "Göndərilib" ||
    "Ləğv olunub" ||
    "Dəyişdirilib və ləğv olunub";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      <View
        style={[
          styles.categoryBadge,
          {
            backgroundColor: colors.REMINDER + (isDark ? "20" : "12"),
            borderColor: colors.REMINDER + (isDark ? "40" : "30"),
            paddingVertical: viewMode === "card" ? 2 : 2.5,
            paddingHorizontal: viewMode === "card" ? 5 : 6,
            opacity: isSent ? 0.5 : 1,
          },
        ]}
      >
        <Ionicons
          name="alarm-outline"
          size={viewMode === "card" ? 10 : 11}
          color={colors.REMINDER}
        />
        <StyledText
          style={{
            color: colors.REMINDER,
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
          {isCrossedOut ? (
            <Ionicons
              name="notifications-off"
              size={viewMode === "card" ? 11 : 12}
              color={colors.ERROR_INPUT_TEXT}
            />
          ) : isSent ? (
            <Ionicons
              name="checkmark-done-outline"
              size={viewMode === "card" ? 11 : 12}
              color={colors.CHECKBOX_SUCCESS}
            />
          ) : (
            <Ionicons
              name="hourglass-outline"
              size={viewMode === "card" ? 11 : 12}
              color="#FFD166"
            />
          )}
        </View>
      )}
    </View>
  );
};

export default ReminderBadge;
