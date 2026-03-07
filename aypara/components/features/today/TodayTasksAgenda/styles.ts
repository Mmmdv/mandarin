import { StyleSheet } from "react-native";

export const getStyles = (colors: any) =>
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
      minHeight: 60,
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
      borderTopWidth: 0.5,
      paddingRight: 15,
      paddingVertical: 5,
      gap: 6,
    },
    taskCard: {
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderWidth: 0.5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    },
    taskTextContent: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 14,
      fontWeight: "600",
    },
    taskSubInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
    },
    taskTime: {
      fontSize: 11,
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
      height: 40,
    },
  });
