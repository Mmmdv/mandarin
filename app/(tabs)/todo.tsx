import { COLORS } from "@/constants/ui";
import useTodo from "@/hooks/useTodo";
import AddTodoModal from "@/layout/Modals/AddTodoModal";
import TodoList from "@/layout/TodoList";
import { useEffect, useState } from "react";
import { Platform, StatusBar, StyleSheet, UIManager, View } from "react-native";

export default function Index() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  const {
    todos,
    completedTodos,
    archivedTodos,
    onAddTodo,
    onDeleteTodo,
    onEditTodo,
    onCheckTodo,
    onArchiveTodo,
    onArchiveAll,
    onClearArchive,
  } = useTodo();

  const handleAddTodo = (title: string, reminder?: string, notificationId?: string) => {
    onAddTodo(title, reminder, notificationId);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"light-content"}></StatusBar>
      <TodoList
        todos={todos}
        onDeleteTodo={onDeleteTodo}
        onCheckTodo={onCheckTodo}
        onEditTodo={onEditTodo}
        onArchiveTodo={onArchiveTodo}
        onArchiveAll={onArchiveAll}
        onClearArchive={onClearArchive}
        archivedTodos={archivedTodos}
        onAddRequest={() => setIsAddModalOpen(true)}
      />

      <AddTodoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTodo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_BACKGROUND,
    paddingBottom: 110,
  },
});
