import StyledRefreshControl from "@/components/ui/StyledRefreshControl"
import StyledText from "@/components/ui/StyledText"
import { toggleAnimation } from "@/constants/animations"
import { sortTodos } from "@/helpers/sort"
import useRefresh from "@/hooks/useRefresh"
import { useTheme } from "@/hooks/useTheme"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRouter } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { Animated, LayoutAnimation, Platform, ScrollView, TouchableOpacity, UIManager, View } from "react-native"
import ArchiveAllModal from "../modals/ArchiveAllModal.tsx"
import ArchiveTodoModal from "../modals/ArchiveTodoModal.tsx"
import ClearArchiveModal from "../modals/ClearArchiveModal.tsx"
import DeleteTodoModal from "../modals/DeleteTodoModal.tsx"
import EditTodoModal from "../modals/EditTodoModal.tsx"
import RetryTodoModal from "../modals/RetryTodoModal.tsx"
import TodoMenuModal from "../modals/TodoMenuModal"
import ViewTodoModal from "../modals/ViewTodoModal.tsx"
import TodoItem from "../TodoItem"
import SortControls, { SortBy, SortOrder } from "./SortControls"
import { getStyles } from "./styles"

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
    const { colors, t, lang, isDark } = useTheme()
    const router = useRouter();
    const navigation = useNavigation();
    const [todoSortBy, setTodoSortBy] = useState<SortBy>("date")
    const [todoSortOrder, setTodoSortOrder] = useState<SortOrder>("desc")
    const [doneSortBy, setDoneSortBy] = useState<SortBy>("date")
    const [doneSortOrder, setDoneSortOrder] = useState<SortOrder>("desc")
    const [archiveSortBy, setArchiveSortBy] = useState<SortBy>("date")
    const [archiveSortOrder, setArchiveSortOrder] = useState<SortOrder>("desc")

    const [todoExpanded, setTodoExpanded] = useState(true)
    const [doneExpanded, setDoneExpanded] = useState(false)
    const [archiveExpanded, setArchiveExpanded] = useState(false)

    const todoAnimation = useRef(new Animated.Value(1)).current
    const doneAnimation = useRef(new Animated.Value(0)).current
    const archiveAnimation = useRef(new Animated.Value(0)).current

    const [isClearArchiveModalOpen, setIsClearArchiveModalOpen] = useState(false)
    const [isArchiveAllModalOpen, setIsArchiveAllModalOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list')

    const { refreshing, onRefresh } = useRefresh();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    // Menu modal state
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<{ x: number, y: number, width: number, height: number } | undefined>(undefined);
    const [menuTarget, setMenuTarget] = useState<Todo | undefined>(undefined);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const pendingTodos = todos.filter(todo => !todo.isCompleted && !todo.isArchived)
    const completedTodos = todos.filter(todo => todo.isCompleted && !todo.isArchived)

    const prevPendingCount = useRef(pendingTodos.length)
    const prevCompletedCount = useRef(completedTodos.length)
    const prevArchivedCount = useRef(archivedTodos.length)

    useEffect(() => {
        if (pendingTodos.length === 0) {
            setTodoExpanded(false)
            Animated.timing(todoAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start()
        }
        prevPendingCount.current = pendingTodos.length
    }, [pendingTodos.length])

    useEffect(() => {
        if (completedTodos.length === 0) {
            setDoneExpanded(false)
            Animated.timing(doneAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start()
        }
        prevCompletedCount.current = completedTodos.length
    }, [completedTodos.length])

    useEffect(() => {
        if (archivedTodos.length === 0) {
            setArchiveExpanded(false)
            Animated.timing(archiveAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start()
        }
        prevArchivedCount.current = archivedTodos.length
    }, [archivedTodos.length])

    useEffect(() => {
        LayoutAnimation.configureNext(toggleAnimation);
    }, [todoSortBy, todoSortOrder, doneSortBy, doneSortOrder, archiveSortBy, archiveSortOrder, viewMode]);

    const sortedPendingTodos = sortTodos(pendingTodos, todoSortBy, todoSortOrder, lang, "createdAt")
    const sortedCompletedTodos = sortTodos(completedTodos, doneSortBy, doneSortOrder, lang, "completedAt")
    const sortedArchivedTodos = sortTodos(archivedTodos, archiveSortBy, archiveSortOrder, lang, "archivedAt")

    const toggleSection = (
        setter: React.Dispatch<React.SetStateAction<boolean>>,
        anim: Animated.Value,
        section: 'todo' | 'done' | 'archive'
    ) => {
        setter(prev => {
            const newValue = !prev
            Animated.timing(anim, {
                toValue: newValue ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }).start()

            // Açılan zaman digər bölmələri bağla
            if (newValue) {
                if (section !== 'todo') {
                    setTodoExpanded(false)
                    Animated.timing(todoAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start()
                }
                if (section !== 'done') {
                    setDoneExpanded(false)
                    Animated.timing(doneAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start()
                }
                if (section !== 'archive') {
                    setArchiveExpanded(false)
                    Animated.timing(archiveAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start()
                }
            }

            LayoutAnimation.configureNext(toggleAnimation);
            return newValue
        });
    }

    const toggleViewMode = () => {
        setViewMode(prev => (prev === 'list' ? 'card' : 'list'));
    }

    const handleOpenMenu = (todo: Todo, anchor: { x: number, y: number, width: number, height: number }) => {
        setMenuTarget(todo);
        setMenuAnchor(anchor);
        setIsMenuModalOpen(true);
    };

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
                outputRange: [0.6, 1]
            })
        }
    }

    if (todos.length === 0 && archivedTodos.length === 0) {
        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
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
                    <View style={{ flex: 1, justifyContent: 'center' }} pointerEvents="none">
                        <StyledText style={styles.greeting}>
                            {t("tab_todo")}
                        </StyledText>
                    </View>
                    {/* Right spacer to match filled state layout (width and height must match viewToggleButton) */}
                    <View style={{ width: 40, height: 40 }} />
                </View>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.scrollContent, { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 }]}
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
                </ScrollView>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, overflow: 'hidden' }}>
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
                <View style={{ flex: 1, justifyContent: 'center' }} pointerEvents="none">
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

            {/*
             * ─── STICKY HEADER MƏNTİQİ ───────────────────────────────────────────
             * Todo  açıqdırsa → yalnız Todo sticky
             * Done  açıqdırsa → Todo + Done sticky
             * Arxiv açıqdırsa → Todo + Done + Arxiv sticky
             * ─────────────────────────────────────────────────────────────────────
             */}

            {/* Todo sticky: hər hansı bölmə açıq olanda görünür */}
            {(todoExpanded || doneExpanded || archiveExpanded) && (
                <TouchableOpacity
                    style={[styles.sectionHeaderCard, styles.stickyTodoHeader, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.1)', borderWidth: 0.2, borderColor: isDark ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)' }]}
                    onPress={() => toggleSection(setTodoExpanded, todoAnimation, 'todo')}
                    disabled={sortedPendingTodos.length === 0}
                >
                    <View style={[styles.sectionTitleContainer, sortedPendingTodos.length === 0 && { opacity: 0.5 }, { zIndex: 2 }]}>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(79, 70, 229, 0.2)' }]}>
                            <Ionicons name="list" size={16} color={colors.SECTION_TEXT} />
                        </View>
                        <StyledText style={[styles.sectionTitleCard, { color: colors.SECTION_TEXT }]}>
                            {t("todo")}
                        </StyledText>
                        <View style={[styles.cardBadge, { backgroundColor: 'rgba(79, 70, 229, 0.2)' }]}>
                            <StyledText style={[styles.cardBadgeText, { color: colors.SECTION_TEXT }]}>{sortedPendingTodos.length}</StyledText>
                        </View>
                    </View>
                    <View style={[styles.sectionControls, { zIndex: 2 }]}>
                        <View style={styles.actionZone} />
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
                                <Ionicons name="chevron-forward" size={14} color={colors.SECTION_TEXT}
                                    style={[sortedPendingTodos.length === 0 && { opacity: 0.5 }]} />
                            </Animated.View>
                        </View>
                    </View>
                    <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(79, 70, 229, 0.12)' }, getCircleTransform(todoAnimation)]} />
                </TouchableOpacity>
            )}

            {/* Done sticky: Done və ya Arxiv açıq olanda görünür */}
            {(doneExpanded || archiveExpanded) && (
                <TouchableOpacity
                    style={[styles.sectionHeaderCard, styles.stickyTodoHeader, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)', borderWidth: 0.2, borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)' }]}
                    onPress={() => toggleSection(setDoneExpanded, doneAnimation, 'done')}
                    disabled={sortedCompletedTodos.length === 0}
                >
                    <View style={[styles.sectionTitleContainer, sortedCompletedTodos.length === 0 && { opacity: 0.5 }, { zIndex: 2 }]}>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <Ionicons name="checkmark-done-circle" size={16} color={colors.SECTION_TEXT} />
                        </View>
                        <StyledText style={[styles.sectionTitleCard, { color: colors.SECTION_TEXT }]}>
                            {t("done")}
                        </StyledText>
                        <View style={[styles.cardBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <StyledText style={[styles.cardBadgeText, { color: colors.SECTION_TEXT }]}>{sortedCompletedTodos.length}</StyledText>
                        </View>
                    </View>
                    <View style={[styles.sectionControls, { zIndex: 2 }]}>
                        <View style={styles.actionZone}>
                            {doneExpanded && sortedCompletedTodos.length > 0 && onArchiveAll && (
                                <TouchableOpacity onPress={() => setIsArchiveAllModalOpen(true)} style={{ padding: 4 }}>
                                    <Ionicons name="archive-outline" size={20} color={colors.PRIMARY_TEXT} />
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
                                <Ionicons name="chevron-forward" size={14} color={colors.SECTION_TEXT} />
                            </Animated.View>
                        </View>
                    </View>
                    <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16, 185, 129, 0.12)' }, getCircleTransform(doneAnimation)]} />
                </TouchableOpacity>
            )}

            {/* Archive sticky: yalnız Arxiv özü açıq olanda görünür */}
            {archiveExpanded && (
                <TouchableOpacity
                    style={[styles.sectionHeaderCard, styles.stickyTodoHeader, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)', borderWidth: 0.2, borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)' }]}
                    onPress={() => toggleSection(setArchiveExpanded, archiveAnimation, 'archive')}
                    disabled={sortedArchivedTodos.length === 0}
                >
                    <View style={[styles.sectionTitleContainer, sortedArchivedTodos.length === 0 && { opacity: 0.5 }, { zIndex: 2 }]}>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                            <Ionicons name="archive" size={16} color={colors.SECTION_TEXT} />
                        </View>
                        <StyledText style={[styles.sectionTitleCard, { color: colors.SECTION_TEXT }]}>
                            {t("archive")}
                        </StyledText>
                        <View style={[styles.cardBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                            <StyledText style={[styles.cardBadgeText, { color: colors.SECTION_TEXT }]}>{sortedArchivedTodos.length}</StyledText>
                        </View>
                    </View>
                    <View style={[styles.sectionControls, { zIndex: 2 }]}>
                        <View style={styles.actionZone}>
                            {archiveExpanded && archivedTodos.length > 0 && (
                                <TouchableOpacity onPress={() => setIsClearArchiveModalOpen(true)} style={{ padding: 4 }}>
                                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.sortZone}>
                            {sortedArchivedTodos.length > 0 && (
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
                                <Ionicons name="chevron-forward" size={14} color={colors.SECTION_TEXT}
                                    style={[sortedArchivedTodos.length === 0 && { opacity: 0.5 }]} />
                            </Animated.View>
                        </View>
                    </View>
                    <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139, 92, 246, 0.12)' }, getCircleTransform(archiveAnimation)]} />
                </TouchableOpacity>
            )}

            {/*
             * ─── SCROLLVIEW ───────────────────────────────────────────────────────
             * Todo section: yalnız Done VƏ Arxiv HƏR İKİSİ bağlı olanda scroll-da
             * Done section: yalnız Arxiv bağlı olanda scroll-da
             * Arxiv section: həmişə scroll-da
             * ─────────────────────────────────────────────────────────────────────
             */}
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
                {/* ── Todo Section ──
                    Done/Arxiv açıqdırsa Todo sticky kimi yuxarıda görünür, scroll-da OLMUR. */}
                {!doneExpanded && !archiveExpanded && (
                    <View style={styles.sectionContainer}>
                        {!todoExpanded && (
                            <TouchableOpacity
                                style={[styles.sectionHeaderCard, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.1)', borderWidth: 0.2, borderColor: isDark ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.2)', elevation: 0, zIndex: 0 }]}
                                onPress={() => toggleSection(setTodoExpanded, todoAnimation, 'todo')}
                                disabled={sortedPendingTodos.length === 0}
                            >
                                <View style={[styles.sectionTitleContainer, sortedPendingTodos.length === 0 && { opacity: 0.5 }, { zIndex: 2 }]}>
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(79, 70, 229, 0.2)' }]}>
                                        <Ionicons name="list" size={16} color={colors.SECTION_TEXT} />
                                    </View>
                                    <StyledText style={[styles.sectionTitleCard, { color: colors.SECTION_TEXT }]}>
                                        {t("todo")}
                                    </StyledText>
                                    <View style={[styles.cardBadge, { backgroundColor: 'rgba(79, 70, 229, 0.2)' }]}>
                                        <StyledText style={[styles.cardBadgeText, { color: colors.SECTION_TEXT }]}>{sortedPendingTodos.length}</StyledText>
                                    </View>
                                </View>
                                <View style={[styles.sectionControls, { zIndex: 2 }]}>
                                    <View style={styles.actionZone} />
                                    <View style={styles.sortZone} />
                                    <View style={{ flex: 1 }} />
                                    <View style={styles.chevronZone}>
                                        <Animated.View style={{ transform: [{ rotate: getRotation(todoAnimation) }] }}>
                                            <Ionicons name="chevron-forward" size={14} color={colors.SECTION_TEXT}
                                                style={[sortedPendingTodos.length === 0 && { opacity: 0.5 }]} />
                                        </Animated.View>
                                    </View>
                                </View>
                                <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(79, 70, 229, 0.12)' }, getCircleTransform(todoAnimation)]} />
                            </TouchableOpacity>
                        )}
                        {todoExpanded && (
                            <>
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
                                            onOpenMenu={(anchor) => handleOpenMenu(item, anchor)}
                                            onPress={() => {
                                                setMenuTarget(item);
                                                setIsViewModalOpen(true);
                                            }}
                                        />
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                )}

                {/* ── Done Section ──
                    Arxiv açıqdırsa Done sticky kimi yuxarıda görünür, scroll-da OLMUR. */}
                {!archiveExpanded && (
                    <View style={styles.sectionContainer}>
                        {!doneExpanded && (
                            <TouchableOpacity
                                style={[styles.sectionHeaderCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)', borderWidth: 0.2, borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)', elevation: 0, zIndex: 0 }]}
                                onPress={() => toggleSection(setDoneExpanded, doneAnimation, 'done')}
                                disabled={sortedCompletedTodos.length === 0}
                            >
                                <View style={[styles.sectionTitleContainer, sortedCompletedTodos.length === 0 && { opacity: 0.5 }, { zIndex: 2 }]}>
                                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                                        <Ionicons name="checkmark-done-circle" size={16} color={colors.SECTION_TEXT} />
                                    </View>
                                    <StyledText style={[styles.sectionTitleCard, { color: colors.SECTION_TEXT }]}>
                                        {t("done")}
                                    </StyledText>
                                    <View style={[styles.cardBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                                        <StyledText style={[styles.cardBadgeText, { color: colors.SECTION_TEXT }]}>{sortedCompletedTodos.length}</StyledText>
                                    </View>
                                </View>
                                <View style={[styles.sectionControls, { zIndex: 2 }]}>
                                    <View style={styles.actionZone}>
                                        {doneExpanded && sortedCompletedTodos.length > 0 && onArchiveAll && (
                                            <TouchableOpacity onPress={() => setIsArchiveAllModalOpen(true)} style={{ padding: 4 }}>
                                                <Ionicons name="archive-outline" size={20} color={colors.PRIMARY_TEXT} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={styles.sortZone} />
                                    <View style={{ flex: 1 }} />
                                    <View style={styles.chevronZone}>
                                        <Animated.View style={{ transform: [{ rotate: getRotation(doneAnimation) }] }}>
                                            <Ionicons name="chevron-forward" size={14} color={colors.SECTION_TEXT} />
                                        </Animated.View>
                                    </View>
                                </View>
                                <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(16, 185, 129, 0.12)' }, getCircleTransform(doneAnimation)]} />
                            </TouchableOpacity>
                        )}
                        {doneExpanded && (
                            <>
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
                                            onOpenMenu={(anchor) => handleOpenMenu(item, anchor)}
                                            onPress={() => {
                                                setMenuTarget(item);
                                                setIsViewModalOpen(true);
                                            }}
                                        />
                                    ))}
                                </View>

                            </>
                        )}
                    </View>
                )}

                {/* ── Archive Section ── həmişə scroll-da olur */}
                <View style={styles.sectionContainer}>
                    {!archiveExpanded && (
                        <TouchableOpacity
                            style={[styles.sectionHeaderCard, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)', borderWidth: 0.2, borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)', elevation: 0, zIndex: 0 }]}
                            onPress={() => toggleSection(setArchiveExpanded, archiveAnimation, 'archive')}
                            disabled={sortedArchivedTodos.length === 0}
                        >
                            <View style={[styles.sectionTitleContainer, sortedArchivedTodos.length === 0 && { opacity: 0.5 }, { zIndex: 2 }]}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                                    <Ionicons name="archive" size={16} color={colors.SECTION_TEXT} />
                                </View>
                                <StyledText style={[styles.sectionTitleCard, { color: colors.SECTION_TEXT }]}>
                                    {t("archive")}
                                </StyledText>
                                <View style={[styles.cardBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                                    <StyledText style={[styles.cardBadgeText, { color: colors.SECTION_TEXT }]}>{sortedArchivedTodos.length}</StyledText>
                                </View>
                            </View>
                            <View style={[styles.sectionControls, { zIndex: 2 }]}>
                                <View style={styles.actionZone}>
                                    {archiveExpanded && archivedTodos.length > 0 && (
                                        <TouchableOpacity onPress={() => setIsClearArchiveModalOpen(true)} style={{ padding: 4 }}>
                                            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={styles.sortZone} />
                                <View style={{ flex: 1 }} />
                                <View style={styles.chevronZone}>
                                    <Animated.View style={{ transform: [{ rotate: getRotation(archiveAnimation) }] }}>
                                        <Ionicons name="chevron-forward" size={14} color={colors.SECTION_TEXT}
                                            style={[sortedArchivedTodos.length === 0 && { opacity: 0.5 }]} />
                                    </Animated.View>
                                </View>
                            </View>
                            <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(139, 92, 246, 0.12)' }, getCircleTransform(archiveAnimation)]} />
                        </TouchableOpacity>
                    )}
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
                                    onOpenMenu={(anchor) => handleOpenMenu(item, anchor)}
                                    onPress={() => {
                                        setMenuTarget(item);
                                        setIsViewModalOpen(true);
                                    }}
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

            {/* Centralized Modals */}
            {menuTarget && (
                <>
                    <TodoMenuModal
                        isOpen={isMenuModalOpen}
                        onClose={() => setIsMenuModalOpen(false)}
                        onEdit={() => setIsEditModalOpen(true)}
                        onRetry={() => setIsRetryModalOpen(true)}
                        onDelete={() => setIsDeleteModalOpen(true)}
                        onArchive={() => setIsArchiveModalOpen(true)}
                        onView={() => setIsViewModalOpen(true)}
                        isCompleted={menuTarget.isCompleted}
                        isArchived={!!menuTarget.isArchived}
                        archiveTodoAvailable={!!onArchiveTodo}
                        anchorPosition={menuAnchor}
                    />

                    <EditTodoModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setMenuTarget(undefined);
                        }}
                        onEdit={(title, reminder, notificationId) => {
                            onEditTodo(menuTarget.id, title, reminder, notificationId);
                            setIsEditModalOpen(false);
                            setMenuTarget(undefined);
                        }}
                        id={menuTarget.id}
                        initialTitle={menuTarget.title}
                        initialReminder={menuTarget.reminder}
                        initialNotificationId={menuTarget.notificationId}
                        categoryTitle={categoryTitle}
                        categoryIcon={categoryIcon}
                    />

                    <DeleteTodoModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => {
                            setIsDeleteModalOpen(false);
                            setMenuTarget(undefined);
                        }}
                        onDelete={() => {
                            onDeleteTodo(menuTarget.id);
                            setIsDeleteModalOpen(false);
                            setMenuTarget(undefined);
                        }}
                        title={menuTarget.title}
                    />

                    <ArchiveTodoModal
                        isOpen={isArchiveModalOpen}
                        onClose={() => {
                            setIsArchiveModalOpen(false);
                            setMenuTarget(undefined);
                        }}
                        onArchive={() => {
                            if (onArchiveTodo) onArchiveTodo(menuTarget.id);
                            setIsArchiveModalOpen(false);
                            setMenuTarget(undefined);
                        }}
                        title={menuTarget.title}
                    />

                    <RetryTodoModal
                        isOpen={isRetryModalOpen}
                        onClose={() => {
                            setIsRetryModalOpen(false);
                            setMenuTarget(undefined);
                        }}
                        onRetry={(delayType) => {
                            onRetryTodo(menuTarget.id, delayType, categoryTitle, categoryIcon);
                            setIsRetryModalOpen(false);
                            setMenuTarget(undefined);
                        }}
                    />

                    <ViewTodoModal
                        isOpen={isViewModalOpen}
                        onClose={() => {
                            setIsViewModalOpen(false);
                            setMenuTarget(undefined);
                        }}
                        title={menuTarget.title}
                        createdAt={menuTarget.createdAt}
                        updatedAt={menuTarget.updatedAt}
                        completedAt={menuTarget.completedAt}
                        reminder={menuTarget.reminder}
                        reminderCancelled={menuTarget.reminderCancelled}
                        notificationId={menuTarget.notificationId}
                    />
                </>
            )}
        </View>
    )
}

export default TodoList
