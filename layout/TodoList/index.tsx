import StyledText from "@/components/StyledText"
import { toggleAnimation } from "@/constants/animations"
import { sortTodos } from "@/helpers/sort"
import { useTheme } from "@/hooks/useTheme"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import { Animated, Easing, Image, LayoutAnimation, RefreshControl, TouchableOpacity, View } from "react-native"
import ArchiveAllModal from "../Modals/ArchiveAllModal.tsx"
import ClearArchiveModal from "../Modals/ClearArchiveModal.tsx"
import TodoItem from "../TodoItem"
import SortControls, { SortBy, SortOrder } from "./SortControls"
import { styles } from "./styles"

type TodoListProps = {
    todos: Todo[]
    onDeleteTodo: (id: Todo["id"]) => void
    onCheckTodo: (id: Todo["id"]) => void
    onEditTodo: (id: Todo["id"], title: Todo["title"], reminder?: string, notificationId?: string) => void
    onArchiveTodo: (id: Todo["id"]) => void
    onArchiveAll?: () => void
    onClearArchive: () => void
    archivedTodos: Todo[]
    onAddRequest?: () => void
}

const TodoList: React.FC<TodoListProps> = ({ todos, onDeleteTodo, onCheckTodo, onEditTodo, onArchiveTodo, onClearArchive, archivedTodos, onArchiveAll, onAddRequest }) => {
    const { colors, t } = useTheme()
    const [todoSortBy, setTodoSortBy] = useState<SortBy>("date")
    const [todoSortOrder, setTodoSortOrder] = useState<SortOrder>("desc")
    const [doneSortBy, setDoneSortBy] = useState<SortBy>("date")
    const [doneSortOrder, setDoneSortOrder] = useState<SortOrder>("desc")
    const [archiveSortBy, setArchiveSortBy] = useState<SortBy>("date")
    const [archiveSortOrder, setArchiveSortOrder] = useState<SortOrder>("desc")

    const [todoExpanded, setTodoExpanded] = useState(false)
    const [doneExpanded, setDoneExpanded] = useState(false)
    const [archiveExpanded, setArchiveExpanded] = useState(false)
    const [isClearArchiveModalOpen, setIsClearArchiveModalOpen] = useState(false)
    const [isArchiveAllModalOpen, setIsArchiveAllModalOpen] = useState(false)

    const scrollY = useRef(new Animated.Value(0)).current
    const rotateAnim = useRef(new Animated.Value(0)).current
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (refreshing) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start()
        } else {
            rotateAnim.setValue(0)
            rotateAnim.stopAnimation()
        }
    }, [refreshing])

    const refreshRotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    })

    const pullRotation = scrollY.interpolate({
        inputRange: [-100, 0],
        outputRange: ["-360deg", "0deg"],
        extrapolate: "clamp",
    })

    const pullScale = scrollY.interpolate({
        inputRange: [-100, -20],
        outputRange: [1.2, 0.5],
        extrapolate: "clamp",
    })

    const pullOpacity = scrollY.interpolate({
        inputRange: [-80, -20],
        outputRange: [1, 0],
        extrapolate: "clamp",
    })

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    };

    const pendingTodos = todos.filter(todo => !todo.isCompleted && !todo.isArchived)
    const completedTodos = todos.filter(todo => todo.isCompleted && !todo.isArchived)

    const prevPendingCount = useRef(pendingTodos.length)
    const prevCompletedCount = useRef(completedTodos.length)
    const prevArchivedCount = useRef(archivedTodos.length)

    useEffect(() => {
        if (pendingTodos.length === 0) setTodoExpanded(false)
        else if (pendingTodos.length > prevPendingCount.current) setTodoExpanded(true)
        prevPendingCount.current = pendingTodos.length
    }, [pendingTodos.length])

    useEffect(() => {
        if (completedTodos.length === 0) setDoneExpanded(false)
        else if (completedTodos.length > prevCompletedCount.current) setDoneExpanded(true)
        prevCompletedCount.current = completedTodos.length
    }, [completedTodos.length])

    useEffect(() => {
        if (archivedTodos.length === 0) setArchiveExpanded(false)
        else if (archivedTodos.length > prevArchivedCount.current) setArchiveExpanded(true)
        prevArchivedCount.current = archivedTodos.length
    }, [archivedTodos.length])

    const sortedPendingTodos = sortTodos(pendingTodos, todoSortBy, todoSortOrder, "createdAt")
    const sortedCompletedTodos = sortTodos(completedTodos, doneSortBy, doneSortOrder, "completedAt")
    const sortedArchivedTodos = sortTodos(archivedTodos, archiveSortBy, archiveSortOrder, "archivedAt")

    const toggleSection = (setter: (fn: (prev: boolean) => boolean) => void) => {
        LayoutAnimation.configureNext(toggleAnimation);
        setter(prev => !prev);
    }

    if (todos.length === 0 && archivedTodos.length === 0) {
        return (
            <Animated.ScrollView
                contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="transparent"
                        colors={["transparent"]}
                    />
                }
            >
                <Animated.View style={{
                    position: 'absolute',
                    top: 20,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    zIndex: 10,
                    opacity: refreshing ? 1 : pullOpacity,
                    transform: [
                        { scale: refreshing ? 1 : pullScale },
                        { rotate: refreshing ? refreshRotation : pullRotation }
                    ]
                }}>
                    <Image
                        source={require("@/assets/images/mandarin_75x75.png")}
                        style={{ width: 40, height: 40, resizeMode: 'contain' }}
                    />
                </Animated.View>
                <View style={[styles.emptyContainer, { justifyContent: 'center', flex: 1 }]}>
                    <View style={{
                        width: 120,
                        height: 120,
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        borderRadius: 60,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24,
                        shadowColor: colors.CHECKBOX_SUCCESS,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5
                    }}>
                        <Ionicons name="add-outline" size={64} color={colors.CHECKBOX_SUCCESS} />
                    </View>
                    <StyledText style={{ fontSize: 22, fontWeight: 'bold', color: colors.PRIMARY_TEXT, marginBottom: 8 }}>
                        {t("start_journey")}
                    </StyledText>
                    <StyledText style={{ fontSize: 16, color: colors.PLACEHOLDER, textAlign: 'center', marginBottom: 32, paddingHorizontal: 40 }}>
                        {t("empty_desc")}
                    </StyledText>
                    <TouchableOpacity
                        onPress={onAddRequest}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                            paddingVertical: 16,
                            paddingHorizontal: 32,
                            borderRadius: 15,
                            borderWidth: 1,
                            borderColor: colors.PRIMARY_BORDER_DARK,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            shadowColor: colors.CHECKBOX_SUCCESS,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5
                        }}
                    >
                        <Ionicons name="add" size={24} color={colors.CHECKBOX_SUCCESS} />
                        <StyledText style={{ color: colors.CHECKBOX_SUCCESS, fontSize: 16, fontWeight: 'bold' }}>{t("create_task")}</StyledText>
                    </TouchableOpacity>
                </View>
            </Animated.ScrollView>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <Animated.View style={{
                position: 'absolute',
                top: 20,
                left: 0,
                right: 0,
                alignItems: 'center',
                zIndex: 10,
                opacity: refreshing ? 1 : pullOpacity,
                transform: [
                    { scale: refreshing ? 1 : pullScale },
                    { rotate: refreshing ? refreshRotation : pullRotation }
                ]
            }}>
                <Image
                    source={require("@/assets/images/mandarin_75x75.png")}
                    style={{ width: 40, height: 40, resizeMode: 'contain' }}
                />
            </Animated.View>

            <Animated.ScrollView
                style={styles.container}
                contentContainerStyle={{ flexGrow: 1 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="transparent"
                        colors={["transparent"]}
                    />
                }
            >
                {/* To Do Section */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.sectionHeader}
                        onPress={() => toggleSection(setTodoExpanded)}
                        disabled={sortedPendingTodos.length === 0}
                    >
                        <View style={[styles.sectionTitleContainer, sortedPendingTodos.length === 0 && { opacity: 0.5 }]}>
                            <Ionicons name="list-circle" size={24} color="#5BC0EB" />
                            <StyledText style={[styles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>
                                {t("todo")} ({sortedPendingTodos.length})
                            </StyledText>
                        </View>
                        <View style={styles.sectionControls}>
                            <TouchableOpacity
                                onPress={onAddRequest}
                                style={{ marginRight: 10 }}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add-circle" size={28} color={colors.CHECKBOX_SUCCESS} />
                            </TouchableOpacity>

                            {todoExpanded && sortedPendingTodos.length > 0 && (
                                <SortControls
                                    sortBy={todoSortBy}
                                    sortOrder={todoSortOrder}
                                    onToggleSortBy={() => setTodoSortBy(prev => prev === "date" ? "text" : "date")}
                                    onToggleSortOrder={() => setTodoSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                />
                            )}
                            <Ionicons
                                name={todoExpanded ? "chevron-down" : "chevron-forward"}
                                size={20}
                                color={colors.PRIMARY_TEXT}
                                style={[sortedPendingTodos.length === 0 && { opacity: 0.5 }]}
                            />
                        </View>
                    </TouchableOpacity>
                    {todoExpanded && sortedPendingTodos.map(item => (
                        <TodoItem
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            isCompleted={item.isCompleted}
                            createdAt={item.createdAt}
                            completedAt={item.completedAt}
                            updatedAt={item.updatedAt}
                            deleteTodo={onDeleteTodo}
                            checkTodo={onCheckTodo}
                            editTodo={onEditTodo}
                            reminder={item.reminder}
                            reminderCancelled={item.reminderCancelled}
                        />
                    ))}
                </View>

                <View style={[styles.sectionDivider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />

                {/* Done Section */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={[styles.sectionHeader, sortedCompletedTodos.length === 0 && { opacity: 0.5 }]}
                        onPress={() => toggleSection(setDoneExpanded)}
                        disabled={sortedCompletedTodos.length === 0}
                    >
                        <View style={styles.sectionTitleContainer}>
                            <Ionicons name="checkmark-done-circle" size={24} color={colors.CHECKBOX_SUCCESS} />
                            <StyledText style={[styles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>{t("done")} ({sortedCompletedTodos.length})</StyledText>
                        </View>
                        <View style={styles.sectionControls}>
                            {doneExpanded && sortedCompletedTodos.length > 0 && (
                                <SortControls
                                    sortBy={doneSortBy}
                                    sortOrder={doneSortOrder}
                                    onToggleSortBy={() => setDoneSortBy(prev => prev === "date" ? "text" : "date")}
                                    onToggleSortOrder={() => setDoneSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                />
                            )}
                            {sortedCompletedTodos.length > 0 && onArchiveAll && (
                                <TouchableOpacity onPress={() => setIsArchiveAllModalOpen(true)} style={{ padding: 4 }}>
                                    <Ionicons name="archive-outline" size={20} color={colors.PRIMARY_TEXT} />
                                </TouchableOpacity>
                            )}
                            <Ionicons
                                name={doneExpanded ? "chevron-down" : "chevron-forward"}
                                size={20}
                                color={colors.PRIMARY_TEXT}
                            />
                        </View>
                    </TouchableOpacity>

                    {doneExpanded && sortedCompletedTodos.map(item => (
                        <TodoItem
                            key={item.id}
                            {...item}
                            deleteTodo={onDeleteTodo}
                            checkTodo={onCheckTodo}
                            editTodo={onEditTodo}
                            archiveTodo={onArchiveTodo}
                        />
                    ))}
                </View>

                <View style={[styles.sectionDivider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />

                {/* Archive Section */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={[styles.sectionHeader, sortedArchivedTodos.length === 0 && { opacity: 0.5 }]}
                        onPress={() => toggleSection(setArchiveExpanded)}
                        activeOpacity={0.7}
                        disabled={sortedArchivedTodos.length === 0}
                    >
                        <View style={styles.sectionTitleContainer}>
                            <Ionicons name="archive" size={24} color="#888" />
                            <StyledText style={[styles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>
                                {t("archive")} ({archivedTodos.length})
                            </StyledText>
                        </View>
                        <View style={styles.sectionControls}>
                            {archiveExpanded && sortedArchivedTodos.length > 0 && (
                                <SortControls
                                    sortBy={archiveSortBy}
                                    sortOrder={archiveSortOrder}
                                    onToggleSortBy={() => setArchiveSortBy(archiveSortBy === "date" ? "text" : "date")}
                                    onToggleSortOrder={() => setArchiveSortOrder(archiveSortOrder === "asc" ? "desc" : "asc")}
                                />
                            )}
                            {archivedTodos.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setIsClearArchiveModalOpen(true)}
                                    style={{ padding: 4 }}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                </TouchableOpacity>
                            )}
                            <Ionicons
                                name={archiveExpanded ? "chevron-down" : "chevron-forward"}
                                size={20}
                                color={colors.PRIMARY_TEXT}
                            />
                        </View>
                    </TouchableOpacity>
                    {archiveExpanded && sortedArchivedTodos.map(item => (
                        <TodoItem
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            isCompleted={item.isCompleted}
                            isArchived={item.isArchived}
                            createdAt={item.createdAt}
                            completedAt={item.completedAt}
                            updatedAt={item.updatedAt}
                            archivedAt={item.archivedAt}
                            deleteTodo={onDeleteTodo}
                            checkTodo={onCheckTodo}
                            editTodo={onEditTodo}
                            archiveTodo={onArchiveTodo}
                        />
                    ))}
                </View>
            </Animated.ScrollView>

            {onArchiveAll && (
                <ArchiveAllModal
                    isOpen={isArchiveAllModalOpen}
                    onClose={() => setIsArchiveAllModalOpen(false)}
                    onArchiveAll={onArchiveAll}
                />
            )}

            <ClearArchiveModal
                isOpen={isClearArchiveModalOpen}
                onClose={() => setIsClearArchiveModalOpen(false)}
                onClear={onClearArchive}
            />
        </View>
    )
}

export default TodoList