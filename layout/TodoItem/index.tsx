import StyledCheckBox from "@/components/StyledCheckBox"
import StyledText from "@/components/StyledText"
import { COLORS } from "@/constants/ui"
import { formatDate } from "@/helpers/date"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useEffect, useRef, useState } from "react"
import { Animated, TouchableOpacity, View } from "react-native"
import ArchiveTodoModal from "../Modals/ArchiveTodoModal.tsx"
import DeleteTodoModal from "../Modals/DeleteTodoModal.tsx"
import EditTodoModal from "../Modals/EditTodoModal.tsx"
import ViewTodoModal from "../Modals/ViewTodoModal.tsx"
import CelebrationEffect, { CelebrationType, createCelebrationAnimations, playCelebration } from "./CelebrationEffect"
import { styles } from "./styles"

import { useAppSelector } from "@/store"
import { selectNotificationById } from "@/store/slices/notificationSlice"

type TodoItemProps = Todo & {
    reminder?: string;
    reminderCancelled?: boolean;
    checkTodo: (id: Todo["id"]) => void
    deleteTodo: (id: Todo["id"]) => void
    editTodo: (id: Todo["id"], title: Todo["title"], reminder?: string, notificationId?: string) => void
    archiveTodo?: (id: Todo["id"]) => void
    categoryTitle?: string
    categoryIcon?: string
    category?: 'todo' | 'done' | 'archive'
    viewMode?: 'list' | 'card'
}

import { useTheme } from "@/hooks/useTheme"

const TodoItem: React.FC<TodoItemProps> = ({ id, title, isCompleted, isArchived, createdAt, completedAt, updatedAt, archivedAt, reminder, reminderCancelled, notificationId, checkTodo, deleteTodo, editTodo, archiveTodo, categoryTitle, categoryIcon, category, viewMode = 'list' }) => {
    const { t, colors, notificationsEnabled, lang } = useTheme();

    // Look up status from notification history centralized data
    const notification = useAppSelector(state => notificationId ? selectNotificationById(state, notificationId) : undefined);
    const reminderStatus = notification?.status;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [showCelebrate, setShowCelebrate] = useState(false)
    const [celebrationType, setCelebrationType] = useState<CelebrationType>('idea')

    const ideaAnimations = useRef(createCelebrationAnimations()).current

    const onPressDelete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setIsDeleteModalOpen(true);
    }

    const onPressArchive = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setIsArchiveModalOpen(true);
    }

    const onPressEdit = () => {
        setIsEditModalOpen(true)
    }

    const handleCheckToken = () => {
        // Light haptic feedback for both checking and unchecking
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (!isCompleted) {
            setCelebrationType('star')
            playCelebration(ideaAnimations, setShowCelebrate)
            setTimeout(() => { checkTodo(id) }, 600)
        } else {
            checkTodo(id)
        }
    }

    // Check if it's a new task (created within last 2 seconds)
    useEffect(() => {
        const now = new Date().getTime()
        const created = new Date(createdAt).getTime()
        if (now - created < 2000) {
            setCelebrationType('idea')
            playCelebration(ideaAnimations, setShowCelebrate)
        }
    }, [])

    // Enter animation
    const fadeAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(0.9)).current
    const translateAnim = useRef(new Animated.Value(20)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
            Animated.spring(translateAnim, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
        ]).start();
    }, []);

    const backgroundColor = fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.PRIMARY_BORDER_DARK, COLORS.SECONDARY_BACKGROUND],
    });

    if (viewMode === 'card') {
        return (
            <Animated.View style={[
                styles.cardContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }, { translateY: translateAnim }],
                    backgroundColor: category === 'todo' ? 'rgba(79, 70, 229, 0.12)' :
                        category === 'done' ? 'rgba(16, 185, 129, 0.09)' :
                            category === 'archive' ? 'rgba(139, 92, 246, 0.12)' :
                                colors.SECONDARY_BACKGROUND,
                    borderColor: category === 'todo' ? 'rgba(79, 70, 229, 0.25)' :
                        category === 'done' ? 'rgba(16, 185, 129, 0.12)' :
                            category === 'archive' ? 'rgba(139, 92, 246, 0.25)' :
                                colors.PRIMARY_BORDER_DARK,
                }
            ]}>
                <View style={[styles.cardOverlay, {
                    backgroundColor: category === 'todo' ? 'rgba(79, 70, 229, 0.05)' :
                        category === 'done' ? 'rgba(16, 185, 129, 0.05)' :
                            category === 'archive' ? 'rgba(139, 92, 246, 0.05)' :
                                'transparent'
                }]} />
                <View style={styles.cardHeader}>
                    {!isArchived && (
                        <View style={styles.checkboxWrapper}>
                            <StyledCheckBox checked={isCompleted} onCheck={handleCheckToken} />
                            <CelebrationEffect
                                animations={ideaAnimations}
                                celebrationType={celebrationType}
                                visible={showCelebrate}
                            />
                        </View>
                    )}
                    {isArchived && <Ionicons name="archive" size={18.5} color={colors.PLACEHOLDER} />}

                    {reminder && (
                        <View style={styles.cardMetadata}>
                            <Ionicons
                                name={reminderStatus === 'Ləğv olunub' || reminderCancelled ? "notifications-off" : "alarm-outline"}
                                size={14}
                                color={reminderStatus === 'Ləğv olunub' || reminderCancelled ? colors.ERROR_INPUT_TEXT : "#FFD166"}
                            />
                            <View style={styles.cardTimeContainer}>
                                <StyledText style={{ fontSize: 8.5, fontWeight: '600', color: reminderStatus === 'Ləğv olunub' || reminderCancelled ? colors.ERROR_INPUT_TEXT : "#FFD166" }}>
                                    {formatDate(reminder, lang).split(' ')[0]}
                                </StyledText>
                                <StyledText style={[styles.cardTimeSmall, { color: reminderStatus === 'Ləğv olunub' || reminderCancelled ? colors.ERROR_INPUT_TEXT : "#FFD166" }]}>
                                    {formatDate(reminder, lang).split(' ')[1]}
                                </StyledText>
                            </View>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.cardBody}
                    onPress={() => setIsViewModalOpen(true)}
                    activeOpacity={0.7}
                >
                    <StyledText
                        style={[
                            styles.cardTitle,
                            {
                                opacity: isArchived ? 0.9 : (isCompleted ? 0.6 : 1),
                                textDecorationLine: (isCompleted && !isArchived) ? 'line-through' : 'none',
                                color: (isCompleted && !isArchived) ? colors.PLACEHOLDER : colors.PRIMARY_TEXT,
                            }
                        ]}
                        numberOfLines={3}
                    >
                        {title}
                    </StyledText>
                </TouchableOpacity>

                <View style={styles.cardFooter}>
                    <View style={styles.cardMetadata}>
                        <Ionicons
                            name={isCompleted ? "checkmark-done-circle" : (updatedAt ? "create-outline" : "add")}
                            size={14}
                            color={isCompleted ? colors.CHECKBOX_SUCCESS : (updatedAt ? "#5BC0EB" : "#D1D1D1")}
                        />
                        <View style={styles.cardTimeContainer}>
                            <StyledText style={[styles.cardTime, { color: isCompleted ? colors.CHECKBOX_SUCCESS : (updatedAt ? "#5BC0EB" : "#D1D1D1") }]}>
                                {formatDate(isCompleted ? (completedAt || updatedAt) : (updatedAt || createdAt), lang).split(' ')[0]}
                            </StyledText>
                            <StyledText style={[styles.cardTimeSmall, { color: isCompleted ? colors.CHECKBOX_SUCCESS : (updatedAt ? "#5BC0EB" : "#D1D1D1") }]}>
                                {formatDate(isCompleted ? (completedAt || updatedAt) : (updatedAt || createdAt), lang).split(' ')[1]}
                            </StyledText>
                        </View>
                    </View>

                    <View style={styles.cardControls}>
                        {!isCompleted && !isArchived && (
                            <>
                                <TouchableOpacity onPress={onPressEdit} activeOpacity={0.7} hitSlop={10}>
                                    <Ionicons name="create-outline" size={20.5} color={COLORS.PRIMARY_TEXT} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onPressDelete} activeOpacity={0.7} hitSlop={10}>
                                    <Ionicons name="trash-outline" size={20.5} color={COLORS.PRIMARY_TEXT} />
                                </TouchableOpacity>
                            </>
                        )}
                        {isCompleted && !isArchived && archiveTodo && (
                            <TouchableOpacity onPress={onPressArchive} activeOpacity={0.7} hitSlop={10}>
                                <Ionicons name="archive-outline" size={20.5} color={COLORS.PRIMARY_TEXT} />
                            </TouchableOpacity>
                        )}
                        {isArchived && (
                            <TouchableOpacity onPress={() => setIsViewModalOpen(true)} activeOpacity={0.7} hitSlop={10}>
                                <Ionicons name="information-circle-outline" size={20.5} color={COLORS.PRIMARY_TEXT} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Modals */}
                <EditTodoModal
                    title={title}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={(title, reminder, notificationId) => editTodo(id, title, reminder, notificationId)}
                    reminder={reminder}
                    reminderCancelled={reminderCancelled}
                    notificationId={notificationId}
                    categoryTitle={categoryTitle}
                    categoryIcon={categoryIcon}
                />
                <DeleteTodoModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDelete={() => deleteTodo(id)}
                />
                {archiveTodo && (
                    <ArchiveTodoModal
                        isOpen={isArchiveModalOpen}
                        onClose={() => setIsArchiveModalOpen(false)}
                        onArchive={() => archiveTodo(id)}
                    />
                )}
                <ViewTodoModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title={title}
                    createdAt={createdAt}
                    updatedAt={updatedAt}
                    completedAt={completedAt}
                    reminder={reminder}
                    reminderCancelled={reminderCancelled}
                    notificationId={notificationId}
                />
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[
            styles.container,
            {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: translateAnim }],
                backgroundColor: category === 'todo' ? 'rgba(79, 70, 229, 0.12)' :
                    category === 'done' ? 'rgba(16, 185, 129, 0.09)' :
                        category === 'archive' ? 'rgba(139, 92, 246, 0.12)' :
                            colors.SECONDARY_BACKGROUND,
                borderColor: category === 'todo' ? 'rgba(79, 70, 229, 0.25)' :
                    category === 'done' ? 'rgba(16, 185, 129, 0.12)' :
                        category === 'archive' ? 'rgba(139, 92, 246, 0.25)' :
                            colors.PRIMARY_BORDER_DARK,
                borderWidth: 1,
            }
        ]}>
            <View style={[styles.cardOverlay, {
                backgroundColor: category === 'todo' ? 'rgba(79, 70, 229, 0.05)' :
                    category === 'done' ? 'rgba(16, 185, 129, 0.05)' :
                        category === 'archive' ? 'rgba(139, 92, 246, 0.05)' :
                            'transparent'
            }]} />
            <View style={styles.checkTitleContainer}>
                {!isArchived ? (
                    <View style={styles.checkboxWrapper}>
                        <StyledCheckBox checked={isCompleted} onCheck={handleCheckToken} />
                        <CelebrationEffect
                            animations={ideaAnimations}
                            celebrationType={celebrationType}
                            visible={showCelebrate}
                        />
                    </View>
                ) : (
                    <Ionicons name="archive" size={16.5} color={colors.PLACEHOLDER} />
                )}
                <TouchableOpacity
                    style={styles.textContainer}
                    onPress={() => setIsViewModalOpen(true)}
                    onLongPress={handleCheckToken}
                    activeOpacity={0.7}
                >
                    <View style={{ flex: 1 }}>
                        <StyledText
                            style={[{
                                fontSize: 15.5,
                                fontWeight: '600',
                                lineHeight: 21,
                                letterSpacing: 0.1,
                                opacity: isArchived ? 0.9 : (isCompleted ? 0.6 : 1),
                                textDecorationLine: (isCompleted && !isArchived) ? 'line-through' : 'none',
                                color: (isCompleted && !isArchived) ? colors.PLACEHOLDER : '#FFFFFF',
                            }]}>
                            {title}
                        </StyledText>
                    </View>
                    {(completedAt || updatedAt || createdAt) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 }}>
                            <Ionicons
                                name={isCompleted ? "checkmark-done-circle" : (updatedAt ? "create-outline" : "add")}
                                size={14}
                                color={isCompleted ? colors.CHECKBOX_SUCCESS : (updatedAt ? "#5BC0EB" : "#D1D1D1")}
                            />
                            <StyledText style={{ color: isCompleted ? colors.CHECKBOX_SUCCESS : (updatedAt ? "#5BC0EB" : "#D1D1D1"), fontSize: 9.5 }}>
                                {formatDate(isCompleted ? (completedAt || updatedAt) : (updatedAt || createdAt), lang)}
                            </StyledText>
                        </View>
                    )}
                    {!isCompleted && !isArchived && reminder && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons
                                    name="alarm-outline"
                                    size={14}
                                    color="#FFD166"
                                />
                                <StyledText style={{
                                    color: "#FFD166",
                                    fontSize: 9.5,
                                    textDecorationLine: (reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub' || reminderCancelled) ? 'line-through' : 'none'
                                }}>
                                    {formatDate(reminder, lang)}
                                </StyledText>
                            </View>

                            {reminderStatus && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    {reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub' || reminderCancelled ? (
                                        <Ionicons name="notifications-off" size={14} color={COLORS.ERROR_INPUT_TEXT} />
                                    ) : reminderStatus === 'Göndərilib' ? (
                                        <Ionicons name="checkmark-done-circle-outline" size={14} color={COLORS.CHECKBOX_SUCCESS} />
                                    ) : (
                                        <Ionicons name="hourglass-outline" size={14} color="#FFB74D" />
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.controlsContainer} onStartShouldSetResponder={() => true}>
                {!isCompleted && !isArchived && (
                    <>
                        <TouchableOpacity onPress={onPressEdit} activeOpacity={0.7}>
                            <Ionicons name="create-outline" size={20.5} color={COLORS.PRIMARY_TEXT} />
                        </TouchableOpacity>
                        <EditTodoModal
                            title={title}
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            onUpdate={(title, reminder, notificationId) => editTodo(id, title, reminder, notificationId)}
                            reminder={reminder}
                            reminderCancelled={reminderCancelled}
                            notificationId={notificationId}
                            categoryTitle={categoryTitle}
                            categoryIcon={categoryIcon}
                        />
                        <TouchableOpacity onPress={onPressDelete} activeOpacity={0.7}>
                            <Ionicons name="trash-outline" size={20.5} color={COLORS.PRIMARY_TEXT} />
                        </TouchableOpacity>
                        <DeleteTodoModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onDelete={() => deleteTodo(id)}
                        />
                    </>
                )}
                {isCompleted && !isArchived && archiveTodo && (
                    <TouchableOpacity onPress={onPressArchive} activeOpacity={0.7}>
                        <Ionicons name="archive-outline" size={20.5} color={COLORS.PRIMARY_TEXT} />
                    </TouchableOpacity>
                )}
                {archiveTodo && (
                    <ArchiveTodoModal
                        isOpen={isArchiveModalOpen}
                        onClose={() => setIsArchiveModalOpen(false)}
                        onArchive={() => archiveTodo(id)}
                    />
                )}
                {isArchived && (
                    <TouchableOpacity onPress={() => setIsViewModalOpen(true)} activeOpacity={0.7}>
                        <Ionicons name="information-circle-outline" size={20.5} color={COLORS.PRIMARY_TEXT} />
                    </TouchableOpacity>
                )}
                <ViewTodoModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    title={title}
                    createdAt={createdAt}
                    updatedAt={updatedAt}
                    completedAt={completedAt}
                    reminder={reminder}
                    reminderCancelled={reminderCancelled}
                    notificationId={notificationId}
                />
            </View>
        </Animated.View>
    )
}

export default TodoItem