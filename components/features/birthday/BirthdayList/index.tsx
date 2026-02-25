import StyledRefreshControl from "@/components/ui/StyledRefreshControl";
import StyledText from "@/components/ui/StyledText";
import { toggleAnimation } from "@/constants/animations";
import { formatDate } from "@/helpers/date";
import useRefresh from "@/hooks/useRefresh";
import { useTheme } from "@/hooks/useTheme";
import { useAppSelector } from "@/store";
import { selectNotificationById } from "@/store/slices/notificationSlice";
import { Birthday } from "@/types/birthday";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Animated,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";
import SortControls, { SortBy, SortOrder } from "../../todo/TodoList/SortControls";
import BirthdayMenuModal from "../modals/BirthdayMenuModal";
import BirthdayViewModal from "../modals/BirthdayViewModal";
import DeleteBirthdayModal from "../modals/DeleteBirthdayModal";
import GreetingModal from "../modals/GreetingModal";
import { RescheduleBirthdayModal } from "../modals/RescheduleBirthdayModal";
import {
    BIRTHDAY_LIGHT,
    BIRTHDAY_PRIMARY,
    getStyles
} from "./styles";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ViewMode = "card" | "list";

type BirthdayListProps = {
    birthdays: Birthday[];
    todayBirthdays: Birthday[];
    upcomingBirthdays: Birthday[];
    onDelete: (id: string) => void;
    onMarkGreetingSent: (id: string) => void;
    onRescheduleBirthday: (id: string, date: Date) => void;
    onAddRequest: () => void;
    getDaysUntilBirthday: (date: string) => number;
    getAge: (date: string) => number;
};

const BirthdayList: React.FC<BirthdayListProps> = ({
    birthdays,
    todayBirthdays,
    upcomingBirthdays,
    onDelete,
    onMarkGreetingSent,
    onRescheduleBirthday,
    onAddRequest,
    getDaysUntilBirthday,
    getAge,
}) => {
    const { colors, t, isDark, lang } = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const { refreshing, onRefresh } = useRefresh();
    const notifications = useAppSelector(state => state.notification.notifications);

    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [deleteTarget, setDeleteTarget] = useState<Birthday | null>(null);
    const [greetingTarget, setGreetingTarget] = useState<Birthday | null>(null);
    const [rescheduleTarget, setRescheduleTarget] = useState<Birthday | null>(null);
    const [viewTarget, setViewTarget] = useState<Birthday | null>(null);
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [menuTarget, setMenuTarget] = useState<Birthday | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ x: number, y: number, width: number, height: number } | undefined>(undefined);

    const [allSortBy, setAllSortBy] = useState<SortBy>("date");
    const [allSortOrder, setAllSortOrder] = useState<SortOrder>("asc");

    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    const otherBirthdays = useMemo(() => {
        const todayIds = new Set(todayBirthdays.map(b => b.id));
        const upcomingIds = new Set(upcomingBirthdays.map(b => b.id));
        const filtered = birthdays.filter(b => !todayIds.has(b.id) && !upcomingIds.has(b.id));

        return [...filtered].sort((a, b) => {
            if (allSortBy === "date") {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return allSortOrder === "asc" ? dateA - dateB : dateB - dateA;
            } else {
                const textA = a.name.toLowerCase();
                const textB = b.name.toLowerCase();
                return allSortOrder === "asc"
                    ? textA.localeCompare(textB, lang)
                    : textB.localeCompare(textA, lang);
            }
        });
    }, [birthdays, todayBirthdays, upcomingBirthdays, allSortBy, allSortOrder, lang]);

    const [todayExpanded, setTodayExpanded] = useState(true);
    const [upcomingExpanded, setUpcomingExpanded] = useState(false);
    const [allExpanded, setAllExpanded] = useState(false);

    const todayAnimation = useRef(new Animated.Value(1)).current;
    const upcomingAnimation = useRef(new Animated.Value(0)).current;
    const allAnimation = useRef(new Animated.Value(0)).current;

    const toggleViewMode = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewMode(prev => prev === "card" ? "list" : "card");
    }, []);

    const toggleSection = (
        setter: React.Dispatch<React.SetStateAction<boolean>>,
        anim: Animated.Value,
        section: 'today' | 'upcoming' | 'all'
    ) => {
        setter(prev => {
            const newValue = !prev;
            Animated.timing(anim, {
                toValue: newValue ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            if (newValue) {
                if (section !== 'today') {
                    setTodayExpanded(false);
                    Animated.timing(todayAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start();
                }
                if (section !== 'upcoming') {
                    setUpcomingExpanded(false);
                    Animated.timing(upcomingAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start();
                }
                if (section !== 'all') {
                    setAllExpanded(false);
                    Animated.timing(allAnimation, { toValue: 0, duration: 300, useNativeDriver: true }).start();
                }
            }

            LayoutAnimation.configureNext(toggleAnimation);
            return newValue;
        });
    };

    const handleToggleSortBy = () => {
        LayoutAnimation.configureNext(toggleAnimation);
        setAllSortBy(prev => prev === "date" ? "text" : "date");
    };

    const handleToggleSortOrder = () => {
        LayoutAnimation.configureNext(toggleAnimation);
        setAllSortOrder(prev => prev === "asc" ? "desc" : "asc");
    };

    const getRotation = (anim: any) => {
        return anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '90deg']
        });
    };

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
        };
    };

    const formatBirthdayDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const getDaysLabel = (days: number) => {
        if (days === 0) return t("birthday_today");
        if (days === 1) return t("birthday_tomorrow");
        return `${days} ${t("birthday_days_left")}`;
    };

    const getDaysColor = (days: number) => {
        if (days === 0) return '#F43F5E';
        if (days === 1) return colors.REMINDER;
        if (days <= 7) return colors.CHECKBOX_SUCCESS;
        return colors.SECTION_TEXT;
    };

    const handleOpenMenu = (item: Birthday, anchor: { x: number, y: number, width: number, height: number }) => {
        setMenuTarget(item);
        setMenuAnchor(anchor);
        setIsMenuModalOpen(true);
    };

    // Card Item (Grid View)
    const BirthdayGridItem = ({ item }: { item: Birthday }) => {
        const daysUntil = getDaysUntilBirthday(item.date);
        const age = getAge(item.date);
        const nextAge = age + (daysUntil === 0 ? 0 : 1);
        const isToday = daysUntil === 0;

        const notification = useAppSelector(state =>
            item.notificationId ? selectNotificationById(state, item.notificationId) : undefined
        );
        const reminderStatus = notification?.status;
        const isReminderCancelled = reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub';

        const menuButtonRef = useRef<any>(null);

        const onOpenMenu = () => {
            menuButtonRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
                handleOpenMenu(item, { x: pageX, y: pageY, width, height });
            });
        };

        return (
            <Pressable
                onPress={() => setViewTarget(item)}
                style={[
                    styles.gridCard,
                    {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
                    }
                ]}
            >
                <View style={styles.gridCardHeader}>
                    <View style={[styles.gridAvatar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                        {isToday ? (
                            <Ionicons name="gift" size={20} color="#F43F5E" />
                        ) : (
                            <StyledText style={[styles.gridAvatarText, { color: colors.PRIMARY_TEXT }]}>
                                {item.name.charAt(0).toUpperCase()}
                            </StyledText>
                        )}
                    </View>
                    <View style={[styles.gridDaysBadge, { backgroundColor: getDaysColor(daysUntil) + "20" }]}>
                        <StyledText style={[styles.gridDaysText, { color: getDaysColor(daysUntil) }]}>
                            {getDaysLabel(daysUntil)}
                        </StyledText>
                    </View>
                </View>

                <View style={styles.gridCardBody}>
                    <StyledText style={[styles.gridName, { color: colors.PRIMARY_TEXT }]} numberOfLines={1}>
                        {item.name}
                    </StyledText>
                    <StyledText style={[styles.gridDate, { color: colors.SECTION_TEXT }]}>
                        {formatBirthdayDate(item.date)}
                    </StyledText>
                    <StyledText style={[styles.gridDate, { color: colors.SECTION_TEXT, fontSize: 10, marginTop: 2 }]}>
                        {nextAge} {t("birthday_age")}
                    </StyledText>
                </View>

                <View style={styles.gridCardFooter}>
                    <View style={styles.gridMetadata}>
                        {isToday ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons
                                    name={item.greetingSent ? "checkmark-done-circle-outline" : "close-circle-outline"}
                                    size={12}
                                    color={item.greetingSent ? "#4ECDC4" : colors.SECTION_TEXT}
                                />
                                <StyledText style={{ fontSize: 9, fontWeight: '600', color: item.greetingSent ? "#4ECDC4" : colors.SECTION_TEXT }}>
                                    {item.greetingSent ? t("birthday_greeting_sent") : t("birthday_greeting_not_sent")}
                                </StyledText>
                            </View>
                        ) : (
                            item.notificationId && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons
                                        name="alarm-outline"
                                        size={12}
                                        color={isReminderCancelled ? colors.ERROR_INPUT_TEXT : colors.REMINDER}
                                    />
                                    <StyledText style={{
                                        fontSize: 9,
                                        fontWeight: '600',
                                        color: isReminderCancelled ? colors.ERROR_INPUT_TEXT : colors.REMINDER,
                                        textDecorationLine: isReminderCancelled ? 'line-through' : 'none'
                                    }}>
                                        {notification?.date ? formatDate(notification.date, lang) : t("status_scheduled")}
                                    </StyledText>
                                </View>
                            )
                        )}
                    </View>
                    <TouchableOpacity
                        ref={menuButtonRef}
                        onPress={onOpenMenu}
                        hitSlop={15}
                        style={{ marginLeft: 'auto' }}
                    >
                        <Ionicons name="ellipsis-horizontal" size={18} color={colors.PRIMARY_TEXT} />
                    </TouchableOpacity>
                </View>
            </Pressable>
        );
    };

    const BirthdayCard = ({ item }: { item: Birthday }) => {
        const daysUntil = getDaysUntilBirthday(item.date);
        const age = getAge(item.date);
        const nextAge = age + (daysUntil === 0 ? 0 : 1);
        const isToday = daysUntil === 0;

        const notification = useAppSelector(state =>
            item.notificationId ? selectNotificationById(state, item.notificationId) : undefined
        );
        const reminderStatus = notification?.status;
        const isReminderCancelled = reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub';

        const menuButtonRef = useRef<any>(null);

        const onOpenMenu = () => {
            menuButtonRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
                handleOpenMenu(item, { x: pageX, y: pageY, width, height });
            });
        };

        return (
            <View key={item.id} style={{ position: 'relative' }}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setViewTarget(item)}
                    style={[
                        styles.card,
                        {
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                            borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
                            shadowOpacity: isDark ? 0.2 : 0.05,
                            shadowColor: "#000",
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.avatar,
                            {
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                            },
                        ]}
                    >
                        {isToday ? (
                            <Ionicons name="gift" size={24} color="#F43F5E" />
                        ) : (
                            <StyledText style={[styles.avatarText, { color: colors.PRIMARY_TEXT }]}>
                                {item.name.charAt(0).toUpperCase()}
                            </StyledText>
                        )}
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.nameRow}>
                            <StyledText
                                style={[styles.name, { color: colors.PRIMARY_TEXT }]}
                                numberOfLines={1}
                            >
                                {item.name}
                            </StyledText>
                        </View>

                        <View style={styles.infoRow}>
                            <StyledText style={[styles.dateText, { color: colors.SECTION_TEXT }]}>
                                {formatBirthdayDate(item.date)}
                            </StyledText>
                            <View style={styles.dot} />
                            <StyledText style={[styles.dateText, { color: colors.SECTION_TEXT }]}>
                                {nextAge} {t("birthday_age")}
                            </StyledText>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <View style={[styles.daysBadge, { backgroundColor: getDaysColor(daysUntil) + "20", marginTop: 0 }]}>
                                <StyledText style={[styles.daysText, { color: getDaysColor(daysUntil) }]}>
                                    {getDaysLabel(daysUntil)}
                                </StyledText>
                            </View>
                        </View>

                        <View style={[styles.notificationStatus, { marginTop: 4, gap: 10 }]}>
                            {isToday ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons
                                        name={item.greetingSent ? "checkmark-done-circle-outline" : "close-circle-outline"}
                                        size={14}
                                        color={item.greetingSent ? "#4ECDC4" : colors.SECTION_TEXT}
                                    />
                                    <StyledText style={{ fontSize: 10, fontWeight: '600', color: item.greetingSent ? "#4ECDC4" : colors.SECTION_TEXT }}>
                                        {item.greetingSent ? t("birthday_greeting_sent") : t("birthday_greeting_not_sent")}
                                    </StyledText>
                                </View>
                            ) : (
                                item.notificationId && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Ionicons
                                            name="alarm-outline"
                                            size={14}
                                            color={isReminderCancelled ? colors.ERROR_INPUT_TEXT : colors.REMINDER}
                                        />
                                        <StyledText style={{
                                            fontSize: 10,
                                            fontWeight: '600',
                                            color: isReminderCancelled ? colors.ERROR_INPUT_TEXT : colors.REMINDER,
                                            textDecorationLine: isReminderCancelled ? 'line-through' : 'none'
                                        }}>
                                            {notification?.date ? formatDate(notification.date, lang) : t("status_scheduled")}
                                        </StyledText>
                                        {!isReminderCancelled && (
                                            <Ionicons name="hourglass-outline" size={12} color={colors.REMINDER} />
                                        )}
                                        {isReminderCancelled && (
                                            <Ionicons name="notifications-off" size={12} color={colors.ERROR_INPUT_TEXT} />
                                        )}
                                    </View>
                                )
                            )}
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}>
                    <TouchableOpacity
                        ref={menuButtonRef}
                        onPress={onOpenMenu}
                        activeOpacity={0.7}
                        hitSlop={15}
                    >
                        <Ionicons name="ellipsis-horizontal-outline" size={20.5} color={colors.PRIMARY_TEXT} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Empty state
    if (birthdays.length === 0) {
        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                router.replace("/");
                            }
                        }}
                        style={{ marginRight: 10, zIndex: 20 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 60 }}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.PRIMARY_TEXT} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, justifyContent: "center" }} pointerEvents="none">
                        <StyledText style={[styles.headerTitle, { color: colors.PRIMARY_TEXT }]}>
                            {t("tab_birthday")}
                        </StyledText>
                    </View>
                </View>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingBottom: 80 }}
                    refreshControl={
                        <StyledRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View style={styles.emptyContainer}>
                        <View
                            style={[
                                styles.emptyIcon,
                                {
                                    backgroundColor: colors.SECONDARY_BACKGROUND,
                                    shadowColor: BIRTHDAY_PRIMARY,
                                },
                            ]}
                        >
                            <Ionicons name="gift-outline" size={64} color={BIRTHDAY_LIGHT} />
                        </View>
                        <StyledText
                            style={{ fontSize: 22, fontWeight: "bold", color: colors.PRIMARY_TEXT, marginBottom: 8 }}
                        >
                            {t("birthday_empty_title")}
                        </StyledText>
                        <StyledText
                            style={{
                                fontSize: 16,
                                color: colors.PLACEHOLDER,
                                textAlign: "center",
                                marginBottom: 32,
                                paddingHorizontal: 40,
                            }}
                        >
                            {t("birthday_empty_desc")}
                        </StyledText>
                        <TouchableOpacity
                            onPress={onAddRequest}
                            activeOpacity={0.8}
                            style={[
                                styles.emptyButton,
                                {
                                    backgroundColor: isDark ? colors.SECONDARY_BACKGROUND : colors.PRIMARY_BACKGROUND,
                                    borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
                                    shadowColor: BIRTHDAY_PRIMARY,
                                    shadowOpacity: isDark ? 0.3 : 0.1,
                                },
                            ]}
                        >
                            <Ionicons name="add" size={24} color={BIRTHDAY_PRIMARY} />
                            <StyledText style={{ color: BIRTHDAY_PRIMARY, fontSize: 16, fontWeight: "bold" }}>
                                {t("birthday_add")}
                            </StyledText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            router.replace("/");
                        }
                    }}
                    style={{ marginRight: 10, zIndex: 20 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 60 }}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.PRIMARY_TEXT} />
                </TouchableOpacity>

                <View style={{ flex: 1, justifyContent: "center" }}>
                    <StyledText style={[styles.headerTitle, { color: colors.PRIMARY_TEXT }]}>
                        {t("tab_birthday")}
                    </StyledText>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => router.push("/birthday-history")}
                        style={{
                            width: 38,
                            height: 38,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            borderRadius: 12,
                            borderWidth: 0.2,
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Ionicons name="time-outline" size={22} color={colors.PRIMARY_TEXT} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={toggleViewMode}
                        style={[styles.viewToggleButton, {
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                        }]}
                    >
                        <Ionicons
                            name={viewMode === "card" ? "list" : "grid"}
                            size={20}
                            color={colors.PRIMARY_TEXT}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sticky headers handled conditionally */}
            {todayBirthdays.length > 0 && (todayExpanded || upcomingExpanded || allExpanded) && (
                <TouchableOpacity
                    style={[styles.sectionHeaderCard, styles.stickySectionHeader, { backgroundColor: isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.08)', borderWidth: 0.2, borderColor: isDark ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.15)' }]}
                    onPress={() => toggleSection(setTodayExpanded, todayAnimation, 'today')}
                >
                    <View style={styles.sectionTitleContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(244, 63, 94, 0.2)' : 'rgba(244, 63, 94, 0.1)' }]}>
                            <Ionicons name="sparkles-outline" size={18} color="#F43F5E" />
                        </View>
                        <StyledText style={styles.sectionTitleCard}>{t("birthday_today")}</StyledText>
                        <View style={styles.cardBadge}>
                            <StyledText style={styles.cardBadgeText}>{todayBirthdays.length}</StyledText>
                        </View>
                    </View>
                    <View style={styles.sectionControls}>
                        <View style={{ flex: 1 }} />
                        <View style={styles.chevronZone}>
                            <Animated.View style={{ transform: [{ rotate: getRotation(todayAnimation) }] }}>
                                <Ionicons name="chevron-forward" size={14} color={isDark ? colors.SECTION_TEXT : colors.PRIMARY_TEXT} />
                            </Animated.View>
                        </View>
                    </View>
                    <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(244, 63, 94, 0.12)' }, getCircleTransform(todayAnimation)]} />
                </TouchableOpacity>
            )}

            {upcomingBirthdays.length > 0 && (upcomingExpanded || allExpanded) && (
                <TouchableOpacity
                    style={[styles.sectionHeaderCard, styles.stickySectionHeader, { backgroundColor: isDark ? 'rgba(78, 205, 196, 0.15)' : 'rgba(78, 205, 196, 0.08)', borderWidth: 0.2, borderColor: isDark ? 'rgba(78, 205, 196, 0.3)' : 'rgba(78, 205, 196, 0.15)' }]}
                    onPress={() => toggleSection(setUpcomingExpanded, upcomingAnimation, 'upcoming')}
                >
                    <View style={styles.sectionTitleContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(78, 205, 196, 0.2)' : 'rgba(78, 205, 196, 0.1)' }]}>
                            <Ionicons name="calendar-outline" size={18} color="#4ECDC4" />
                        </View>
                        <StyledText style={styles.sectionTitleCard}>{t("birthday_upcoming")}</StyledText>
                        <View style={styles.cardBadge}>
                            <StyledText style={styles.cardBadgeText}>{upcomingBirthdays.length}</StyledText>
                        </View>
                    </View>
                    <View style={styles.sectionControls}>
                        <View style={{ flex: 1 }} />
                        <View style={styles.chevronZone}>
                            <Animated.View style={{ transform: [{ rotate: getRotation(upcomingAnimation) }] }}>
                                <Ionicons name="chevron-forward" size={14} color={isDark ? colors.SECTION_TEXT : colors.PRIMARY_TEXT} />
                            </Animated.View>
                        </View>
                    </View>
                    <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(78, 205, 196, 0.12)' }, getCircleTransform(upcomingAnimation)]} />
                </TouchableOpacity>
            )}

            {allExpanded && (
                <TouchableOpacity
                    style={[styles.sectionHeaderCard, styles.stickySectionHeader, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.08)', borderWidth: 0.2, borderColor: isDark ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.15)' }]}
                    onPress={() => toggleSection(setAllExpanded, allAnimation, 'all')}
                >
                    <View style={styles.sectionTitleContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)' }]}>
                            <Ionicons name="gift-outline" size={18} color={BIRTHDAY_LIGHT} />
                        </View>
                        <StyledText style={styles.sectionTitleCard}>{t("birthday_all")}</StyledText>
                        <View style={styles.cardBadge}>
                            <StyledText style={styles.cardBadgeText}>{otherBirthdays.length}</StyledText>
                        </View>
                    </View>
                    <View style={styles.sectionControls}>
                        <View style={styles.sortZone}>
                            {allExpanded && otherBirthdays.length > 0 && (
                                <SortControls
                                    sortBy={allSortBy}
                                    sortOrder={allSortOrder}
                                    onToggleSortBy={handleToggleSortBy}
                                    onToggleSortOrder={handleToggleSortOrder}
                                />
                            )}
                        </View>
                        <View style={{ flex: 1 }} />
                        <View style={styles.chevronZone}>
                            <Animated.View style={{ transform: [{ rotate: getRotation(allAnimation) }] }}>
                                <Ionicons name="chevron-forward" size={14} color={isDark ? colors.SECTION_TEXT : colors.PRIMARY_TEXT} />
                            </Animated.View>
                        </View>
                    </View>
                    <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(79, 70, 229, 0.12)' }, getCircleTransform(allAnimation)]} />
                </TouchableOpacity>
            )}

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <StyledRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {todayBirthdays.length > 0 && (
                    <View style={styles.sectionContainer}>
                        {!upcomingExpanded && !allExpanded && !todayExpanded && (
                            <TouchableOpacity
                                style={[styles.sectionHeaderCard, { backgroundColor: isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.08)', borderWidth: 0.2, borderColor: isDark ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.15)' }]}
                                onPress={() => toggleSection(setTodayExpanded, todayAnimation, 'today')}
                            >
                                <View style={styles.sectionTitleContainer}>
                                    <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(244, 63, 94, 0.2)' : 'rgba(244, 63, 94, 0.1)' }]}>
                                        <Ionicons name="sparkles-outline" size={18} color="#F43F5E" />
                                    </View>
                                    <StyledText style={styles.sectionTitleCard}>
                                        {t("birthday_today")}
                                    </StyledText>
                                    <View style={styles.cardBadge}>
                                        <StyledText style={styles.cardBadgeText}>{todayBirthdays.length}</StyledText>
                                    </View>
                                </View>
                                <View style={styles.sectionControls}>
                                    <View style={{ flex: 1 }} />
                                    <View style={styles.chevronZone}>
                                        <Animated.View style={{ transform: [{ rotate: getRotation(todayAnimation) }] }}>
                                            <Ionicons name="chevron-forward" size={14} color={isDark ? colors.SECTION_TEXT : colors.PRIMARY_TEXT} />
                                        </Animated.View>
                                    </View>
                                </View>
                                <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(244, 63, 94, 0.12)' }, getCircleTransform(todayAnimation)]} />
                            </TouchableOpacity>
                        )}

                        {todayExpanded && (
                            <View style={[viewMode === 'card' ? styles.gridContainer : { marginTop: 5 }]}>
                                {todayBirthdays.map(item =>
                                    viewMode === 'card'
                                        ? <BirthdayGridItem key={item.id} item={item} />
                                        : <BirthdayCard key={item.id} item={item} />
                                )}
                            </View>
                        )}
                    </View>
                )}

                {upcomingBirthdays.length > 0 && (
                    <View style={styles.sectionContainer}>
                        {!allExpanded && !upcomingExpanded && (
                            <TouchableOpacity
                                style={[styles.sectionHeaderCard, { backgroundColor: isDark ? 'rgba(78, 205, 196, 0.15)' : 'rgba(78, 205, 196, 0.08)', borderWidth: 0.2, borderColor: isDark ? 'rgba(78, 205, 196, 0.3)' : 'rgba(78, 205, 196, 0.15)' }]}
                                onPress={() => toggleSection(setUpcomingExpanded, upcomingAnimation, 'upcoming')}
                            >
                                <View style={styles.sectionTitleContainer}>
                                    <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(78, 205, 196, 0.2)' : 'rgba(78, 205, 196, 0.1)' }]}>
                                        <Ionicons name="calendar-outline" size={18} color="#4ECDC4" />
                                    </View>
                                    <StyledText style={styles.sectionTitleCard}>
                                        {t("birthday_upcoming")}
                                    </StyledText>
                                    <View style={styles.cardBadge}>
                                        <StyledText style={styles.cardBadgeText}>{upcomingBirthdays.length}</StyledText>
                                    </View>
                                </View>
                                <View style={styles.sectionControls}>
                                    <View style={{ flex: 1 }} />
                                    <View style={styles.chevronZone}>
                                        <Animated.View style={{ transform: [{ rotate: getRotation(upcomingAnimation) }] }}>
                                            <Ionicons name="chevron-forward" size={14} color={isDark ? colors.SECTION_TEXT : colors.PRIMARY_TEXT} />
                                        </Animated.View>
                                    </View>
                                </View>
                                <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(78, 205, 196, 0.12)' }, getCircleTransform(upcomingAnimation)]} />
                            </TouchableOpacity>
                        )}

                        {upcomingExpanded && (
                            <View style={[viewMode === 'card' ? styles.gridContainer : { marginTop: 5 }]}>
                                {upcomingBirthdays.map(item =>
                                    viewMode === 'card'
                                        ? <BirthdayGridItem key={item.id} item={item} />
                                        : <BirthdayCard key={item.id} item={item} />
                                )}
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.sectionContainer}>
                    {!allExpanded && (
                        <TouchableOpacity
                            style={[styles.sectionHeaderCard, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.08)', borderWidth: 0.2, borderColor: isDark ? 'rgba(79, 70, 229, 0.3)' : 'rgba(79, 70, 229, 0.15)' }]}
                            onPress={() => toggleSection(setAllExpanded, allAnimation, 'all')}
                        >
                            <View style={styles.sectionTitleContainer}>
                                <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)' }]}>
                                    <Ionicons name="gift-outline" size={18} color={BIRTHDAY_LIGHT} />
                                </View>
                                <StyledText style={styles.sectionTitleCard}>
                                    {t("birthday_all")}
                                </StyledText>
                                <View style={styles.cardBadge}>
                                    <StyledText style={styles.cardBadgeText}>{otherBirthdays.length}</StyledText>
                                </View>
                            </View>
                            <View style={styles.sectionControls}>
                                <View style={styles.sortZone} />
                                <View style={{ flex: 1 }} />
                                <View style={styles.chevronZone}>
                                    <Animated.View style={{ transform: [{ rotate: getRotation(allAnimation) }] }}>
                                        <Ionicons name="chevron-forward" size={14} color={isDark ? colors.SECTION_TEXT : colors.PRIMARY_TEXT} />
                                    </Animated.View>
                                </View>
                            </View>
                            <Animated.View style={[styles.decorativeCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(79, 70, 229, 0.12)' }, getCircleTransform(allAnimation)]} />
                        </TouchableOpacity>
                    )}

                    {allExpanded && (
                        <View style={[viewMode === 'card' ? styles.gridContainer : { marginTop: 5 }]}>
                            {otherBirthdays.map(item =>
                                viewMode === 'card'
                                    ? <BirthdayGridItem key={item.id} item={item} />
                                    : <BirthdayCard key={item.id} item={item} />
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            <DeleteBirthdayModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDelete={() => {
                    if (deleteTarget) {
                        onDelete(deleteTarget.id);
                        setDeleteTarget(null);
                    }
                }}
                name={deleteTarget?.name}
            />

            <GreetingModal
                isOpen={!!greetingTarget}
                onClose={() => setGreetingTarget(null)}
                onSend={() => {
                    if (greetingTarget) {
                        onMarkGreetingSent(greetingTarget.id);
                    }
                }}
                personName={greetingTarget?.name || ""}
            />

            <BirthdayMenuModal
                isOpen={isMenuModalOpen}
                onClose={() => setIsMenuModalOpen(false)}
                anchorPosition={menuAnchor}
                isToday={getDaysUntilBirthday(menuTarget?.date || "") === 0}
                alreadyGreeted={!!(menuTarget?.greetingSent && menuTarget?.greetingYear === new Date().getFullYear())}
                onViewDetails={() => {
                    if (menuTarget) {
                        setViewTarget(menuTarget);
                    }
                }}
                onGreet={() => {
                    if (menuTarget) {
                        setGreetingTarget(menuTarget);
                    }
                }}
                onDelete={() => {
                    if (menuTarget) {
                        setDeleteTarget(menuTarget);
                    }
                }}
                onReschedule={() => {
                    if (menuTarget) {
                        setRescheduleTarget(menuTarget);
                    }
                }}
                isCancelled={
                    menuTarget?.notificationId
                        ? (() => {
                            const status = notifications.find(n => n.id === menuTarget.notificationId)?.status;
                            return status === 'Ləğv olunub' || status === 'Dəyişdirilib və ləğv olunub';
                        })()
                        : false
                }
            />

            <BirthdayViewModal
                isOpen={!!viewTarget}
                onClose={() => setViewTarget(null)}
                birthday={viewTarget}
            />

            <RescheduleBirthdayModal
                isOpen={!!rescheduleTarget}
                onClose={() => setRescheduleTarget(null)}
                initialDate={rescheduleTarget?.date || ""}
                onReschedule={(date) => {
                    if (rescheduleTarget) {
                        onRescheduleBirthday(rescheduleTarget.id, date);
                        setRescheduleTarget(null);
                    }
                }}
            />
        </View>
    );
};

export default BirthdayList;
