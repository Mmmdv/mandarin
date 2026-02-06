import { COLORS } from "@/constants/ui";
import useTodo from "@/hooks/useTodo";
import Header from "@/layout/Header";
import TodoCreator from "@/layout/TodoCreator";
import TodoList from "@/layout/TodoList";
import { StatusBar, StyleSheet, View } from "react-native";

export default function Index() {

  const {
    todos,
    completedTodos,
    onAddTodo,
    onDeleteTodo,
    onEditTodo,
    onCheckTodo,
  } = useTodo();

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
