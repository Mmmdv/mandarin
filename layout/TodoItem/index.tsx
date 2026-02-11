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

type TodoItemProps = Todo & {
    checkTodo: (id: Todo["id"]) => void
    deleteTodo: (id: Todo["id"]) => void
    editTodo: (id: Todo["id"], title: Todo["title"], reminder?: string) => void
    archiveTodo?: (id: Todo["id"]) => void
}

import { useTheme } from "@/hooks/useTheme"

const TodoItem: React.FC<TodoItemProps> = ({ id, title, isCompleted, isArchived, createdAt, completedAt, updatedAt, archivedAt, reminder, checkTodo, deleteTodo, editTodo, archiveTodo }) => {
    const { t } = useTheme();
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

    return (
        <Animated.View style={[
            styles.container,
            {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: translateAnim }],
                backgroundColor,
            }
        ]}>
            <View style={styles.checkTitleContainer}>
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
                <TouchableOpacity
                    style={styles.textContainer}
                    onPress={isCompleted ? () => setIsViewModalOpen(true) : handleCheckToken}
                    activeOpacity={0.7}
                >
                    <View style={{ position: 'relative', alignSelf: 'flex-start' }}>
                        <StyledText
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[{
                                fontSize: 16,
                                flexShrink: 1,
                                opacity: isArchived ? 0.9 : (isCompleted ? 0.7 : 1),
                            }]}>
                            {title}
                        </StyledText>
                        {isCompleted && !isArchived && (
                            <View style={{
                                position: 'absolute', left: 0, right: 0, top: '50%',
                                height: 1, backgroundColor: COLORS.PRIMARY_TEXT, opacity: 0.4,
                            }} />
                        )}
                    </View>
                    {!isCompleted && createdAt && (
                        <StyledText style={styles.dateText}>🕐 {formatDate(createdAt)}</StyledText>
                    )}
                    {!isCompleted && updatedAt && (
                        <StyledText style={[styles.dateText, { color: '#5BC0EB' }]}>✏️ {formatDate(updatedAt)}</StyledText>
                    )}
                    {isCompleted && !isArchived && completedAt && (
                        <StyledText style={[styles.dateText, { color: '#6c757d', fontSize: 9 }]}>
                            ✅ {formatDate(completedAt)} • {t("tap_for_details")}
                        </StyledText>
                    )}
                    {!isCompleted && !isArchived && reminder && new Date(reminder) > new Date() && (
                        <StyledText style={[styles.dateText, { color: '#FFD166' }]}>
                            🔔 {new Date(reminder).toLocaleString()}
                        </StyledText>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.controlsContainer} onStartShouldSetResponder={() => true}>
                {!isCompleted && !isArchived && (
                    <>
                        <TouchableOpacity onPress={onPressEdit} activeOpacity={0.7}>
                            <Ionicons name="create-outline" size={24} color={COLORS.PRIMARY_TEXT} />
                        </TouchableOpacity>
                        <EditTodoModal
                            title={title}
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            onUpdate={(title, reminder) => editTodo(id, title, reminder)}
                            reminder={reminder}
                        />
                        <TouchableOpacity onPress={onPressDelete} activeOpacity={0.7}>
                            <Ionicons name="trash-outline" size={24} color={COLORS.PRIMARY_TEXT} />
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
                        <Ionicons name="archive-outline" size={24} color={COLORS.PRIMARY_TEXT} />
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
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.PRIMARY_TEXT} />
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
                />
            </View>
        </Animated.View>
    )
}

export default TodoItem