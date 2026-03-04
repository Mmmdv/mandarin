import GestureWrapper from "@/components/layout/GestureWrapper";
import StyledHeader from "@/components/ui/StyledHeader";
import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { Lang, Theme, updateAppSetting } from "@/store/slices/appSlice";
import { clearNotifications } from "@/store/slices/notificationSlice";
import { setMood, setRating, setWeight } from "@/store/slices/todaySlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ──────────────────────────────
type StorageGroup = {
    groupKey: string;
    icon: keyof typeof Ionicons.glyphMap;
    items: StorageItem[];
};

type StorageItem = {
    key: string;
    label: string;
    value: any;
    icon: keyof typeof Ionicons.glyphMap;
    onReset?: () => void;
    type: "string" | "number" | "boolean" | "object" | "array";
};

// ─── Component ──────────────────────────
export default function AdminScreen() {
    const { colors, t, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();

    const appState = useAppSelector((state: RootState) => state.app);
    const todoState = useAppSelector((state: RootState) => state.todo);
    const todayState = useAppSelector((state: RootState) => state.today);
    const notificationState = useAppSelector((state: RootState) => state.notification);

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        app_settings: false,
        app_notifications: false,
        app_usage: false,
        breathing_stats: false,
        lifetime_stats: false,
        todos: false,
        today_daily: false,
        notifications: false,
    });

    const [mockPeriod, setMockPeriod] = useState<number>(7);

    const generateMockHistory = () => {
        Alert.alert(
            "Statistika Yarat",
            `${mockPeriod} günlük statistika (Mood, Çəki, Rating) yaradılsın?`,
            [
                { text: t("cancel"), style: "cancel" },
                {
                    text: "Yarat",
                    style: "default",
                    onPress: () => {
                        const today = new Date();
                        for (let i = mockPeriod; i >= 0; i--) {
                            const d = new Date(today);
                            d.setDate(today.getDate() - i);
                            const dateStr = d.toISOString().split("T")[0];

                            // Lower probabilities to create realistic gaps
                            if (Math.random() < 0.50) { // 25% chance of mood logging
                                dispatch(setMood({ date: dateStr, mood: Math.floor(Math.random() * 5) + 1 }));
                            }
                            if (Math.random() < 0.50) { // 15% chance of weight logging
                                const weight = 70 + Math.random() * 2;
                                dispatch(setWeight({ date: dateStr, weight: parseFloat(weight.toFixed(1)) }));
                            }
                            if (Math.random() < 0.50) { // 20% chance of rating logging
                                dispatch(setRating({ date: dateStr, rating: Math.floor(Math.random() * 5) + 1 }));
                            }
                        }
                        Alert.alert("Uğurlu", `${mockPeriod} günlük saxta data yaradıldı.`);
                    },
                },
            ]
        );
    };

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const confirmReset = (label: string, onConfirm: () => void) => {
        Alert.alert(
            `Reset: ${label}`,
            `"${label}" məlumatını sıfırlamaq istəyirsiniz?`,
            [
                { text: t("cancel"), style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: onConfirm,
                },
            ]
        );
    };

    // ─── Group Definitions ──────────────────
    const groups: StorageGroup[] = [
        {
            groupKey: "app_settings",
            icon: "settings-outline",
            items: [
                {
                    key: "lang",
                    label: t("language"),
                    value: appState.lang,
                    icon: "language-outline",
                    type: "string",
                    onReset: () => dispatch(updateAppSetting({ lang: Lang.EN })),
                },
                {
                    key: "theme",
                    label: t("theme"),
                    value: appState.theme,
                    icon: "color-palette-outline",
                    type: "string",
                    onReset: () => dispatch(updateAppSetting({ theme: Theme.DARK })),
                },
                {
                    key: "username",
                    label: "Username",
                    value: appState.username || "—",
                    icon: "person-outline",
                    type: "string",
                    onReset: () => dispatch(updateAppSetting({ username: "" })),
                },
                {
                    key: "biometricEnabled",
                    label: t("enable_biometrics"),
                    value: appState.biometricEnabled,
                    icon: "finger-print-outline",
                    type: "boolean",
                    onReset: () => dispatch(updateAppSetting({ biometricEnabled: false })),
                },
                {
                    key: "isBreathingActive",
                    label: t("tab_breathing_title"),
                    value: appState.isBreathingActive,
                    icon: "leaf-outline",
                    type: "boolean",
                },
            ],
        },
        {
            groupKey: "app_notifications",
            icon: "notifications-outline",
            items: [
                {
                    key: "notificationsEnabled",
                    label: t("notifications"),
                    value: appState.notificationsEnabled,
                    icon: "notifications-outline",
                    type: "boolean",
                    onReset: () => dispatch(updateAppSetting({ notificationsEnabled: false })),
                },
                {
                    key: "todoNotifications",
                    label: t("notifications_todo"),
                    value: appState.todoNotifications,
                    icon: "checkbox-outline",
                    type: "boolean",
                    onReset: () => dispatch(updateAppSetting({ todoNotifications: true })),
                },
                {
                    key: "birthdayNotifications",
                    label: t("notifications_birthday"),
                    value: appState.birthdayNotifications,
                    icon: "gift-outline",
                    type: "boolean",
                    onReset: () => dispatch(updateAppSetting({ birthdayNotifications: true })),
                },
                {
                    key: "movieNotifications",
                    label: t("notifications_movie"),
                    value: appState.movieNotifications,
                    icon: "film-outline",
                    type: "boolean",
                    onReset: () => dispatch(updateAppSetting({ movieNotifications: true })),
                },
                {
                    key: "shoppingNotifications",
                    label: t("notifications_shopping"),
                    value: appState.shoppingNotifications,
                    icon: "cart-outline",
                    type: "boolean",
                    onReset: () => dispatch(updateAppSetting({ shoppingNotifications: true })),
                },
                {
                    key: "eventsNotifications",
                    label: t("notifications_events"),
                    value: appState.eventsNotifications,
                    icon: "calendar-outline",
                    type: "boolean",
                    onReset: () => dispatch(updateAppSetting({ eventsNotifications: true })),
                },
                {
                    key: "expensesNotifications",
                    label: t("notifications_expenses"),
                    value: appState.expensesNotifications,
                    icon: "wallet-outline",
                    type: "boolean",
                    onReset: () => dispatch(updateAppSetting({ expensesNotifications: true })),
                },
            ],
        },
        {
            groupKey: "app_usage",
            icon: "bar-chart-outline",
            items: Object.entries(appState.usageStats || {}).map(([key, value]) => ({
                key: `usage_${key}`,
                label: key.charAt(0).toUpperCase() + key.slice(1),
                value: value,
                icon: getUsageIcon(key),
                type: "number" as const,
            })),
        },
        {
            groupKey: "breathing_stats",
            icon: "leaf-outline",
            items: [
                {
                    key: "breathing_sessions",
                    label: "Ümumi sessiya sayı",
                    value: appState.breathingStats?.totalSessions || 0,
                    icon: "play-circle-outline",
                    type: "number",
                },
                {
                    key: "breathing_total_time",
                    label: "Ümumi istifadə vaxtı",
                    value: (() => {
                        const totalSec = appState.breathingStats?.totalDurationSec || 0;
                        if (totalSec === 0) return "—";
                        const hours = Math.floor(totalSec / 3600);
                        const mins = Math.floor((totalSec % 3600) / 60);
                        const secs = totalSec % 60;
                        if (hours > 0) return `${hours} saat ${mins} dəq`;
                        if (mins > 0) return `${mins} dəq ${secs} san`;
                        return `${secs} san`;
                    })(),
                    icon: "time-outline",
                    type: "string",
                },
                {
                    key: "breathing_avg_duration",
                    label: "Ortalama sessiya müddəti",
                    value: (() => {
                        const sessions = appState.breathingStats?.totalSessions || 0;
                        const totalSec = appState.breathingStats?.totalDurationSec || 0;
                        if (sessions === 0) return "—";
                        const avgSec = Math.round(totalSec / sessions);
                        const mins = Math.floor(avgSec / 60);
                        const secs = avgSec % 60;
                        if (mins > 0) return `${mins} dəq ${secs} san`;
                        return `${secs} san`;
                    })(),
                    icon: "stopwatch-outline",
                    type: "string",
                },
            ],
        },
        {
            groupKey: "lifetime_stats",
            icon: "trophy-outline",
            items: [
                {
                    key: "lifetime_created",
                    label: "İndiyənədək yaradılıb",
                    value: todoState.stats?.totalCreated || 0,
                    icon: "add-circle-outline",
                    type: "number",
                },
                {
                    key: "lifetime_completed",
                    label: "İndiyənədək icra edilib",
                    value: todoState.stats?.totalCompleted || 0,
                    icon: "checkmark-done-circle-outline",
                    type: "number",
                },
                {
                    key: "lifetime_archived",
                    label: "İndiyənədək arxivlənib",
                    value: todoState.stats?.totalArchived || 0,
                    icon: "archive-outline",
                    type: "number",
                },
                {
                    key: "lifetime_deleted",
                    label: "İndiyənədək silinib",
                    value: todoState.stats?.totalDeleted || 0,
                    icon: "trash-outline",
                    type: "number",
                },
                {
                    key: "completion_rate",
                    label: "İcra faizi",
                    value: (() => {
                        const created = todoState.stats?.totalCreated || 0;
                        const deleted = todoState.stats?.totalDeleted || 0;
                        const completed = todoState.stats?.totalCompleted || 0;
                        const effective = created - deleted;
                        return effective > 0 ? `${Math.round((completed / effective) * 100)}%` : "—";
                    })(),
                    icon: "analytics-outline",
                    type: "string",
                },
                {
                    key: "avg_completion_time",
                    label: "Ortalama icra vaxtı",
                    value: (() => {
                        const completed = todoState.stats?.totalCompleted || 0;
                        const totalMs = todoState.stats?.totalCompletionTimeMs || 0;
                        if (completed === 0 || totalMs === 0) return "—";
                        const avgMs = totalMs / completed;
                        const minutes = Math.floor(avgMs / 60000);
                        const hours = Math.floor(minutes / 60);
                        const days = Math.floor(hours / 24);
                        if (days > 0) return `${days} ${t("days_short")} ${hours % 24} ${t("hours_short")}`;
                        if (hours > 0) return `${hours} ${t("hours_short")} ${minutes % 60} ${t("minutes_short")}`;
                        return `${minutes} ${t("minutes_short")}`;
                    })(),
                    icon: "timer-outline",
                    type: "string",
                },
            ],
        },
        {
            groupKey: "todos",
            icon: "list-outline",
            items: [
                {
                    key: "total_todos",
                    label: "Ümumi tapşırıqlar",
                    value: todoState.todos.length,
                    icon: "albums-outline",
                    type: "number",
                },
                {
                    key: "active_todos",
                    label: "Aktiv",
                    value: todoState.todos.filter(todo => !todo.isCompleted && !todo.isArchived).length,
                    icon: "radio-button-on-outline",
                    type: "number",
                },
                {
                    key: "completed_todos",
                    label: t("completed"),
                    value: todoState.todos.filter(todo => todo.isCompleted && !todo.isArchived).length,
                    icon: "checkmark-circle-outline",
                    type: "number",
                },
                {
                    key: "archived_todos",
                    label: t("archive"),
                    value: todoState.todos.filter(todo => todo.isArchived).length,
                    icon: "archive-outline",
                    type: "number",
                },
                ...todoState.todos.map(todo => ({
                    key: `todo_${todo.id}`,
                    label: todo.title,
                    value: todo.isArchived
                        ? "📦 Arxiv"
                        : todo.isCompleted
                            ? "✅ Tamamlanıb"
                            : todo.reminder
                                ? `⏰ ${new Date(todo.reminder).toLocaleString("az")}`
                                : "⏳ Aktiv",
                    icon: (todo.isArchived
                        ? "archive-outline"
                        : todo.isCompleted
                            ? "checkmark-circle-outline"
                            : "ellipse-outline") as keyof typeof Ionicons.glyphMap,
                    type: "string" as const,
                })),
            ],
        },
        {
            groupKey: "today_daily",
            icon: "today-outline",
            items: [
                {
                    key: "total_days",
                    label: t("days_tracked"),
                    value: Object.keys(todayState.daily || {}).length,
                    icon: "calendar-number-outline",
                    type: "number",
                },
                {
                    key: "mood_count",
                    label: "Mood qeydləri",
                    value: Object.values(todayState.daily || {}).filter(d => d.mood !== undefined).length,
                    icon: "happy-outline",
                    type: "number",
                },
                {
                    key: "weight_count",
                    label: "Çəki qeydləri",
                    value: Object.values(todayState.daily || {}).filter(d => d.weight !== undefined).length,
                    icon: "fitness-outline",
                    type: "number",
                },
                {
                    key: "rating_count",
                    label: "Rating qeydləri",
                    value: Object.values(todayState.daily || {}).filter(d => d.rating !== undefined).length,
                    icon: "star-outline",
                    type: "number",
                },
                ...Object.entries(todayState.daily || {})
                    .sort(([a], [b]) => b.localeCompare(a))
                    .flatMap(([date, data]) => {
                        const moodEmojis = ["", "😢", "😟", "😐", "😊", "🤩"];
                        const entries: StorageItem[] = [];
                        if (data.mood !== undefined) {
                            entries.push({
                                key: `mood_${date}`,
                                label: `${date} — Mood`,
                                value: `${moodEmojis[data.mood] || ""} ${data.mood}/5`,
                                icon: "happy-outline",
                                type: "string",
                            });
                        }
                        if (data.weight !== undefined) {
                            entries.push({
                                key: `weight_${date}`,
                                label: `${date} — Çəki`,
                                value: `${data.weight} kg`,
                                icon: "fitness-outline",
                                type: "string",
                            });
                        }
                        if (data.rating !== undefined) {
                            entries.push({
                                key: `rating_${date}`,
                                label: `${date} — Rating`,
                                value: `⭐ ${data.rating}/5`,
                                icon: "star-outline",
                                type: "string",
                            });
                        }
                        return entries;
                    }),
            ],
        },
        {
            groupKey: "notifications",
            icon: "mail-outline",
            items: [
                {
                    key: "total_notifications",
                    label: "Ümumi bildirişlər",
                    value: notificationState.notifications.length,
                    icon: "notifications-outline",
                    type: "number",
                },
                {
                    key: "unread_count",
                    label: "Oxunmamış",
                    value: notificationState.unreadCount,
                    icon: "mail-unread-outline",
                    type: "number",
                },
                ...notificationState.notifications.map(n => ({
                    key: `notif_${n.id}`,
                    label: n.title,
                    value: `${n.status || "—"} · ${n.read ? "Oxunub" : "Oxunmayıb"} · ${new Date(n.date).toLocaleString("az")}`,
                    icon: (n.read ? "mail-open-outline" : "mail-unread-outline") as keyof typeof Ionicons.glyphMap,
                    type: "string" as const,
                })),
            ],
        },
    ];

    // ─── Group labels ──────────────────
    const groupLabels: Record<string, string> = {
        app_settings: "⚙️  Tətbiq Parametrləri",
        app_notifications: "🔔  Bildiriş Parametrləri",
        app_usage: "📊  İstifadə Statistikası",
        breathing_stats: "🫁  Nəfəs Məşqi Statistikası",
        lifetime_stats: "🏆  Ömürlük Statistika",
        todos: "✅  Tapşırıqlar (Todo)",
        today_daily: "📅  Gündəlik Qeydlər (Mood / Çəki / Rating)",
        notifications: "📬  Bildiriş Tarixçəsi",
    };

    const formatValue = (value: any, type: string): string => {
        if (value === null || value === undefined) return "—";
        if (type === "boolean") return value ? "✅ Aktiv" : "❌ Deaktiv";
        if (type === "object") return JSON.stringify(value, null, 2);
        if (type === "array") return `[${(value as any[]).length} element]`;
        return String(value);
    };

    const getValueColor = (value: any, type: string): string => {
        if (type === "boolean") return value ? "#4ECDC4" : "#d16b43";
        if (type === "number") return "#6C9FFF";
        return colors.PRIMARY_TEXT;
    };

    return (
        <GestureWrapper>
            <View style={[styles.mainContainer, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                <StyledHeader title="Admin Panel" showBackButton={true} />

                <ScrollView
                    contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 40 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Storage Summary Card */}
                    <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1a1f2e' : '#f0f4ff' }]}>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Ionicons name="server-outline" size={20} color="#6C9FFF" />
                                <StyledText style={[styles.summaryValue, { color: colors.PRIMARY_TEXT }]}>
                                    {groups.reduce((acc, g) => acc + g.items.length, 0)}
                                </StyledText>
                                <StyledText style={[styles.summaryLabel, { color: colors.SECTION_TEXT }]}>
                                    Ümumi sahə
                                </StyledText>
                            </View>
                            <View style={[styles.summaryDivider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />
                            <View style={styles.summaryItem}>
                                <Ionicons name="layers-outline" size={20} color="#4ECDC4" />
                                <StyledText style={[styles.summaryValue, { color: colors.PRIMARY_TEXT }]}>
                                    {groups.length}
                                </StyledText>
                                <StyledText style={[styles.summaryLabel, { color: colors.SECTION_TEXT }]}>
                                    Qrup
                                </StyledText>
                            </View>
                            <View style={[styles.summaryDivider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />
                            <View style={styles.summaryItem}>
                                <Ionicons name="list-outline" size={20} color="#d16b43" />
                                <StyledText style={[styles.summaryValue, { color: colors.PRIMARY_TEXT }]}>
                                    {todoState.todos.length}
                                </StyledText>
                                <StyledText style={[styles.summaryLabel, { color: colors.SECTION_TEXT }]}>
                                    Tapşırıq
                                </StyledText>
                            </View>
                            <View style={[styles.summaryDivider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />
                            <View style={styles.summaryItem}>
                                <Ionicons name="notifications-outline" size={20} color="#FFD93D" />
                                <StyledText style={[styles.summaryValue, { color: colors.PRIMARY_TEXT }]}>
                                    {notificationState.notifications.length}
                                </StyledText>
                                <StyledText style={[styles.summaryLabel, { color: colors.SECTION_TEXT }]}>
                                    Bildiriş
                                </StyledText>
                            </View>
                        </View>
                    </View>

                    {/* Groups */}
                    {groups.map((group) => (
                        <View key={group.groupKey} style={styles.groupContainer}>
                            {/* Group Header */}
                            <TouchableOpacity
                                style={[
                                    styles.groupHeader,
                                    {
                                        backgroundColor: isDark ? '#111827' : '#f0f2f5',
                                        borderColor: isDark ? '#1f2937' : '#e5e7eb',
                                    },
                                ]}
                                onPress={() => toggleGroup(group.groupKey)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.groupHeaderLeft}>
                                    <StyledText style={[styles.groupTitle, { color: colors.PRIMARY_TEXT }]}>
                                        {groupLabels[group.groupKey] || group.groupKey}
                                    </StyledText>
                                    <View style={[styles.countBadge, { backgroundColor: isDark ? '#2a2f3a' : '#e0e5ee' }]}>
                                        <StyledText style={[styles.countBadgeText, { color: colors.SECTION_TEXT }]}>
                                            {group.items.length}
                                        </StyledText>
                                    </View>
                                </View>
                                <Ionicons
                                    name={expandedGroups[group.groupKey] ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={colors.SECTION_TEXT}
                                />
                            </TouchableOpacity>

                            {/* Group Items */}
                            {expandedGroups[group.groupKey] && (
                                <View style={[
                                    styles.groupBody,
                                    {
                                        backgroundColor: isDark ? '#0d1117' : '#ffffff',
                                        borderColor: isDark ? '#1f2937' : '#e5e7eb',
                                    },
                                ]}>
                                    {group.items.map((item, index) => (
                                        <View
                                            key={item.key}
                                            style={[
                                                styles.itemRow,
                                                index < group.items.length - 1 && {
                                                    borderBottomWidth: 0.5,
                                                    borderBottomColor: isDark ? '#1f2937' : '#f0f0f0',
                                                },
                                            ]}
                                        >
                                            <View style={styles.itemLeft}>
                                                <View style={[
                                                    styles.itemIconContainer,
                                                    { backgroundColor: isDark ? '#1a1f2e' : '#f0f4ff' },
                                                ]}>
                                                    <Ionicons
                                                        name={item.icon}
                                                        size={16}
                                                        color="#6C9FFF"
                                                    />
                                                </View>
                                                <View style={styles.itemTextContainer}>
                                                    <StyledText
                                                        style={[styles.itemLabel, { color: colors.PRIMARY_TEXT }]}
                                                        numberOfLines={1}
                                                    >
                                                        {item.label}
                                                    </StyledText>
                                                    <StyledText
                                                        style={[
                                                            styles.itemValue,
                                                            { color: getValueColor(item.value, item.type) },
                                                        ]}
                                                        numberOfLines={1}
                                                    >
                                                        {formatValue(item.value, item.type)}
                                                    </StyledText>
                                                </View>
                                            </View>

                                            {item.onReset && (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.resetButton,
                                                        { backgroundColor: isDark ? '#1c1014' : '#fff0f0' },
                                                    ]}
                                                    onPress={() => confirmReset(item.label, item.onReset!)}
                                                    activeOpacity={0.6}
                                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                >
                                                    <Ionicons name="refresh-outline" size={16} color="#d16b43" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}

                    {/* Mock Data Generator Zone */}
                    <View style={[styles.dangerZone, { borderColor: isDark ? '#1a365d' : '#bfdbfe', marginBottom: 16 }]}>
                        <StyledText style={[styles.dangerTitle, { color: '#3b82f6' }]}>
                            🛠️ Test Statistikası Yarat
                        </StyledText>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                            {[
                                { label: '1 Həftə', days: 7 },
                                { label: '1 Ay', days: 30 },
                                { label: '1 İl', days: 365 },
                                { label: '2-3 İl', days: 1000 },
                            ].map(option => (
                                <TouchableOpacity
                                    key={option.days}
                                    style={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: '#3b82f6',
                                        backgroundColor: mockPeriod === option.days ? '#3b82f6' : 'transparent'
                                    }}
                                    onPress={() => setMockPeriod(option.days)}
                                >
                                    <StyledText style={{ color: mockPeriod === option.days ? '#fff' : '#3b82f6', fontSize: 13, fontWeight: "600" }}>
                                        {option.label}
                                    </StyledText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.dangerButton, { backgroundColor: isDark ? '#172554' : '#eff6ff', marginBottom: 0 }]}
                            onPress={generateMockHistory}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="bar-chart-outline" size={18} color="#3b82f6" />
                            <StyledText style={[styles.dangerButtonText, { color: '#3b82f6' }]}>
                                {mockPeriod} Günlük Statistika Yarat
                            </StyledText>
                        </TouchableOpacity>
                    </View>

                    {/* Danger Zone */}
                    <View style={[styles.dangerZone, { borderColor: isDark ? '#3b1a1a' : '#fecaca' }]}>
                        <StyledText style={[styles.dangerTitle, { color: '#ef4444' }]}>
                            ⚠️  Təhlükəli Zona
                        </StyledText>

                        <TouchableOpacity
                            style={[styles.dangerButton, { backgroundColor: isDark ? '#1c1014' : '#fff5f5' }]}
                            onPress={() =>
                                confirmReset("Bütün bildirişlər", () => dispatch(clearNotifications()))
                            }
                            activeOpacity={0.7}
                        >
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                            <StyledText style={styles.dangerButtonText}>
                                Bütün bildirişləri sil
                            </StyledText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.dangerButton, { backgroundColor: isDark ? '#1c1014' : '#fff5f5' }]}
                            onPress={() =>
                                confirmReset("Tətbiqi tam sıfırla", () => dispatch({ type: 'RESET_APP' }))
                            }
                            activeOpacity={0.7}
                        >
                            <Ionicons name="nuclear-outline" size={18} color="#ef4444" />
                            <StyledText style={styles.dangerButtonText}>
                                {t("reset_factory")}
                            </StyledText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </GestureWrapper>
    );
}

// ─── Helper ──────────────────────────
function getUsageIcon(key: string): keyof typeof Ionicons.glyphMap {
    const map: Record<string, keyof typeof Ionicons.glyphMap> = {
        todo: "checkbox-outline",
        movies: "film-outline",
        birthday: "gift-outline",
        shopping: "cart-outline",
        events: "calendar-outline",
        expenses: "wallet-outline",
    };
    return map[key] || "analytics-outline";
}

// ─── Styles ──────────────────────────
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    scrollContainer: {
        padding: 16,
    },
    // Summary Card
    summaryCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    summaryItem: {
        alignItems: "center",
        gap: 4,
        flex: 1,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: "500",
    },
    summaryDivider: {
        width: 1,
        height: 40,
        opacity: 0.3,
    },
    // Group
    groupContainer: {
        marginBottom: 12,
    },
    groupHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    groupHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    groupTitle: {
        fontSize: 15,
        fontWeight: "600",
    },
    countBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    // Group Body
    groupBody: {
        borderWidth: 1,
        borderTopWidth: 0,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        overflow: "hidden",
    },
    // Item Row
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    itemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    itemIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    itemTextContainer: {
        flex: 1,
    },
    itemLabel: {
        fontSize: 13,
        fontWeight: "500",
        marginBottom: 2,
    },
    itemValue: {
        fontSize: 12,
        fontWeight: "600",
    },
    // Reset Button
    resetButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    // Danger Zone
    dangerZone: {
        marginTop: 16,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
    },
    dangerTitle: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 12,
    },
    dangerButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginBottom: 8,
    },
    dangerButtonText: {
        color: "#ef4444",
        fontSize: 14,
        fontWeight: "600",
    },
});
