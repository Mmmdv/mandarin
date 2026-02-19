import StyledRefreshControl from "@/components/ui/StyledRefreshControl"
import StyledText from "@/components/ui/StyledText"
import { toggleAnimation } from "@/constants/animations"
import { sortTodos } from "@/helpers/sort"
import useRefresh from "@/hooks/useRefresh"
import { useTheme } from "@/hooks/useTheme"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Animated, LayoutAnimation, Platform, ScrollView, TouchableOpacity, UIManager, View } from "react-native"
import ArchiveAllModal from "../modals/ArchiveAllModal.tsx"
import ClearArchiveModal from "../modals/ClearArchiveModal.tsx"
import TodoItem from "../TodoItem"
import SortControls, { SortBy, SortOrder } from "./SortControls"
import { styles } from "./styles"

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TodoListProps = {
    todos: Todo[]
    onDeleteTodo: (id: Todo["id"]) => void
    onCheckTodo: (id: Todo["id"]) => void
    onEditTodo: (id: Todo["id"], title: Todo["title"], reminder?: string, notificationId?: string) => void
    onArchiveTodo: (id: Todo["id"]) => void
    onRetryTodo: (id: Todo["id"], delayType: 'hour' | 'day' | 'week' | 'month', categoryTitle?: string, categoryIcon?: string) => void
    onArchiveAll?: () => void
    onClearArchive: () => void
    archivedTodos: Todo[]
    onAddRequest?: () => void
    categoryTitle?: string
    categoryIcon?: string
}

const TodoList: React.FC<TodoListProps> = ({ todos, onDeleteTodo, onCheckTodo, onEditTodo, onArchiveTodo, onRetryTodo, onClearArchive, archivedTodos, onArchiveAll, onAddRequest, categoryTitle, categoryIcon }) => {
    const { colors, t, lang } = useTheme()
    const router = useRouter();
    const navigation = useNavigation();
    const [todoSortBy, setTodoSortBy] = useState<SortBy>("date")
    const [todoSortOrder, setTodoSortOrder] = useState<SortOrder>("desc")
    const [doneSortBy, setDoneSortBy] = useState<SortBy>("date")
    const [doneSortOrder, setDoneSortOrder] = useState<SortOrder>("desc")
    const [archiveSortBy, setArchiveSortBy] = useState<SortBy>("date")
    const [archiveSortOrder, setArchiveSortOrder] = useState<SortOrder>("desc")

    // ... (state declarations roughly same as before, no change needed until render)

    const [todoExpanded, setTodoExpanded] = useState(true)
    const [doneExpanded, setDoneExpanded] = useState(false)
    const [archiveExpanded, setArchiveExpanded] = useState(false)

    // Animated values for chevron rotation
    const todoAnimation = useRef(new Animated.Value(1)).current
    const doneAnimation = useRef(new Animated.Value(0)).current
    const archiveAnimation = useRef(new Animated.Value(0)).current

    const [isClearArchiveModalOpen, setIsClearArchiveModalOpen] = useState(false)
    const [isArchiveAllModalOpen, setIsArchiveAllModalOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list')

    const { refreshing, onRefresh } = useRefresh();

    const pendingTodos = todos.filter(todo => !todo.isCompleted && !todo.isArchived)
    const completedTodos = todos.filter(todo => todo.isCompleted && !todo.isArchived)

    const prevPendingCount = useRef(pendingTodos.length)
    const prevCompletedCount = useRef(completedTodos.length)
    const prevArchivedCount = useRef(archivedTodos.length)

    useEffect(() => {
        if (pendingTodos.length === 0) {
            setTodoExpanded(false)
            Animated.timing(todoAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start()
        } else if (pendingTodos.length > prevPendingCount.current) {
            setTodoExpanded(true)
            Animated.timing(todoAnimation, { toValue: 1, duration: 300, useNativeDriver: true }).start()
        }
        prevPendingCount.current = pendingTodos.length
    }, [pendingTodos.length])

    useEffect(() => {
        if (completedTodos.length === 0) {
            setDoneExpanded(false)
            Animated.timing(doneAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start()
        } else if (completedTodos.length > prevCompletedCount.current) {
            setDoneExpanded(true)
            Animated.timing(doneAnimation, { toValue: 1, duration: 300, useNativeDriver: true }).start()
        }
        prevCompletedCount.current = completedTodos.length
    }, [completedTodos.length])

    useEffect(() => {
        if (archivedTodos.length === 0) {
            setArchiveExpanded(false)
            Animated.timing(archiveAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start()
        } else if (archivedTodos.length > prevArchivedCount.current) {
            setArchiveExpanded(true)
            Animated.timing(archiveAnimation, { toValue: 1, duration: 300, useNativeDriver: true }).start()
        }
        prevArchivedCount.current = archivedTodos.length
    }, [archivedTodos.length])

    // Trigger LayoutAnimation whenever sort settings change
    useEffect(() => {
        LayoutAnimation.configureNext(toggleAnimation);
    }, [todoSortBy, todoSortOrder, doneSortBy, doneSortOrder, archiveSortBy, archiveSortOrder, viewMode]);

    const sortedPendingTodos = sortTodos(pendingTodos, todoSortBy, todoSortOrder, lang, "createdAt")
    const sortedCompletedTodos = sortTodos(completedTodos, doneSortBy, doneSortOrder, lang, "completedAt")
    const sortedArchivedTodos = sortTodos(archivedTodos, archiveSortBy, archiveSortOrder, lang, "archivedAt")

    const toggleSection = (setter: React.Dispatch<React.SetStateAction<boolean>>, anim: any) => {
        setter(prev => {
            const newValue = !prev
            Animated.timing(anim, {
                toValue: newValue ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }).start()
            LayoutAnimation.configureNext(toggleAnimation);
            return newValue
        });
    }

    const toggleViewMode = () => {
        setViewMode(prev => (prev === 'list' ? 'card' : 'list'));
    }

    const getRotation = (anim: any) => {
        return anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '90deg']
        })
    }

    const getCircleTransform = (anim: any) => {
        return {
            transform: [
                {
                    translateX: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20]
                    })
                },
                {
                    translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -20]
                    })
                },
                {
                    scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.8]
                    })
                }
            ],
            opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.4]
            })
        }
    }

    if (todos.length === 0 && archivedTodos.length === 0) {
        return (
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.scrollContent, { flexGrow: 1, justifyContent: 'center' }]}
                refreshControl={
                    <StyledRefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <View style={styles.emptyContainer}>
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
            </ScrollView >
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={[styles.header, { zIndex: 10 }]}>
                <TouchableOpacity
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            router.replace('/');
                        }
                    }}
                    style={{ marginRight: 10, zIndex: 20 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 60 }}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.PRIMARY_TEXT} />
                </TouchableOpacity>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <StyledText style={styles.greeting}>
                        {t("tab_todo")}
                    </StyledText>
                </View>
                <TouchableOpacity
                    onPress={toggleViewMode}
                    style={[
                        styles.viewToggleButton,
                        {
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                        }
                    ]}
                    hitSlop={8}
                >
                    <Ionicons
                        name={viewMode === "card" ? "list" : "grid"}
                        size={20}
                        color={colors.PRIMARY_TEXT}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
                refreshControl={
                    <StyledRefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >


                {/* To Do Section */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={[styles.sectionHeaderCard, { backgroundColor: 'rgba(79, 70, 229, 0.15)', borderWidth: 0.2, borderColor: 'rgba(79, 70, 229, 0.3)' }]}
                        onPress={() => toggleSection(setTodoExpanded, todoAnimation)}
                        disabled={sortedPendingTodos.length === 0}
                    >
                        <View style={[styles.sectionTitleContainer, sortedPendingTodos.length === 0 && { opacity: 0.5 }, { zIndex: 2 }]}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(79, 70, 229, 0.2)' }]}>
                                <Ionicons name="list" size={16} color={colors.SECTION_TEXT} />
                            </View>
                            <StyledText style={[
                                styles.sectionTitleCard,
                                { color: colors.SECTION_TEXT }
                            ]}>
                                {t("todo")}
                            </StyledText>
                            <View style={[styles.cardBadge, { backgroundColor: 'rgba(79, 70, 229, 0.2)' }]}>
                                <StyledText style={[styles.cardBadgeText, { color: colors.SECTION_TEXT }]}>{sortedPendingTodos.length}</StyledText>
                            </View>
                        </View>
                        <View style={[styles.sectionControls, { zIndex: 2 }]}>
                            <View style={styles.actionZone}>
                                {/* Add button removed */}
                            </View>

                            <View style={styles.sortZone}>
                                {todoExpanded && sortedPendingTodos.length > 0 && (
                                    <SortControls
                                        sortBy={todoSortBy}
                                        sortOrder={todoSortOrder}
                                        onToggleSortBy={() => setTodoSortBy(prev => prev === "date" ? "text" : "date")}
                                        onToggleSortOrder={() => setTodoSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                    />
                                )}
                            </View>

                            <View style={{ flex: 1 }} />

                            <View style={styles.chevronZone}>
                                <Animated.View style={{ transform: [{ rotate: getRotation(todoAnimation) }] }}>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={14}
                                        color={colors.SECTION_TEXT}
                                        style={[sortedPendingTodos.length === 0 && { opacity: 0.5 }]}
                                    />
                                </Animated.View>
                            </View>
                        </View>
                        <Animated.View style={[styles.decorativeCircle, getCircleTransform(todoAnimation)]} />
                    </TouchableOpacity>
                    {todoExpanded && (
                        <View style={viewMode === 'card' ? styles.gridContainer : {}}>
                            {sortedPendingTodos.map(item => (
                                <TodoItem
                                    key={item.id}
                                    {...item}
                                    deleteTodo={onDeleteTodo}
                                    checkTodo={onCheckTodo}
                                    editTodo={onEditTodo}
                                    retryTodo={onRetryTodo}
                                    categoryTitle={categoryTitle}
                                    categoryIcon={categoryIcon}
                                    category="todo"
                                    viewMode={viewMode}
                                />
                            ))}
                        </View>
                    )}
                </View>



                {/* Done Section */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={[styles.sectionHeaderCard, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 0.2, borderColor: 'rgba(16, 185, 129, 0.3)' }]}
                        onPress={() => toggleSection(setDoneExpanded, doneAnimation)}
                        disabled={sortedCompletedTodos.length === 0}
                    >
                        <View style={[styles.sectionTitleContainer, sortedCompletedTodos.length === 0 && { opacity: 0.5 }, { zIndex: 2 }]}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                                <Ionicons name="checkmark-done-circle" size={16} color={colors.SECTION_TEXT} />
                            </View>
                            <StyledText style={[
                                styles.sectionTitleCard,
                                { color: colors.SECTION_TEXT }
                            ]}>
                                {t("done")}
                            </StyledText>
                            <View style={[styles.cardBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                                <StyledText style={[styles.cardBadgeText, { color: colors.SECTION_TEXT }]}>{sortedCompletedTodos.length}</StyledText>
                            </View>
                        </View>
                        <View style={[styles.sectionControls, { zIndex: 2 }]}>
                            <View style={styles.actionZone}>
                                {sortedCompletedTodos.length > 0 && onArchiveAll && (
                                    <TouchableOpacity onPress={() => setIsArchiveAllModalOpen(true)} style={{ padding: 4 }}>
                                        <Ionicons name="archive-outline" size={20} color={viewMode === 'card' ? '#FFF' : colors.PRIMARY_TEXT} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.sortZone}>
                                {doneExpanded && sortedCompletedTodos.length > 0 && (
                                    <SortControls
                                        sortBy={doneSortBy}
                                        sortOrder={doneSortOrder}
                                        onToggleSortBy={() => setDoneSortBy(prev => prev === "date" ? "text" : "date")}
                                        onToggleSortOrder={() => setDoneSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                    />
                                )}
                            </View>

                            <View style={{ flex: 1 }} />

                            <View style={styles.chevronZone}>
                                <Animated.View style={{ transform: [{ rotate: getRotation(doneAnimation) }] }}>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={14}
                                        color={colors.SECTION_TEXT}
                                    />
                                </Animated.View>
                            </View>
                        </View>
                        <Animated.View style={[styles.decorativeCircle, getCircleTransform(doneAnimation)]} />
                    </TouchableOpacity>

                    {
                        doneExpanded && (
                            <View style={viewMode === 'card' ? styles.gridContainer : {}}>
                                {sortedCompletedTodos.map(item => (
                                    <TodoItem
                                        key={item.id}
                                        {...item}
                                        deleteTodo={onDeleteTodo}
                                        checkTodo={onCheckTodo}
                                        editTodo={onEditTodo}
                                        archiveTodo={onArchiveTodo}
                                        retryTodo={onRetryTodo}
                                        categoryTitle={categoryTitle}
                                        categoryIcon={categoryIcon}
                                        category="done"
                                        viewMode={viewMode}
                                    />
                                ))}
                            </View>
                        )
                    }
                </View>



                {/* Archive Section */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={[styles.sectionHeaderCard, { backgroundColor: 'rgba(139, 92, 246, 0.15)', borderWidth: 0.2, borderColor: 'rgba(139, 92, 246, 0.3)' }]}
                        onPress={() => toggleSection(setArchiveExpanded, archiveAnimation)}
                        disabled={sortedArchivedTodos.length === 0}
                    >
                        <View style={[styles.sectionTitleContainer, sortedArchivedTodos.length === 0 && { opacity: 0.5 }, { zIndex: 2 }]}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                                <Ionicons name="archive" size={16} color={colors.SECTION_TEXT} />
                            </View>
                            <StyledText style={[
                                styles.sectionTitleCard,
                                { color: colors.SECTION_TEXT }
                            ]}>
                                {t("archive")}
                            </StyledText>
                            <View style={[styles.cardBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                                <StyledText style={[styles.cardBadgeText, { color: colors.SECTION_TEXT }]}>{sortedArchivedTodos.length}</StyledText>
                            </View>
                        </View>
                        <View style={[styles.sectionControls, { zIndex: 2 }]}>
                            <View style={styles.actionZone}>
                                {archivedTodos.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setIsClearArchiveModalOpen(true)}
                                        style={{ padding: 4 }}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.sortZone}>
                                {archiveExpanded && sortedArchivedTodos.length > 0 && (
                                    <SortControls
                                        sortBy={archiveSortBy}
                                        sortOrder={archiveSortOrder}
                                        onToggleSortBy={() => setArchiveSortBy(prev => prev === "date" ? "text" : "date")}
                                        onToggleSortOrder={() => setArchiveSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                    />
                                )}
                            </View>

                            <View style={{ flex: 1 }} />

                            <View style={styles.chevronZone}>
                                <Animated.View style={{ transform: [{ rotate: getRotation(archiveAnimation) }] }}>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={14}
                                        color={colors.SECTION_TEXT}
                                        style={[sortedArchivedTodos.length === 0 && { opacity: 0.5 }]}
                                    />
                                </Animated.View>
                            </View>
                        </View>
                        <Animated.View style={[styles.decorativeCircle, getCircleTransform(archiveAnimation)]} />
                    </TouchableOpacity>
                    {archiveExpanded && (
                        <View style={viewMode === 'card' ? styles.gridContainer : {}}>
                            {sortedArchivedTodos.map(item => (
                                <TodoItem
                                    key={item.id}
                                    {...item}
                                    deleteTodo={onDeleteTodo}
                                    checkTodo={onCheckTodo}
                                    editTodo={onEditTodo}
                                    archiveTodo={onArchiveTodo}
                                    retryTodo={onRetryTodo}
                                    categoryTitle={categoryTitle}
                                    categoryIcon={categoryIcon}
                                    category="archive"
                                    viewMode={viewMode}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

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
