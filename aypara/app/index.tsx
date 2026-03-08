import { getLocalIsoDate } from "@/helpers/date";
import { useAppSelector } from "@/store";
import { selectTodos } from "@/store/slices/todoSlice";
import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  const todos = useAppSelector(selectTodos);

  const hasTaskToday = React.useMemo(() => {
    const today = getLocalIsoDate();
    return todos.some(
      (todo) =>
        !todo.isCompleted &&
        !todo.isArchived &&
        todo.reminder &&
        getLocalIsoDate(new Date(todo.reminder)) === today,
    );
  }, [todos]);

  if (hasTaskToday) {
    return <Redirect href="/(tabs)/today" />;
  }

  return <Redirect href="/(tabs)" />;
}
