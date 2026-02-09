import StyledButton from "@/components/StyledButton"
import StyledCheckBox from "@/components/StyledCheckBox"
import StyledText from "@/components/StyledText"
import { COLORS } from "@/constants/ui"
import { Todo } from "@/types/todo"
import { Ionicons } from "@expo/vector-icons"
import { useRef, useState } from "react"
import { Animated, StyleSheet, View } from "react-native"
import DeleteTodoModal from "../Modals/DeleteTodoModal.tsx"
import EditTodoModal from "../Modals/EditTodoModal.tsx"

type TodoItemProps = Todo & {
    checkTodo: (id: Todo["id"]) => void
    deleteTodo: (id: Todo["id"]) => void
    editTodo: (id: Todo["id"], title: Todo["title"]) => void
}

const STAR_COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#A855F7", "#F97316"]

const TodoItem: React.FC<TodoItemProps> = ({ id, title, isCompleted, checkTodo, deleteTodo, editTodo }) => {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
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
        setIsDeleteModalOpen(true);
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
            const distance = 60 + Math.random() * 40

            return Animated.parallel([
                Animated.sequence([
                    Animated.timing(anim.scale, {
                        toValue: 1.5,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.scale, {
                        toValue: 0.5,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(anim.translateX, {
                    toValue: Math.cos(angle) * distance,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.translateY, {
                    toValue: Math.sin(angle) * distance - 30,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.opacity, {
                    toValue: 0,
                    duration: 600,
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
        }
        checkTodo(id)
    }

    return (
        <View style={styles.container}>
            <View style={styles.checKTitleConainer}>
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
                            <Ionicons name="star" size={16} color={STAR_COLORS[index]} />
                        </Animated.View>
                    ))}
                </View>
                <StyledText
                    style={[{ textDecorationLine: isCompleted ? "line-through" : "none" }]}>
                    {title}
                </StyledText>
            </View>
            <View style={styles.controlsContainer}>

                <StyledButton
                    icon="pencil-sharp"
                    size="small"
                    variant="blue_icon"
                    onPress={onPressEdit}>
                </StyledButton>
                <EditTodoModal
                    title={title}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={(title) => editTodo(id, title)} />

                <StyledButton
                    icon="trash-sharp"
                    size="small"
                    variant="blue_icon"
                    vibrate={true}
                    onPress={onPressDelete}>
                </StyledButton>
                <DeleteTodoModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDelete={() => deleteTodo(id)}
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
    },
    controlsContainer: {
        flexDirection: "row",
        paddingHorizontal: 0,
        paddingVertical: 0,
        gap: 5,
    },
    checKTitleConainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    checkboxWrapper: {
        position: "relative",
    },
    star: {
        position: "absolute",
        top: 0,
        left: 0,
    }
})
export default TodoItem