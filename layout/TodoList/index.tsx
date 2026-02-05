import { Todo } from "@/types/todo"
import { FlatList, View } from "react-native"
import TodoItem from "../TodoItem"

type TodoListProps = {
    todos: Todo[]
    onDeleteTodo: (id: Todo["id"]) => void
    onCheckTodo: (id: Todo["id"]) => void
    onEditTodo: (id: Todo["id"], title: Todo["title"]) => void
}

const TodoList: React.FC<TodoListProps> = ({ todos, onDeleteTodo, onCheckTodo, onEditTodo }) => {
    return <>
        <View>
            <FlatList data={todos} keyExtractor={(todo) => todo.id.toString()} renderItem={({ item }) =>
                <TodoItem
                    id={item.id}
                    title={item.title}
                    isCompleted={item.isCompleted}
                    deleteTodo={onDeleteTodo}
                    checkTodo={onCheckTodo}
                    editTodo={onEditTodo} />
            } />
        </View></>
}

export default TodoList