import { StyleSheet } from "react-native";

export const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
    },
    dateScrollContainer: {
      paddingVertical: 15,
      borderBottomWidth: 0.5,
    },
    dateItem: {
      width: 53,
      height: 60,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    weekdayText: {
      fontSize: 10,
      textTransform: "uppercase",
      fontWeight: "700",
      marginBottom: 4,
    },
    dayText: {
      fontSize: 18,
      fontWeight: "bold",
    },
    todayDot: {
      position: "absolute",
      bottom: 6,
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    hourRow: {
      flexDirection: "row",
      minHeight: 84,
    },
    timeLabelContainer: {
      width: 65,
      alignItems: "center",
      paddingTop: 8,
    },
    timeLabelText: {
      fontSize: 12,
      fontWeight: "500",
    },
    taskColumn: {
      flex: 1,
      paddingRight: 15,
      paddingVertical: 8,
      gap: 8,
    },
    taskCard: {
      borderRadius: 15,
      paddingVertical: 10,
      paddingHorizontal: 14,
      minHeight: 80,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.15)"
        : "rgba(59, 130, 246, 0.08)",
      borderWidth: 0.3,
      borderColor: isDark
        ? "rgba(100, 116, 139, 0.3)"
        : "rgba(100, 116, 139, 0.15)",
    },
    taskInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    categoryIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.PLACEHOLDER_SECOND + "10",
    },
    taskTextContent: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 14,
      fontWeight: "600",
    },
    metadataRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 6,
    },
    taskSubInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    taskTime: {
      fontSize: 11,
      fontWeight: "500",
    },
    iterativeBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
    },
    completedIcon: {
      marginLeft: 4,
    },
    emptyHourSlot: {
      height: 56,
    },
  });
