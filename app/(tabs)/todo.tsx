import GestureWrapper from "@/components/layout/GestureWrapper";
import { COLORS } from "@/constants/ui";
import { useTheme } from "@/hooks/useTheme";
import useTodo from "@/hooks/useTodo";
import AddTodoModal from "@/components/features/todo/modals/AddTodoModal";
import TodoList from "@/components/features/todo/TodoList";
import { useEffect, useState } from "react";
import { Platform, StatusBar, StyleSheet, UIManager, View } from "react-native";

export default function Index() {
  const { t } = useTheme();
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
    archivedTodos,
    onAddTodo,
    onDeleteTodo,
    onEditTodo,
    onCheckTodo,
    onArchiveTodo,
    onRetryTodo,
    onArchiveAll,
    onClearArchive,
  } = useTodo();

  const handleAddTodo = (title: string, reminder?: string, notificationId?: string) => {
    onAddTodo(title, reminder, notificationId);
  }

  return (
    <GestureWrapper>
      <View style={styles.container}>
        <StatusBar barStyle={"light-content"}></StatusBar>
        <TodoList
          todos={todos}
          onDeleteTodo={onDeleteTodo}
          onCheckTodo={onCheckTodo}
          onEditTodo={onEditTodo}
          onArchiveTodo={onArchiveTodo}
          onRetryTodo={onRetryTodo}
          onArchiveAll={onArchiveAll}
          onClearArchive={onClearArchive}
          archivedTodos={archivedTodos}
          onAddRequest={() => setIsAddModalOpen(true)}
          categoryTitle={t("tab_todo")}
          categoryIcon="list"
        />

        <AddTodoModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddTodo}
          categoryTitle={t("tab_todo")}
          categoryIcon="list"
        />
      </View>
    </GestureWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_BACKGROUND,
    paddingBottom: 0,
  },
});
