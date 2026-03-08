import { StyleSheet } from "react-native";

export const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    mainContainer: {
      marginBottom: 2.5,
      marginTop: 3,
    },
    headerCard: {
      backgroundColor: isDark
        ? "rgba(79, 70, 229, 0.2)"
        : "rgba(79, 70, 229, 0.1)",
      borderWidth: 0.3,
      borderColor: isDark
        ? "rgba(100, 116, 139, 0.3)"
        : "rgba(100, 116, 139, 0.15)",
      borderRadius: 20,
      paddingVertical: 13,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      overflow: "hidden",
    },
    iconContainer: {
      width: 30,
      height: 30,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    badge: {
      minWidth: 20,
      height: 20,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
      backgroundColor: isDark
        ? "rgba(35, 78, 148, 0.15)"
        : "rgba(35, 78, 148, 0.1)",
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "bold",
    },
    chevronContainer: {
      width: 24,
      alignItems: "flex-end",
      justifyContent: "center",
      zIndex: 2,
    },
    decorativeCircle: {
      position: "absolute",
      backgroundColor: isDark
        ? "rgba(35, 78, 148, 0.3)"
        : "rgba(35, 78, 148, 0.15)",
      width: 80,
      height: 80,
      borderRadius: 40,
      bottom: -20,
      right: -20,
    },
    expandedContent: {
      marginTop: 15,
    },
    dateStripWrapper: {
      marginBottom: 15,
    },
    dateStripContent: {
      gap: 10,
      paddingHorizontal: 2,
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
      backgroundColor: "#234E94",
    },
    emptyCard: {
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 210,
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.15)"
        : "rgba(59, 130, 246, 0.08)",
      borderWidth: 0.3,
      borderColor: isDark
        ? "rgba(100, 116, 139, 0.2)"
        : "rgba(100, 116, 139, 0.1)",
    },
    emptyIconContainer: {
      width: 45,
      height: 45,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      backgroundColor: "#8591acff",
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    emptySubtext: {
      fontSize: 14,
      opacity: 0.7,
    },
    tasksContainer: {
      gap: 6,
    },
    taskItem: {
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
    taskTitle: {
      fontSize: 14,
      fontWeight: "600",
    },
    footerSide: {
      justifyContent: "center",
      alignItems: "center",
      padding: 4,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      borderRadius: 8,
    },
    metadataRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 6,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    timeText: {
      fontSize: 11,
      fontWeight: "500",
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 36,
      paddingHorizontal: 16,
      borderRadius: 10,
      gap: 6,
      marginTop: 8,
    },
    viewAllText: {
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#FFF" : colors.SECTION_TEXT,
    },
    separatorContainer: {
      marginTop: 28,
      marginBottom: 10,
      alignItems: "center",
    },
    separatorLine: {
      width: 25,
      height: 1,
      borderRadius: 5,
      backgroundColor: colors.PRIMARY_BORDER,
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.SECTION_TEXT,
      marginBottom: 0,
      zIndex: 2,
    },
  });
