import { COLORS } from "@/constants/ui";
import Header from "@/layout/Header";
import TodoCreator from "@/layout/TodoCreator";
import TodoList from "@/layout/TodoList";
import { Todo } from "@/types/todo";
import { useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";

// Random ID generator 
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const defaultTodos: Todo[] = [
  {
    id: generateId(),
    title: "Buy milk",
    isCompleted: false,
  },
  {
    id: generateId(),
    title: "Buy bread",
    isCompleted: false,
  },
  {
    id: generateId(),
    title: "Buy eggs",
    isCompleted: false
  },
];

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>(defaultTodos);

  const onAddTodo = (title: Todo["title"]) => {
    setTodos([
      ...todos,
      {
        id: generateId(),
        title,
        isCompleted: false,
      },
    ])
  }

  const onDeleteTodo = (id: Todo["id"]) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const onEditTodo = (id: Todo["id"], title: Todo["title"]) => {
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, title } : todo))
  }

  const onCheckTodo = (id: Todo["id"]) => {
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo))
  }

  const completedTodos = todos.filter((todo) => todo.isCompleted)

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"light-content"}></StatusBar>
      <Header totalTodos={todos.length} completedTodos={completedTodos.length}></Header>
      <TodoCreator onAddTodo={onAddTodo} />
      <TodoList todos={todos} onDeleteTodo={onDeleteTodo} onCheckTodo={onCheckTodo} onEditTodo={onEditTodo}></TodoList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_BACKGROUND,
  },
});
