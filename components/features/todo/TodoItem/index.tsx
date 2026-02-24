import StyledCheckBox from "@/components/ui/StyledCheckBox";
import StyledText from "@/components/ui/StyledText";
import { formatDate } from "@/helpers/date";
import { hyphenateText } from "@/helpers/text";
import { useTheme } from "@/hooks/useTheme";
import { useAppSelector } from "@/store";
import { selectNotificationById } from "@/store/slices/notificationSlice";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import CelebrationEffect, { CelebrationType, createCelebrationAnimations, playCelebration } from "./CelebrationEffect";
import { getStyles } from "./styles";

type TodoItemProps = Todo & {
    reminder?: string;
    reminderCancelled?: boolean;
    checkTodo: (id: Todo["id"]) => void
    deleteTodo: (id: Todo["id"]) => void
    editTodo: (id: Todo["id"], title: Todo["title"], reminder?: string, notificationId?: string) => void
    retryTodo: (id: Todo["id"], delayType: 'hour' | 'day' | 'week' | 'month', categoryTitle?: string, categoryIcon?: string) => void
    archiveTodo?: (id: Todo["id"]) => void
    categoryTitle?: string
    categoryIcon?: string
    category?: 'todo' | 'done' | 'archive'
    viewMode?: 'list' | 'card'
    onOpenMenu?: (anchor: { x: number, y: number, width: number, height: number }) => void
    onPress?: () => void
}

const TodoItem: React.FC<TodoItemProps> = ({ id, title, isCompleted, isArchived, createdAt, completedAt, updatedAt, archivedAt, reminder, reminderCancelled, notificationId, checkTodo, deleteTodo, editTodo, retryTodo, archiveTodo, categoryTitle, categoryIcon, category, viewMode = 'list', onOpenMenu, onPress }) => {
    const { t, colors, isDark, lang } = useTheme();

    // Look up status from notification history centralized data
    const notification = useAppSelector(state => notificationId ? selectNotificationById(state, notificationId) : undefined);
    const reminderStatus = notification?.status;

    const menuButtonRef = useRef<any>(null)
    const [showCelebrate, setShowCelebrate] = useState(false)
    const [celebrationType, setCelebrationType] = useState<CelebrationType>('idea')

    const ideaAnimations = useRef(createCelebrationAnimations()).current

    const handleCheckToken = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!isCompleted) {
            setCelebrationType('star')
            playCelebration(ideaAnimations, setShowCelebrate)
            setTimeout(() => { checkTodo(id) }, 600)
        } else {
            checkTodo(id)
        }
    }

    const openMenu = () => {
        if (!onOpenMenu) return;

        // Small delay to ensure any ongoing layout animations finish or settle
        // This is crucial for the menu to appear in the correct position when folders toggle
        setTimeout(() => {
            menuButtonRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
                if (pageX === 0 && pageY === 0 && pageY === 0) {
                    setTimeout(openMenu, 50);
                    return;
                }
                onOpenMenu({ x: pageX, y: pageY, width, height });
            });
        }, 64);
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

    const styles = useMemo(() => getStyles(colors), [colors]);

    if (viewMode === 'card') {
        return (
            <Animated.View style={[
                styles.cardContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }, { translateY: translateAnim }],
                    backgroundColor: colors.SECONDARY_BACKGROUND,
                    borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
                    borderWidth: isDark ? 0.2 : 1,
                }
            ]}>
                <View style={[styles.cardOverlay, {
                    backgroundColor: 'transparent'
                }]} />
                <TouchableOpacity
                    style={styles.cardBody}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
                        {!isArchived ? (
                            <View style={[styles.checkboxWrapper, { zIndex: 10 }]}>
                                <StyledCheckBox
                                    checked={isCompleted}
                                    onCheck={handleCheckToken}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 40 }}
                                />
                                <CelebrationEffect
                                    animations={ideaAnimations}
                                    celebrationType={celebrationType}
                                    visible={showCelebrate}
                                />
                            </View>
                        ) : (
                            <Ionicons name="archive" size={16.5} color={colors.PLACEHOLDER} />
                        )}
                        <View style={{ flex: 1 }}>
                            <StyledText
                                style={[
                                    styles.cardTitle,
                                    {
                                        opacity: isArchived ? 0.9 : 1,
                                        textDecorationLine: (isCompleted && !isArchived) ? 'line-through' : 'none',
                                        color: colors.PRIMARY_TEXT,
                                    }
                                ]}
                                numberOfLines={3}
                            >
                                {hyphenateText(title)}
                            </StyledText>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={styles.cardFooter}>
                    <View style={{ flex: 1 }}>
                        {reminder && !isCompleted && !isArchived && (
                            <View style={styles.cardMetadata}>
                                <Ionicons
                                    name="alarm-outline"
                                    size={13}
                                    color={colors.REMINDER}
                                />
                                <View style={styles.cardTimeContainer}>
                                    <StyledText style={{ fontSize: 9.5, fontWeight: '600', color: colors.REMINDER }}>
                                        {formatDate(reminder, lang).split(' ')[0]}
                                    </StyledText>
                                    <StyledText style={[styles.cardTimeSmall, { fontSize: 9.5, color: colors.REMINDER }]}>
                                        {formatDate(reminder, lang).split(' ')[1]}
                                    </StyledText>
                                </View>
                                {reminderStatus && (
                                    <View style={{ marginLeft: 2 }}>
                                        {reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub' || reminderCancelled ? (
                                            <Ionicons name="notifications-off" size={11} color={colors.ERROR_INPUT_TEXT} />
                                        ) : reminderStatus === 'Göndərilib' ? (
                                            <Ionicons name="checkmark-done-outline" size={11} color={colors.CHECKBOX_SUCCESS} />
                                        ) : (
                                            <Ionicons name="hourglass-outline" size={11} color={colors.REMINDER} />
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    <View style={styles.cardControls}>
                        <TouchableOpacity
                            ref={menuButtonRef}
                            onPress={openMenu}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 40 }}
                        >
                            <Ionicons name="ellipsis-horizontal-outline" size={20.5} color={colors.PRIMARY_TEXT} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[
            styles.container,
            {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: translateAnim }],
                backgroundColor: colors.SECONDARY_BACKGROUND,
                borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
                borderWidth: isDark ? 0.2 : 1,
            }
        ]}>
            <View style={[styles.cardOverlay, {
                backgroundColor: 'transparent'
            }]} />
            <View style={styles.checkTitleContainer}>
                {!isArchived ? (
                    <View style={[styles.checkboxWrapper, { zIndex: 10 }]}>
                        <StyledCheckBox
                            checked={isCompleted}
                            onCheck={handleCheckToken}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 40 }}
                        />
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
                    onPress={onPress} // Open view modal via onOpenMenu if we want, or handle separately
                    onLongPress={handleCheckToken}
                    activeOpacity={0.7}
                >
                    <View style={{ flex: 1 }}>
                        <StyledText
                            style={[{
                                fontSize: 14,
                                fontWeight: '600',
                                lineHeight: 20,
                                letterSpacing: 0.1,
                                opacity: isArchived ? 0.9 : 1,
                                textDecorationLine: (isCompleted && !isArchived) ? 'line-through' : 'none',
                                color: colors.PRIMARY_TEXT,
                            }]}
                        >
                            {hyphenateText(title)}
                        </StyledText>
                    </View>
                    {reminder && !isCompleted && !isArchived && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons
                                    name="alarm-outline"
                                    size={14}
                                    color={colors.REMINDER}
                                />
                                <StyledText style={{
                                    color: colors.REMINDER,
                                    fontSize: 9.5,
                                    textDecorationLine: (reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub' || reminderCancelled) ? 'line-through' : 'none'
                                }}>
                                    {formatDate(reminder, lang)}
                                </StyledText>
                            </View>

                            {reminderStatus && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    {reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub' || reminderCancelled ? (
                                        <Ionicons name="notifications-off" size={12} color={colors.ERROR_INPUT_TEXT} />
                                    ) : reminderStatus === 'Göndərilib' ? (
                                        <Ionicons name="checkmark-done-outline" size={12} color={colors.CHECKBOX_SUCCESS} />
                                    ) : (
                                        <Ionicons name="hourglass-outline" size={12} color={colors.REMINDER} />
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.controlsContainer} onStartShouldSetResponder={() => true}>
                <TouchableOpacity
                    ref={menuButtonRef}
                    onPress={openMenu}
                    activeOpacity={0.7}

                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 40 }}
                >
                    <Ionicons name="ellipsis-horizontal-outline" size={20.5} color={colors.PRIMARY_TEXT} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}

export default TodoItem;
