import { useAppSelector } from "@/store";
import { selectTodos } from "@/store/slices/todoSlice";
import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  const todos = useAppSelector(selectTodos);

  const hasTaskToday = React.useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return todos.some(
      (todo) =>
        !todo.isCompleted &&
        !todo.isArchived &&
        todo.reminder &&
        todo.reminder.split("T")[0] === today,
    );
  }, [todos]);

  if (hasTaskToday) {
    return <Redirect href="/(tabs)/today" />;
  }

  return <Redirect href="/(tabs)" />;
}
