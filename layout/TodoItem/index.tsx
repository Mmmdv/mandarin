import StyledCheckBox from "@/components/StyledCheckBox"
import StyledText from "@/components/StyledText"
import { COLORS } from "@/constants/ui"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useRef, useState } from "react"
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native"
import ArchiveTodoModal from "../Modals/ArchiveTodoModal.tsx"
import DeleteTodoModal from "../Modals/DeleteTodoModal.tsx"
import EditTodoModal from "../Modals/EditTodoModal.tsx"
import ViewTodoModal from "../Modals/ViewTodoModal.tsx"

type TodoItemProps = Todo & {
    checkTodo: (id: Todo["id"]) => void
    deleteTodo: (id: Todo["id"]) => void
    editTodo: (id: Todo["id"], title: Todo["title"]) => void
    archiveTodo?: (id: Todo["id"]) => void
}

const STAR_COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#A855F7", "#F97316"]

const TodoItem: React.FC<TodoItemProps> = ({ id, title, isCompleted, isArchived, createdAt, completedAt, updatedAt, archivedAt, checkTodo, deleteTodo, editTodo, archiveTodo }) => {

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const dateStr = date.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
        const timeStr = date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
        return `${dateStr} ${timeStr}`
    }

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [showCelebrate, setShowCelebrate] = useState(false)

    // Animation values for 5 stars
    const starAnimations = useRef(
        Array.from({ length: 5 }, () => ({
            scale: new Animated.Value(0),
            opacity: new Animated.Value(0),
            translateX: new Animated.Value(0),
            translateY: new Animated.Value(0),
        }))
    ).current

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

    const playCelebration = () => {
        setShowCelebrate(true)

        // Reset animations
        starAnimations.forEach((anim) => {
            anim.scale.setValue(0)
            anim.opacity.setValue(1)
            anim.translateX.setValue(0)
            anim.translateY.setValue(0)
        })

        // Start animations for each star with different delays
        const animations = starAnimations.map((anim, index) => {
            const angle = (index / 5) * 2 * Math.PI
            const distance = 80 + Math.random() * 60

            return Animated.parallel([
                Animated.sequence([
                    Animated.timing(anim.scale, {
                        toValue: 2.0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.scale, {
                        toValue: 0.8,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(anim.translateX, {
                    toValue: Math.cos(angle) * distance,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.translateY, {
                    toValue: Math.sin(angle) * distance - 40,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.opacity, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        })

        Animated.stagger(50, animations).start(() => {
            setShowCelebrate(false)
        })
    }

    const onCheckTodo = () => {
        if (!isCompleted) {
            playCelebration()
            // Delay check so animation plays before item moves to Done section
            setTimeout(() => {
                checkTodo(id)
            }, 800)
        } else {
            checkTodo(id)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.checKTitleConainer}>
                {!isArchived && (
                    <View style={styles.checkboxWrapper}>
                        <StyledCheckBox
                            checked={isCompleted}
                            onCheck={onCheckTodo} />
                        {showCelebrate && starAnimations.map((anim, index) => (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.star,
                                    {
                                        transform: [
                                            { scale: anim.scale },
                                            { translateX: anim.translateX },
                                            { translateY: anim.translateY },
                                        ],
                                        opacity: anim.opacity,
                                    }
                                ]}
                            >
                                <Ionicons name="star" size={20} color={STAR_COLORS[index]} />
                            </Animated.View>
                        ))}
                    </View>
                )}
                <TouchableOpacity
                    style={styles.textContainer}
                    onPress={isCompleted ? () => setIsViewModalOpen(true) : undefined}
                    activeOpacity={isCompleted ? 0.7 : 1}
                    disabled={!isCompleted}
                >
                    <StyledText
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[{
                            textDecorationLine: isCompleted ? "line-through" : "none",
                            fontSize: 14,
                            flexShrink: 1,
                            opacity: isCompleted ? 0.6 : 1,
                        }]}>
                        {title}
                    </StyledText>
                    {/* Pending items show create date and edit date */}
                    {!isCompleted && createdAt && (
                        <StyledText style={styles.dateText}>
                            🕐 {formatDate(createdAt)}
                        </StyledText>
                    )}
                    {!isCompleted && updatedAt && (
                        <StyledText style={[styles.dateText, { color: '#5BC0EB' }]}>
                            ✏️ {formatDate(updatedAt)}
                        </StyledText>
                    )}
                    {/* Completed items show only done date */}
                    {isCompleted && !isArchived && completedAt && (
                        <StyledText style={[styles.dateText, { color: '#4ECDC4' }]}>
                            ✅ {formatDate(completedAt)} • Tap for details
                        </StyledText>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.controlsContainer}>

                {/* Pending items: edit and delete buttons */}
                {!isCompleted && !isArchived && (
                    <>
                        <TouchableOpacity onPress={onPressEdit} activeOpacity={0.7}>
                            <Ionicons name="create-outline" size={24} color={COLORS.PRIMARY_TEXT} />
                        </TouchableOpacity>
                        <EditTodoModal
                            title={title}
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            onUpdate={(title) => editTodo(id, title)} />

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

                {/* Done items: archive button only */}
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

                {/* Archived items: info button only */}
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
                />

            </View>
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 5,
        marginHorizontal: 5,
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 12,
        overflow: "visible",
        borderWidth: 0.3,
        borderColor: COLORS.PRIMARY_BORDER_DARK,
    },
    controlsContainer: {
        flexDirection: "row",
        paddingHorizontal: 0,
        paddingVertical: 0,
        gap: 8,
    },
    checKTitleConainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        flex: 1,
        flexShrink: 1,
        marginRight: 10,
        overflow: "visible",
    },
    checkboxWrapper: {
        position: "relative",
        overflow: "visible",
    },
    star: {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1000,
    },
    textContainer: {
        flex: 1,
        flexShrink: 1,
    },
    dateText: {
        fontSize: 11,
        color: "#aaa",
        marginTop: 2,
    }
})
export default TodoItem