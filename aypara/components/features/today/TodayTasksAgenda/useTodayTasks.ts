import { getLocalIsoDate } from "@/helpers/date";
import { useTheme } from "@/hooks/useTheme";
import { selectBirthdays } from "@/store/slices/birthdaySlice";
import { selectNotifications } from "@/store/slices/notificationSlice";
import { selectTodos } from "@/store/slices/todoSlice";
import { Birthday } from "@/types/birthday";
import { Todo } from "@/types/todo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useSelector } from "react-redux";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// getLocalIsoDate from helpers/date is used instead

export type AgendaItem = (Todo | Birthday) & {
  isBirthday?: boolean;
};

export const useTodayTasks = () => {
  const { lang, t } = useTheme();
  const todos = useSelector(selectTodos);
  const birthdays = useSelector(selectBirthdays);
  const notifications = useSelector(selectNotifications);
  const router = useRouter();

  const params = useLocalSearchParams<{ date?: string }>();
  const [selectedDate, setSelectedDate] = useState(
    params.date || getLocalIsoDate(),
  );

  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null);
  const [activeModal, setActiveModal] = useState<"todo" | "birthday" | null>(
    null,
  );

  const flatListRef = useRef<FlatList>(null);

  const handleDateSelect = (date: string, index: number) => {
    setSelectedDate(date);
    flatListRef.current?.scrollToIndex({
      index: Math.max(0, index - 1),
      animated: true,
      viewOffset: 20,
    });
  };

  const dates = useMemo(() => {
    const d = [];
    for (let i = -7; i < 21; i++) {
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

  const initialScrollIndex = useMemo(() => {
    const index = dates.findIndex((d) => d.full === selectedDate);
    return Math.max(0, index - 1);
  }, [dates, selectedDate]);

  const tasksByHour = useMemo(() => {
    const map: Record<number, AgendaItem[]> = {};
    HOURS.forEach((h) => {
      map[h] = [];
    });

    // 1. Process Todos (including iterative)
    todos.forEach((todo) => {
      if (todo.isArchived) return;

      if (todo.reminder) {
        const d = new Date(todo.reminder);
        if (getLocalIsoDate(d) === selectedDate) {
          const hour = d.getHours();
          if (hour >= 0 && hour < 24) {
            map[hour].push(todo);
          }
        }
      }

      if (todo.isIterative && todo.iterativeDates) {
        todo.iterativeDates.forEach((occ) => {
          const d = new Date(occ.date);
          if (getLocalIsoDate(d) === selectedDate) {
            const hour = d.getHours();
            if (hour >= 0 && hour < 24) {
              // Avoid duplicates if both standard reminder and iterative occurrence match
              if (!map[hour].some((item) => item.id === todo.id)) {
                map[hour].push({
                  ...todo,
                  reminder: occ.date,
                  isCompleted: occ.isDone || false,
                  notificationId: occ.notificationId || todo.notificationId,
                });
              }
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
        const d = new Date(birthdayNotif.date);
        if (getLocalIsoDate(d) === selectedDate) {
          const hour = d.getHours();
          if (!isNaN(hour) && hour >= 0 && hour < 24) {
            map[hour].push({
              ...birthday,
              isBirthday: true,
              title: birthday.name,
            } as AgendaItem);
          }
        }
      }
    });

    Object.keys(map).forEach((h) => {
      map[Number(h)].sort((a, b) => {
        const dateA = new Date(
          (a as Todo).reminder ||
            notifications.find((n) => n.id === (a as Birthday).notificationId)
              ?.date ||
            0,
        ).getTime();
        const dateB = new Date(
          (b as Todo).reminder ||
            notifications.find((n) => n.id === (b as Birthday).notificationId)
              ?.date ||
            0,
        ).getTime();
        return dateA - dateB;
      });
    });

    return map;
  }, [todos, birthdays, notifications, selectedDate]);

  const hasTasks = useMemo(() => {
    return Object.values(tasksByHour).some((tasks) => tasks.length > 0);
  }, [tasksByHour]);

  const handleTaskPress = (item: AgendaItem) => {
    setSelectedItem(item);
    if (item.isBirthday) {
      setActiveModal("birthday");
    } else {
      setActiveModal("todo");
    }
  };

  const handleNavigateToPage = (item: AgendaItem) => {
    if (item.isBirthday) {
      router.push("/birthday");
    } else {
      router.push("/todo");
    }
  };

  return {
    selectedDate,
    setSelectedDate,
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
  };
};
