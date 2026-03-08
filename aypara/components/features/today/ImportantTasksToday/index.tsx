import StyledText from "@/components/ui/StyledText";
import { toggleAnimation } from "@/constants/animations";
import { TODO_CATEGORIES } from "@/constants/todo";
import { formatDate, getLocalIsoDate } from "@/helpers/date";
import { getReminderStatusProps } from "@/helpers/reminder";
import { useTheme } from "@/hooks/useTheme";
import { selectBirthdays } from "@/store/slices/birthdaySlice";
import { selectNotifications } from "@/store/slices/notificationSlice";
import { selectTodos } from "@/store/slices/todoSlice";
import { Birthday } from "@/types/birthday";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  LayoutAnimation,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import BirthdayViewModal from "../../birthday/modals/BirthdayViewModal";
import ViewTodoModal from "../../todo/modals/ViewTodoModal.tsx";
import { getStyles } from "./styles";

export default function ImportantTasksToday() {
  const { colors, t, lang, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const todos = useSelector(selectTodos);
  const birthdays = useSelector(selectBirthdays);
  const notifications = useSelector(selectNotifications);
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getLocalIsoDate());
  const expandAnim = useRef(new Animated.Value(1)).current;
  const dateListRef = useRef<FlatList>(null);

  const [selectedItem, setSelectedItem] = useState<
    (Todo | Birthday | any) | null
  >(null);
  const [activeModal, setActiveModal] = useState<"todo" | "birthday" | null>(
    null,
  );

  // Generate dates: 3 days past + today + 14 days future
  const dates = useMemo(() => {
    const d = [];
    for (let i = -3; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      d.push({
        full: getLocalIsoDate(date),
        day: date.getDate(),
        weekday: date.toLocaleDateString(
          lang === "az" ? "az-AZ" : lang === "ru" ? "ru-RU" : "en-US",
          { weekday: "short" },
        ),
        isToday: i === 0,
      });
    }
    return d;
  }, [lang]);

  const toggleExpanded = () => {
    setIsExpanded((prev) => {
      const newValue = !prev;
      Animated.timing(expandAnim, {
        toValue: newValue ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      LayoutAnimation.configureNext(toggleAnimation);
      return newValue;
    });
  };

  const handleDateSelect = (date: string, index: number) => {
    setSelectedDate(date);
    dateListRef.current?.scrollToIndex({
      index: Math.max(0, index - 1),
      animated: true,
      viewOffset: 2,
    });
  };

  const getRotation = () =>
    expandAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "90deg"],
    });

  const getCircleTransform = () => ({
    transform: [
      {
        translateX: expandAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
      {
        translateY: expandAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
      {
        scale: expandAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.8],
        }),
      },
    ],
    opacity: expandAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.4],
    }),
  });

  const agendaItems = useMemo(() => {
    const list: any[] = [];

    // 1. Process Todos
    todos.forEach((todo) => {
      if (todo.isArchived) return;

      if (todo.reminder) {
        if (getLocalIsoDate(new Date(todo.reminder)) === selectedDate) {
          list.push({ ...todo, isBirthday: false });
        }
      }

      if (todo.isIterative && todo.iterativeDates) {
        todo.iterativeDates.forEach((occ) => {
          if (getLocalIsoDate(new Date(occ.date)) === selectedDate) {
            if (!list.some((item) => item.id === todo.id)) {
              list.push({
                ...todo,
                reminder: occ.date,
                isCompleted: occ.isDone || false,
                isBirthday: false,
              });
            }
          }
        });
      }
    });

    // 2. Process Birthdays
    birthdays.forEach((birthday) => {
      const birthdayNotif = notifications.find(
        (n) => n.id === birthday.notificationId,
      );
      if (birthdayNotif) {
        if (getLocalIsoDate(new Date(birthdayNotif.date)) === selectedDate) {
          list.push({
            ...birthday,
            isBirthday: true,
            title: birthday.name,
            reminder: birthdayNotif.date,
          });
        }
      }
    });

    return list.sort(
      (a, b) => new Date(a.reminder).getTime() - new Date(b.reminder).getTime(),
    );
  }, [todos, birthdays, notifications, selectedDate]);

  const handleTaskPress = (item: any) => {
    setSelectedItem(item);
    if (item.isBirthday) {
      setActiveModal("birthday");
    } else {
      setActiveModal("todo");
    }
  };

  const handleNavigateToPage = (item: any) => {
    if (item.isBirthday) {
      router.push("/birthday");
    } else {
      router.push("/todo");
    }
  };

  const handleViewAll = () => {
    router.push({
      pathname: "/today-tasks",
      params: { date: selectedDate },
    });
  };

  const getTimeFromReminder = (reminder: string) => {
    return formatDate(reminder, lang).split(" ")[1];
  };

  return (
    <View style={styles.mainContainer}>
      <Pressable onPress={toggleExpanded} style={styles.headerCard}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDark
                ? "rgba(35, 78, 148, 0.55)"
                : "rgba(35, 78, 148, 0.2)",
              zIndex: 2,
            },
          ]}
        >
          <Ionicons
            name="notifications"
            size={17}
            color={isDark ? colors.SECTION_TEXT : colors.PRIMARY_TEXT}
          />
        </View>
        <StyledText style={styles.headerTitle}>
          {selectedDate === getLocalIsoDate()
            ? t("today_tasks_header")
            : t("tasks")}
        </StyledText>
        {agendaItems.length > 0 && (
          <View style={styles.badge}>
            <StyledText
              style={[styles.badgeText, { color: colors.SECTION_TEXT }]}
            >
              {agendaItems.length}
            </StyledText>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <View style={styles.chevronContainer}>
          <Animated.View style={{ transform: [{ rotate: getRotation() }] }}>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={colors.SECTION_TEXT}
            />
          </Animated.View>
        </View>
        <Animated.View
          style={[styles.decorativeCircle, getCircleTransform()]}
          pointerEvents="none"
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Date Strip */}
          <View style={styles.dateStripWrapper}>
            <FlatList
              ref={dateListRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={dates}
              keyExtractor={(item) => item.full}
              initialScrollIndex={2}
              getItemLayout={(_, index) => ({
                length: 65, // width (53) + gap (12)
                offset: 65 * index,
                index,
              })}
              contentContainerStyle={styles.dateStripContent}
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
                            ? "rgba(100, 116, 139, 0.1)"
                            : "rgba(100, 116, 139, 0.05)",
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
                      <View style={styles.todayDot} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {agendaItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="checkmark-done-circle"
                  size={35}
                  color="#fefeffff"
                />
              </View>
              <StyledText
                style={[
                  styles.emptyText,
                  {
                    color: isDark ? colors.PRIMARY_BORDER : colors.SECTION_TEXT,
                  },
                ]}
              >
                {selectedDate === getLocalIsoDate()
                  ? t("today_no_tasks")
                  : t("selected_date_no_tasks")}
              </StyledText>
              <StyledText
                style={[
                  styles.emptySubtext,
                  {
                    color: isDark ? colors.PRIMARY_BORDER : colors.PLACEHOLDER,
                  },
                ]}
              >
                {t("today_have_nice_day")}
              </StyledText>
            </View>
          ) : (
            <View style={styles.tasksContainer}>
              {agendaItems.map((item, index) => {
                if (index >= 3) return null;

                const categoryData = !item.isBirthday
                  ? TODO_CATEGORIES.find((c) => c.id === item.category)
                  : null;
                const categoryIcon = item.isBirthday
                  ? "gift"
                  : categoryData?.icon || "list";
                const pageIcon = item.isBirthday
                  ? "gift-outline"
                  : "list-outline";

                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.taskItem,
                      {
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                    onPress={() => handleTaskPress(item)}
                  >
                    {/* Left Page Icon */}
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: colors.PLACEHOLDER_SECOND + "10" },
                      ]}
                    >
                      <Ionicons
                        name={pageIcon as any}
                        size={16}
                        color={colors.PLACEHOLDER_SECOND}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <StyledText
                        style={[
                          styles.taskTitle,
                          { color: colors.PRIMARY_TEXT },
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </StyledText>
                      {!item.isBirthday &&
                        (categoryData ||
                          item.isIterative ||
                          (item as any).reminder ||
                          item.isCompleted) && (
                          <View style={styles.metadataRow}>
                            {categoryData && (
                              <Ionicons
                                name={categoryIcon as any}
                                size={12}
                                color={colors.PLACEHOLDER_SECOND}
                                style={{ opacity: 0.8 }}
                              />
                            )}
                            {item.isIterative && (
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
                                      (n) =>
                                        n.id === (item as any).notificationId,
                                    )?.status,
                                    (item as any).reminderCancelled,
                                    item.isCompleted,
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
                            {item.isCompleted && (
                              <Ionicons
                                name="checkbox"
                                size={12}
                                color={colors.PLACEHOLDER_SECOND}
                                style={{ opacity: 0.8 }}
                              />
                            )}
                          </View>
                        )}
                      {((item.isBirthday &&
                        selectedDate === getLocalIsoDate()) ||
                        (!item.isBirthday && (item as any).reminder)) && (
                        <View style={[styles.timeContainer, { marginTop: 4 }]}>
                          {item.isBirthday &&
                            selectedDate === getLocalIsoDate() && (
                              <>
                                <Ionicons
                                  name={
                                    (item as any).greetingSent
                                      ? "checkmark-done-outline"
                                      : "mail-unread-outline"
                                  }
                                  size={13}
                                  color={colors.PLACEHOLDER_SECOND}
                                  style={{ opacity: 0.8 }}
                                />
                                <StyledText
                                  style={[
                                    styles.timeText,
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
                                styles.timeText,
                                { color: colors.PLACEHOLDER_SECOND },
                              ]}
                            >
                              {getTimeFromReminder(item.reminder!)}
                            </StyledText>
                          )}
                        </View>
                      )}
                    </View>

                    <Pressable
                      style={styles.footerSide}
                      onPress={() => handleNavigateToPage(item)}
                    >
                      <Ionicons
                        name="arrow-forward-outline"
                        size={16}
                        color={colors.PLACEHOLDER_SECOND}
                      />
                    </Pressable>
                  </Pressable>
                );
              })}
              {agendaItems.length > 3 && (
                <Pressable
                  style={({ pressed }) => [
                    styles.viewAllButton,
                    {
                      backgroundColor: isDark
                        ? "rgba(35, 78, 148, 0.9)"
                        : "rgba(35, 78, 148, 0.1)",
                      opacity: pressed ? 0.7 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                  onPress={handleViewAll}
                >
                  <StyledText style={styles.viewAllText}>
                    {t("today_view_more")} ({agendaItems.length - 3})
                  </StyledText>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={isDark ? "#FFF" : colors.SECTION_TEXT}
                  />
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}

      {/* Detail Modals */}
      {selectedItem && !selectedItem.isBirthday && (
        <ViewTodoModal
          isOpen={activeModal === "todo"}
          onClose={() => {
            setActiveModal(null);
            setSelectedItem(null);
          }}
          {...selectedItem}
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

      {isExpanded && (
        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
        </View>
      )}
    </View>
  );
}
