import GestureWrapper from "@/components/layout/GestureWrapper";
import StyledHeader from "@/components/ui/StyledHeader";
import StyledText from "@/components/ui/StyledText";
import { formatDate } from "@/helpers/date";
import { useTheme } from "@/hooks/useTheme";
import { selectNotifications } from "@/store/slices/notificationSlice";
import { selectTodos } from "@/store/slices/todoSlice";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function TodayTasksScreen() {
    const { colors, t, lang } = useTheme();
    const insets = useSafeAreaInsets();
    const notifications = useSelector(selectNotifications);
    const todos = useSelector(selectTodos);
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'past' | 'waiting'>('all');

    const today = new Date().toISOString().split('T')[0];

    const todayTasks = useMemo(() => {
        return todos
            .filter((todo: Todo) => {
                if (!todo.reminder || todo.isCompleted || todo.isArchived) {
                    return false;
                }
                const reminderDate = todo.reminder.split('T')[0];
                return reminderDate === today;
            })
            .sort((a, b) => new Date(a.reminder!).getTime() - new Date(b.reminder!).getTime());
    }, [todos, today]);

    const filteredTasks = useMemo(() => {
        const now = new Date();
        if (filter === 'all') return todayTasks;
        if (filter === 'past') {
            return todayTasks.filter(task => new Date(task.reminder!) < now);
        }
        if (filter === 'waiting') {
            return todayTasks.filter(task => new Date(task.reminder!) >= now);
        }
        return todayTasks;
    }, [todayTasks, filter]);

    const handleItemPress = (item: Todo) => {
        const notification = notifications.find(n => n.id === item.notificationId);
        const icon = notification?.categoryIcon;

        let path: any = "/(tabs)/todo"; // Default fallback
        if (icon) {
            if (icon.includes('cart')) path = "/(tabs)/shopping";
            else if (icon.includes('gift')) path = "/(tabs)/birthday";
            else if (icon.includes('ticket')) path = "/(tabs)/events";
            else if (icon.includes('film')) path = "/(tabs)/movies";
            else if (icon.includes('wallet')) path = "/(tabs)/expenses";
            else if (icon.includes('list')) path = "/(tabs)/todo";
        }

        router.push(path);
    };

    const getTimeFromReminder = (reminder: string) => {
        return formatDate(reminder, lang).split(' ')[1];
    };

    const isOverdue = (reminder: string) => {
        return new Date(reminder) < new Date();
    };

    const renderItem = useCallback(({ item }: { item: Todo }) => {
        const itemIsOverdue = item.reminder ? isOverdue(item.reminder) : false;

        const statusColor = itemIsOverdue ? '#d43434' : '#3B82F6';
        const statusIcon = itemIsOverdue ? "alert-circle-outline" : "time-outline";
        const statusLabel = itemIsOverdue ? t("status_overdue") : t("status_pending");

        const categoryIcon = notifications.find(n => n.id === item.notificationId)?.categoryIcon;

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleItemPress(item)}
                style={[
                    styles.notificationItem,
                    {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        borderColor: colors.PRIMARY_BORDER_DARK,
                        borderLeftWidth: 4,
                        borderLeftColor: statusColor + '80',
                    }
                ]}
            >
                <View style={{ width: 32, alignItems: 'center' }}>
                    {categoryIcon && !Ionicons.glyphMap[categoryIcon as keyof typeof Ionicons.glyphMap] ? (
                        <StyledText style={{ fontSize: 24 }}>{categoryIcon}</StyledText>
                    ) : (
                        <Ionicons name={(categoryIcon as any) || "list-outline"} size={26} color={statusColor} />
                    )}
                </View>
                <View style={styles.contentContainer}>
                    <StyledText style={[
                        styles.itemTitle,
                        {
                            color: colors.PRIMARY_TEXT,
                            fontWeight: "600",
                        }
                    ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >{item.title}</StyledText>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Ionicons name={statusIcon} size={14} color={statusColor} />
                        <StyledText style={{ fontSize: 12, color: statusColor, fontWeight: "600" }}>
                            {getTimeFromReminder(item.reminder!)} • {statusLabel}
                        </StyledText>
                    </View>
                </View>

                <View style={styles.rightIconContainer}>
                    <Ionicons name="chevron-forward" size={18} color={colors.PLACEHOLDER} />
                </View>
            </TouchableOpacity>
        );
    }, [colors, t, lang, notifications]);

    return (
        <GestureWrapper>
            <View style={[styles.mainContainer, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                <StyledHeader title={t('today_tasks_header')} />

                {/* Filter Chips matching Notifications style */}
                <View style={{ marginBottom: 0 }}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={[
                            { key: 'all', label: t('all') },
                            { key: 'past', label: t('status_overdue') },
                            { key: 'waiting', label: t('status_pending') },
                        ]}
                        keyExtractor={(item) => item.key}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingTop: 16, paddingBottom: 8, flexGrow: 1, justifyContent: 'center' }}
                        renderItem={({ item }) => {
                            const isSelected = filter === item.key;
                            return (
                                <TouchableOpacity
                                    onPress={() => setFilter(item.key as any)}
                                    style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 16,
                                        backgroundColor: isSelected ? '#234E94' : 'transparent',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <StyledText style={{
                                        color: isSelected ? '#fff' : colors.PLACEHOLDER,
                                        fontSize: 12,
                                        fontWeight: isSelected ? '700' : '500',
                                        marginBottom: isSelected ? 4 : 0,
                                    }}>
                                        {item.label}
                                    </StyledText>
                                    {isSelected && (
                                        <View style={{
                                            width: 4,
                                            height: 4,
                                            borderRadius: 2,
                                            backgroundColor: '#fff',
                                        }} />
                                    )}
                                </TouchableOpacity>
                            )
                        }}
                    />
                </View>

                <FlatList
                    data={filteredTasks}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20, paddingTop: 8 }]}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={64} color={colors.PLACEHOLDER} style={{ marginBottom: 16 }} />
                            <StyledText style={{ color: colors.PLACEHOLDER, fontSize: 16 }}>{t("no_results")}</StyledText>
                        </View>
                    }
                />
            </View>
        </GestureWrapper>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
    },
    notificationItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 0.5,
        gap: 16,
    },
    contentContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 2,
    },
    rightIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 100,
    },
});
