import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { formatDate, formatDuration, getShortMonthName } from "@/helpers/date";
import { getReminderStatusProps } from "@/helpers/reminder";
import { useTheme } from "@/hooks/useTheme";
import { useAppSelector } from "@/store";
import {
    NotificationStatus,
    selectNotificationById,
} from "@/store/slices/notificationSlice";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

type ViewTodoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: Todo["title"];
  createdAt: Todo["createdAt"];
  updatedAt?: Todo["updatedAt"];
  completedAt?: Todo["completedAt"];
  reminder?: string;
  reminderCancelled?: boolean;
  notificationId?: string;
  category?: string;
  isCompleted?: boolean;
  isIterative?: boolean;
  completedCount?: number;
  iterativeDates?: {
    date: string;
    notificationId?: string;
    isDone?: boolean;
    doneAt?: string;
  }[];
};

const ViewTodoModal: React.FC<ViewTodoModalProps> = ({
  isOpen,
  onClose,
  title,
  createdAt,
  updatedAt,
  completedAt,
  reminder,
  reminderCancelled,
  notificationId,
  category,
  isCompleted,
  isIterative,
  completedCount,
  iterativeDates,
}) => {
  const { t, lang, colors, isDark } = useTheme();
  const themedLocalStyles = useMemo(
    () => getStyles(colors, isDark),
    [colors, isDark],
  );

  const notification = useAppSelector((state) =>
    notificationId ? selectNotificationById(state, notificationId) : undefined,
  );
  const reminderStatus: NotificationStatus | undefined = notification?.status;

  const { isCrossedOut, iconName, iconColor, opacity } = getReminderStatusProps(
    reminderStatus,
    reminderCancelled,
    isCompleted,
    colors,
  );

  const getBalancedRows = (items: any[], maxPerRow: number = 5) => {
    const n = items.length;
    if (n === 0) return [];
    const rows = [];
    const rowCount = Math.ceil(n / maxPerRow);
    let start = 0;
    for (let i = 0; i < rowCount; i++) {
      const rowSize = Math.ceil((n - start) / (rowCount - i));
      rows.push(items.slice(start, start + rowSize));
      start += rowSize;
    }
    return rows;
  };

  return (
    <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true}>
      <View style={themedLocalStyles.container}>
        <View style={themedLocalStyles.headerRow}>
          <View style={themedLocalStyles.headerIconContainer}>
            <Ionicons
              name="eye-outline"
              size={28}
              color={colors.PRIMARY_ACTIVE_BUTTON}
            />
          </View>
          <StyledText style={themedLocalStyles.headerText}>
            {t("task_details")}
          </StyledText>
        </View>

        <View style={themedLocalStyles.divider} />

        <View style={themedLocalStyles.tableContainer}>
          {/* Title Row - Vertical Layout */}
          <View
            style={[
              themedLocalStyles.tableRow,
              { flexDirection: "column", alignItems: "flex-start", gap: 8 },
            ]}
          >
            <View style={[themedLocalStyles.tableLabelColumn, { flex: 0 }]}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color={colors.SECTION_TEXT}
              />
              <StyledText style={themedLocalStyles.tableLabelText}>
                {t("title")}
              </StyledText>
            </View>
            <View
              style={[
                themedLocalStyles.tableValueColumn,
                { flex: 0, paddingLeft: 28, alignItems: "flex-start" },
              ]}
            >
              <StyledText
                style={[
                  themedLocalStyles.tableValueText,
                  { textAlign: "left" },
                ]}
              >
                {title}
              </StyledText>
            </View>
          </View>
        </View>

        <View style={[themedLocalStyles.tableContainer, { marginTop: 4 }]}>
          {/* Category */}
          {category && (
            <View style={themedLocalStyles.tableRow}>
              <View style={themedLocalStyles.tableLabelColumn}>
                <Ionicons
                  name="grid-outline"
                  size={18}
                  color={colors.SECTION_TEXT}
                />
                <StyledText style={themedLocalStyles.tableLabelText}>
                  {t("category")}
                </StyledText>
              </View>
              <View style={themedLocalStyles.tableValueColumn}>
                <StyledText
                  style={[
                    themedLocalStyles.tableValueText,
                    { color: colors.SECTION_TEXT },
                  ]}
                >
                  {t(("category_" + category) as any)}
                </StyledText>
              </View>
            </View>
          )}

          {/* Reminder */}
          {reminder && (
            <View
              style={[
                themedLocalStyles.tableRow,
                themedLocalStyles.tableRowBorder,
              ]}
            >
              <View style={themedLocalStyles.tableLabelColumn}>
                <Ionicons
                  name="alarm-outline"
                  size={18}
                  color={colors.SECTION_TEXT}
                />
                <StyledText style={themedLocalStyles.tableLabelText}>
                  {t("reminder")}
                </StyledText>
              </View>
              <View style={themedLocalStyles.tableValueColumn}>
                <View
                  style={[
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    },
                    { opacity: opacity },
                  ]}
                >
                  <Ionicons
                    name={iconName as any}
                    size={14}
                    color={iconColor}
                  />
                  <StyledText
                    style={[
                      themedLocalStyles.tableValueText,
                      {
                        color: colors.SECTION_TEXT,
                        textDecorationLine: isCrossedOut
                          ? "line-through"
                          : "none",
                      },
                    ]}
                  >
                    {formatDate(reminder, lang)}
                  </StyledText>
                </View>
              </View>
            </View>
          )}

          {/* Iterative Dates */}
          {isIterative && iterativeDates && iterativeDates.length > 0 && (
            <View
              style={[
                themedLocalStyles.tableRow,
                themedLocalStyles.tableRowBorder,
                { flexDirection: "column", alignItems: "flex-start", gap: 10 },
              ]}
            >
              <View
                style={[
                  themedLocalStyles.tableLabelColumn,
                  { flex: 0, width: "100%" },
                ]}
              >
                <Ionicons
                  name="repeat-outline"
                  size={18}
                  color={colors.SECTION_TEXT}
                />
                <StyledText style={themedLocalStyles.tableLabelText}>
                  {t("menu_add_iterative")} ({completedCount || 0}/
                  {iterativeDates.length})
                </StyledText>
              </View>
              <View style={themedLocalStyles.iterativeContainer}>
                {getBalancedRows(iterativeDates, 5).map((row, rowIdx) => (
                  <View
                    key={rowIdx}
                    style={themedLocalStyles.miniCalendarWrapper}
                  >
                    {row.map((item, idx) => {
                      const dateObj = new Date(item.date);
                      const isDone = item.isDone;
                      return (
                        <View
                          key={idx}
                          style={[
                            themedLocalStyles.miniCalendarContainer,
                            isDone && {
                              borderColor: colors.CHECKBOX_SUCCESS + "40",
                            },
                          ]}
                        >
                          <View
                            style={[
                              themedLocalStyles.miniCalendarHeader,
                              isDone && {
                                backgroundColor: colors.CHECKBOX_SUCCESS,
                              },
                            ]}
                          >
                            <StyledText
                              style={themedLocalStyles.miniCalendarHeaderText}
                            >
                              {getShortMonthName(dateObj, lang)}
                            </StyledText>
                          </View>
                          <View style={themedLocalStyles.miniCalendarBody}>
                            {isDone ? (
                              <Ionicons
                                name="checkmark-sharp"
                                size={12}
                                color={colors.CHECKBOX_SUCCESS}
                              />
                            ) : (
                              <StyledText
                                style={[
                                  themedLocalStyles.miniCalendarBodyText,
                                  { color: colors.PRIMARY_TEXT },
                                ]}
                              >
                                {dateObj.getDate().toString().padStart(2, "0")}
                              </StyledText>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          )}
          {/* Time Elapsed / Execution Time */}
          <View
            style={[
              themedLocalStyles.tableRow,
              themedLocalStyles.tableRowBorder,
            ]}
          >
            <View style={themedLocalStyles.tableLabelColumn}>
              <Ionicons
                name="timer-outline"
                size={18}
                color={colors.SECTION_TEXT}
              />
              <StyledText style={themedLocalStyles.tableLabelText}>
                {completedAt ? t("execution_time") : t("time_elapsed")}
              </StyledText>
            </View>
            <View style={themedLocalStyles.tableValueColumn}>
              <StyledText style={themedLocalStyles.tableValueText}>
                {formatDuration(
                  createdAt,
                  completedAt || new Date().toISOString(),
                  t,
                )}
              </StyledText>
            </View>
          </View>

          {/* Created At */}
          <View
            style={[
              themedLocalStyles.tableRow,
              themedLocalStyles.tableRowBorder,
            ]}
          >
            <View style={themedLocalStyles.tableLabelColumn}>
              <Ionicons
                name="calendar-clear-outline"
                size={18}
                color={colors.SECTION_TEXT}
              />
              <StyledText style={themedLocalStyles.tableLabelText}>
                {t("created")}
              </StyledText>
            </View>
            <View style={themedLocalStyles.tableValueColumn}>
              <StyledText style={themedLocalStyles.tableValueText}>
                {formatDate(createdAt, lang)}
              </StyledText>
            </View>
          </View>

          {/* Updated At */}
          {updatedAt && (
            <View
              style={[
                themedLocalStyles.tableRow,
                themedLocalStyles.tableRowBorder,
              ]}
            >
              <View style={themedLocalStyles.tableLabelColumn}>
                <Ionicons
                  name="sync-outline"
                  size={18}
                  color={colors.SECTION_TEXT}
                />
                <StyledText style={themedLocalStyles.tableLabelText}>
                  {t("edited")}
                </StyledText>
              </View>
              <View style={themedLocalStyles.tableValueColumn}>
                <StyledText style={themedLocalStyles.tableValueText}>
                  {formatDate(updatedAt, lang)}
                </StyledText>
              </View>
            </View>
          )}

          {/* Completed At */}
          {completedAt && (
            <View
              style={[
                themedLocalStyles.tableRow,
                themedLocalStyles.tableRowBorder,
              ]}
            >
              <View style={themedLocalStyles.tableLabelColumn}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={colors.SECTION_TEXT}
                />
                <StyledText style={themedLocalStyles.tableLabelText}>
                  {t("completed")}
                </StyledText>
              </View>
              <View style={themedLocalStyles.tableValueColumn}>
                <StyledText style={themedLocalStyles.tableValueText}>
                  {formatDate(completedAt, lang)}
                </StyledText>
              </View>
            </View>
          )}
        </View>

        <View style={{ marginTop: 12, width: "100%" }}>
          <StyledButton
            label={t("close")}
            onPress={onClose}
            variant="dark_button"
          />
        </View>
      </View>
    </StyledModal>
  );
};

export default ViewTodoModal;
