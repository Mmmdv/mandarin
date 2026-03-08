import EmptyState from "@/components/ui/EmptyState";
import StyledHeader from "@/components/ui/StyledHeader";
import StyledText from "@/components/ui/StyledText";
import { TODO_CATEGORIES } from "@/constants/todo";
import { formatTimeOnly, getLocalIsoDate } from "@/helpers/date";
import { getReminderStatusProps } from "@/helpers/reminder";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BirthdayViewModal from "../../birthday/modals/BirthdayViewModal";
import ViewTodoModal from "../../todo/modals/ViewTodoModal.tsx";
import { getStyles } from "./styles";
import { AgendaItem, useTodayTasks } from "./useTodayTasks";

export default function TodayTasksAgenda() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, isDark);

  const {
    selectedDate,
    dates,
    tasksByHour,
    hasTasks,
    handleDateSelect,
    handleTaskPress,
    handleNavigateToPage,
    notifications,
    selectedItem,
    setSelectedItem,
    activeModal,
    setActiveModal,
    flatListRef,
    initialScrollIndex,
    t,
  } = useTodayTasks();

  const renderTask = (item: AgendaItem) => {
    const pageIcon = item.isBirthday ? "gift-outline" : "list-outline";
    const categoryId = item.isBirthday ? "birthday" : (item as any).category;
    const categoryData = TODO_CATEGORIES.find((c) => c.id === categoryId);
    const categoryIcon = item.isBirthday
      ? "gift"
      : categoryData?.icon || "list";

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => handleTaskPress(item)}
        activeOpacity={0.7}
        style={styles.taskCard}
      >
        <View style={styles.taskInfo}>
          <View style={styles.categoryIconContainer}>
            <Ionicons
              name={pageIcon as any}
              size={18}
              color={colors.PLACEHOLDER_SECOND}
            />
          </View>
          <View style={styles.taskTextContent}>
            <StyledText
              style={[styles.taskTitle, { color: colors.PRIMARY_TEXT }]}
              numberOfLines={1}
            >
              {item.isBirthday ? (item as any).name : (item as any).title}
            </StyledText>

            {!item.isBirthday &&
              (categoryId ||
                (item as any).isIterative ||
                (item as any).reminder) && (
                <View style={styles.metadataRow}>
                  {categoryId && (
                    <Ionicons
                      name={categoryIcon as any}
                      size={12}
                      color={colors.PLACEHOLDER_SECOND}
                      style={{ opacity: 0.8 }}
                    />
                  )}
                  {(item as any).isIterative && (
                    <Ionicons
                      name="repeat"
                      size={12}
                      color={colors.PLACEHOLDER_SECOND}
                      style={{ opacity: 0.8 }}
                    />
                  )}
                  {(item as any).reminder && (
                    <Ionicons
                      name={
                        getReminderStatusProps(
                          notifications.find(
                            (n: any) => n.id === (item as any).notificationId,
                          )?.status,
                          (item as any).reminderCancelled,
                          (item as any).isCompleted,
                          colors,
                        ).iconName
                      }
                      size={12}
                      color={colors.PLACEHOLDER_SECOND}
                      style={{
                        opacity: 1,
                      }}
                    />
                  )}
                  {(item as any).isCompleted && (
                    <Ionicons
                      name="checkbox"
                      size={12}
                      color={colors.PLACEHOLDER_SECOND}
                      style={{ opacity: 0.8 }}
                    />
                  )}
                </View>
              )}

            {((item.isBirthday && selectedDate === getLocalIsoDate()) ||
              (!item.isBirthday && (item as any).reminder)) && (
              <View style={styles.taskSubInfo}>
                {item.isBirthday && selectedDate === getLocalIsoDate() && (
                  <>
                    <Ionicons
                      name={
                        (item as any).greetingSent
                          ? "checkmark-done-outline"
                          : "mail-unread-outline"
                      }
                      size={12}
                      color={colors.PLACEHOLDER_SECOND}
                      style={{ opacity: 0.8 }}
                    />
                    <StyledText
                      style={[
                        styles.taskTime,
                        { color: colors.PLACEHOLDER_SECOND },
                      ]}
                    >
                      {t(
                        (item as any).greetingSent
                          ? "status_sent"
                          : "status_not_sent",
                      )}
                    </StyledText>
                  </>
                )}
                {!item.isBirthday && (item as any).reminder && (
                  <StyledText
                    style={[
                      styles.taskTime,
                      { color: colors.PLACEHOLDER_SECOND },
                    ]}
                  >
                    {formatTimeOnly(new Date((item as any).reminder))}
                  </StyledText>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleNavigateToPage(item);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              padding: 4,
              marginLeft: 4,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.03)",
              borderRadius: 8,
            }}
          >
            <Ionicons
              name="arrow-forward-outline"
              size={16}
              color={colors.PLACEHOLDER_SECOND}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSchedule = () => {
    const rows = [];
    let i = 0;
    while (i < 24) {
      const tasks = tasksByHour[i];
      if (tasks.length > 0) {
        rows.push(
          <View key={i} style={styles.hourRow}>
            <View style={styles.timeLabelContainer}>
              <StyledText
                style={[styles.timeLabelText, { color: colors.PLACEHOLDER }]}
              >
                {`${i.toString().padStart(2, "0")}:00`}
              </StyledText>
            </View>
            <View
              style={[styles.taskColumn, { borderTopColor: "transparent" }]}
            >
              {tasks.map((task) => renderTask(task))}
            </View>
          </View>,
        );
        i++;
      } else {
        let startHour = i;
        let endHour = i;
        while (endHour + 1 < 24 && tasksByHour[endHour + 1].length === 0) {
          endHour++;
        }

        if (startHour === endHour) {
          rows.push(
            <View key={startHour} style={styles.hourRow}>
              <View style={styles.timeLabelContainer}>
                <StyledText
                  style={[styles.timeLabelText, { color: colors.PLACEHOLDER }]}
                >
                  {`${startHour.toString().padStart(2, "0")}:00`}
                </StyledText>
              </View>
              <View
                style={[styles.taskColumn, { borderTopColor: "transparent" }]}
              >
                <View style={styles.emptyHourSlot} />
              </View>
            </View>,
          );
        } else {
          rows.push(
            <View key={`empty-${startHour}-${endHour}`} style={styles.hourRow}>
              <View
                style={[
                  styles.timeLabelContainer,
                  { justifyContent: "center", paddingTop: 0 },
                ]}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={12}
                  color={colors.PLACEHOLDER}
                  style={{ opacity: 0.5 }}
                />
              </View>
              <View
                style={[
                  styles.taskColumn,
                  {
                    borderTopColor: "transparent",
                    justifyContent: "center",
                    minHeight: 56,
                  },
                ]}
              >
                <StyledText
                  style={{
                    color: colors.PLACEHOLDER,
                    fontSize: 12,
                    fontStyle: "italic",
                    opacity: 0.7,
                  }}
                >
                  {`${startHour.toString().padStart(2, "0")}:00 - ${endHour.toString().padStart(2, "0")}:59 (${t("today_no_tasks_interval" as any)})`}
                </StyledText>
              </View>
            </View>,
          );
        }
        i = endHour + 1;
      }
    }
    return rows;
  };

  return (
    <View
      style={[
        styles.mainContainer,
        { backgroundColor: colors.PRIMARY_BACKGROUND },
      ]}
    >
      <StyledHeader title={t("today_tasks_header" as any)} />

      <View
        style={[
          styles.dateScrollContainer,
          { borderBottomColor: colors.PRIMARY_BORDER_DARK },
        ]}
      >
        <FlatList
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={dates}
          keyExtractor={(item) => item.full}
          initialScrollIndex={initialScrollIndex}
          getItemLayout={(_, index) => ({
            length: 65,
            offset: 65 * index,
            index,
          })}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          renderItem={({ item, index }) => {
            const isSelected = selectedDate === item.full;
            return (
              <TouchableOpacity
                onPress={() => handleDateSelect(item.full, index)}
                activeOpacity={0.7}
                style={[
                  styles.dateItem,
                  {
                    backgroundColor: isSelected
                      ? "#234E94"
                      : isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                    borderColor: isSelected ? "#234E94" : "transparent",
                  },
                ]}
              >
                <StyledText
                  style={[
                    styles.weekdayText,
                    { color: isSelected ? "#fff" : colors.PLACEHOLDER },
                  ]}
                >
                  {item.weekday}
                </StyledText>
                <StyledText
                  style={[
                    styles.dayText,
                    { color: isSelected ? "#fff" : colors.PRIMARY_TEXT },
                  ]}
                >
                  {item.day}
                </StyledText>
                {item.isToday && !isSelected && (
                  <View
                    style={[styles.todayDot, { backgroundColor: "#234E94" }]}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
          flexGrow: 1,
        }}
      >
        {!hasTasks ? (
          <View style={{ flex: 1, paddingTop: 60 }}>
            <EmptyState
              icon="calendar-outline"
              title={t("today_tasks_empty_title")}
              description={t("today_tasks_empty_desc")}
            />
          </View>
        ) : (
          renderSchedule()
        )}
      </ScrollView>

      {/* Detail Modals */}
      {selectedItem && !selectedItem.isBirthday && (
        <ViewTodoModal
          isOpen={activeModal === "todo"}
          onClose={() => {
            setActiveModal(null);
            setSelectedItem(null);
          }}
          {...(selectedItem as any)}
        />
      )}

      {selectedItem && selectedItem.isBirthday && (
        <BirthdayViewModal
          isOpen={activeModal === "birthday"}
          onClose={() => {
            setActiveModal(null);
            setSelectedItem(null);
          }}
          birthday={selectedItem as any}
        />
      )}
    </View>
  );
}
