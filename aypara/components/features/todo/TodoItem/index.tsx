import StyledCheckBox from "@/components/ui/StyledCheckBox";
import StyledText from "@/components/ui/StyledText";
import { TODO_CATEGORIES } from "@/constants/todo";
import { hyphenateText } from "@/helpers/text";
import { useTheme } from "@/hooks/useTheme";
import { useAppSelector } from "@/store";
import { selectNotificationById } from "@/store/slices/notificationSlice";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import CelebrationEffect, {
  CelebrationType,
  createCelebrationAnimations,
  playCelebration,
} from "./CelebrationEffect";
import ReminderBadge from "./ReminderBadge";
import { getStyles } from "./styles";

type TodoItemProps = Todo & {
  reminder?: string;
  reminderCancelled?: boolean;
  checkTodo: (id: Todo["id"]) => void;
  deleteTodo: (id: Todo["id"]) => void;
  editTodo: (
    id: Todo["id"],
    title: Todo["title"],
    reminder?: string,
    notificationId?: string,
    category?: string,
  ) => void;
  retryTodo: (
    id: Todo["id"],
    delayType: "hour" | "day" | "week" | "month",
    categoryTitle?: string,
    categoryIcon?: string,
  ) => void;
  archiveTodo?: (id: Todo["id"]) => void;
  category?: string;
  viewMode?: "list" | "card";
  onOpenMenu?: (anchor: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  onPress?: () => void;
  completedCount?: number;
};

const getCategoryData = (id?: string) => {
  return TODO_CATEGORIES.find((c) => c.id === id) || TODO_CATEGORIES[0];
};

const TodoItem: React.FC<TodoItemProps> = ({
  id,
  title,
  isCompleted,
  isArchived,
  createdAt,
  completedAt,
  updatedAt,
  archivedAt,
  reminder,
  reminderCancelled,
  notificationId,
  checkTodo,
  deleteTodo,
  editTodo,
  retryTodo,
  archiveTodo,
  category,
  isIterative,
  iterativeDates,
  viewMode = "list",
  onOpenMenu,
  onPress,
  completedCount,
}) => {
  const { t, colors, isDark, lang } = useTheme();

  // Look up status from notification history centralized data
  const notification = useAppSelector((state) =>
    notificationId ? selectNotificationById(state, notificationId) : undefined,
  );
  const reminderStatus = notification?.status;

  const menuButtonRef = useRef<any>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [celebrationType, setCelebrationType] =
    useState<CelebrationType>("idea");

  const ideaAnimations = useRef(createCelebrationAnimations()).current;

  const handleCheckToken = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isCompleted) {
      setCelebrationType("star");
      playCelebration(ideaAnimations, setShowCelebrate);
      setTimeout(() => {
        checkTodo(id);
      }, 600);
    } else {
      checkTodo(id);
    }
  };

  const openMenu = () => {
    if (!onOpenMenu) return;

    // Small delay to ensure any ongoing layout animations finish or settle
    // This is crucial for the menu to appear in the correct position when folders toggle
    setTimeout(() => {
      menuButtonRef.current?.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number,
        ) => {
          if (pageX === 0 && pageY === 0 && pageY === 0) {
            setTimeout(openMenu, 50);
            return;
          }
          onOpenMenu({ x: pageX, y: pageY, width, height });
        },
      );
    }, 64);
  };

  // Check if it's a new task (created within last 2 seconds)
  useEffect(() => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    if (now - created < 2000) {
      setCelebrationType("idea");
      playCelebration(ideaAnimations, setShowCelebrate);
    }
  }, [createdAt, ideaAnimations]);

  // Enter animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(translateAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, translateAnim]);

  const styles = useMemo(() => getStyles(colors), [colors]);

  if (viewMode === "card") {
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateAnim }],
            backgroundColor: colors.SECONDARY_BACKGROUND,
            borderColor: isDark
              ? colors.PRIMARY_BORDER_DARK
              : colors.PRIMARY_BORDER,
            borderWidth: isDark ? 0.2 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.cardOverlay,
            {
              backgroundColor: "transparent",
            },
          ]}
        />
        <TouchableOpacity
          style={styles.cardBody}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 10,
            }}
          >
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
                    textDecorationLine:
                      isCompleted && !isArchived ? "line-through" : "none",
                    color: colors.PRIMARY_TEXT,
                  },
                ]}
                numberOfLines={3}
              >
                {hyphenateText(title)}
              </StyledText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 6,
                  alignItems: "center",
                }}
              >
                {category && (
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor:
                          colors.PLACEHOLDER_SECOND + (isDark ? "20" : "12"),
                        borderColor:
                          colors.PLACEHOLDER_SECOND + (isDark ? "40" : "30"),
                      },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryData(category).icon as any}
                      size={11}
                      color={colors.PLACEHOLDER_SECOND}
                    />
                    <StyledText
                      style={{
                        fontSize: 10,
                        color: colors.colors.PLACEHOLDER_SECOND,
                        fontWeight: "700",
                      }}
                    >
                      {t(`category_${category}` as any)}
                    </StyledText>
                  </View>
                )}
                {isIterative && (
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor:
                          colors.PLACEHOLDER_SECOND + (isDark ? "20" : "12"),
                        borderColor:
                          colors.PLACEHOLDER_SECOND + (isDark ? "40" : "30"),
                        paddingHorizontal: 6,
                        gap: 4,
                      },
                    ]}
                  >
                    <Ionicons
                      name="repeat-outline"
                      size={12}
                      color={colors.PLACEHOLDER_SECOND}
                    />
                    <StyledText
                      style={{
                        fontSize: 10,
                        color: colors.PLACEHOLDER_SECOND,
                        fontWeight: "800",
                      }}
                    >
                      {isCompleted
                        ? 0
                        : (iterativeDates?.length || 0) - (completedCount || 0)}
                      x
                    </StyledText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }}>
            {reminder && !isCompleted && !isArchived && (
              <ReminderBadge
                reminder={reminder}
                reminderStatus={reminderStatus}
                reminderCancelled={reminderCancelled}
                isDark={isDark}
                colors={colors}
                lang={lang}
                viewMode={viewMode}
              />
            )}
          </View>

          <View style={styles.cardControls}>
            <TouchableOpacity
              ref={menuButtonRef}
              onPress={openMenu}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 40 }}
            >
              <Ionicons
                name="ellipsis-horizontal-outline"
                size={20.5}
                color={colors.PRIMARY_TEXT}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: translateAnim }],
          backgroundColor: colors.SECONDARY_BACKGROUND,
          borderColor: isDark
            ? colors.PRIMARY_BORDER_DARK
            : colors.PRIMARY_BORDER,
          borderWidth: isDark ? 0.2 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.cardOverlay,
          {
            backgroundColor: "transparent",
          },
        ]}
      />
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
              style={[
                {
                  fontSize: 14,
                  fontWeight: "600",
                  lineHeight: 20,
                  letterSpacing: 0.1,
                  opacity: isArchived ? 0.9 : 1,
                  textDecorationLine:
                    isCompleted && !isArchived ? "line-through" : "none",
                  color: colors.PRIMARY_TEXT,
                },
              ]}
            >
              {hyphenateText(title)}
            </StyledText>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 4,
                alignItems: "center",
              }}
            >
              {category && (
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor:
                        colors.PLACEHOLDER_SECOND + (isDark ? "20" : "12"),
                      borderColor:
                        colors.PLACEHOLDER_SECOND + (isDark ? "40" : "30"),
                    },
                  ]}
                >
                  <Ionicons
                    name={getCategoryData(category).icon as any}
                    size={11}
                    color={colors.PLACEHOLDER_SECOND}
                  />
                  <StyledText
                    style={{
                      fontSize: 10,
                      color: colors.PLACEHOLDER_SECOND,
                      fontWeight: "700",
                    }}
                  >
                    {t(`category_${category}` as any)}
                  </StyledText>
                </View>
              )}
              {isIterative && (
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor:
                        colors.PLACEHOLDER_SECOND + (isDark ? "20" : "12"),
                      borderColor:
                        colors.PLACEHOLDER_SECOND + (isDark ? "40" : "30"),
                      paddingHorizontal: 6,
                      gap: 4,
                    },
                  ]}
                >
                  <Ionicons
                    name="repeat-outline"
                    size={12}
                    color={colors.PLACEHOLDER_SECOND}
                  />
                  <StyledText
                    style={{
                      fontSize: 10,
                      color: colors.PLACEHOLDER_SECOND,
                      fontWeight: "800",
                    }}
                  >
                    {isCompleted
                      ? 0
                      : (iterativeDates?.length || 0) - (completedCount || 0)}
                    x
                  </StyledText>
                </View>
              )}
              {reminder && !isCompleted && !isArchived && (
                <ReminderBadge
                  reminder={reminder}
                  reminderStatus={reminderStatus}
                  reminderCancelled={reminderCancelled}
                  isDark={isDark}
                  colors={colors}
                  lang={lang}
                  viewMode={viewMode}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View
        style={styles.controlsContainer}
        onStartShouldSetResponder={() => true}
      >
        <TouchableOpacity
          ref={menuButtonRef}
          onPress={openMenu}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 40 }}
        >
          <Ionicons
            name="ellipsis-horizontal-outline"
            size={20.5}
            color={colors.PRIMARY_TEXT}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default TodoItem;
