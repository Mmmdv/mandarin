import StyledText from "@/components/ui/StyledText";
import { styles } from "@/constants/homeStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";

// Refactored Components & Hooks
import { BreathingStats } from "@/components/features/stats/BreathingStats";
import { useStatsLogic } from "@/components/features/stats/hooks";
import { MoodStats } from "@/components/features/stats/MoodStats";
import { RatingStats } from "@/components/features/stats/RatingStats";
import { statsStyles } from "@/components/features/stats/styles";
import { TodoStats } from "@/components/features/stats/TodoStats";
import { Period } from "@/components/features/stats/utils";
import { WeightStats } from "@/components/features/stats/WeightStats";

export default function Stats() {
    const { colors, t } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState<Period>("all");

    // Logic separated into a custom hook
    const {
        isDark,
        todoData,
        breathingData,
        moodMetrics,
        weightMetrics,
        weightChartData,
        ratingMetrics,
        lang
    } = useStatsLogic(period);

    // ─── Period chips data ───
    const filterChips = useMemo(() => [
        { key: "week" as Period, label: t("stats_week") },
        { key: "month" as Period, label: t("stats_month") },
        { key: "year" as Period, label: t("stats_year") },
        { key: "all" as Period, label: t("stats_all_time") },
    ], [t]);

    // ─── Period label ───
    const periodLabel = useMemo(() => {
        const now = new Date();
        const locale = lang === 'az' ? 'az-AZ' : lang === 'ru' ? 'ru-RU' : 'en-US';

        switch (period) {
            case "week": {
                const start = new Date(now);
                start.setDate(start.getDate() - 6);
                return `${start.getDate()}.${String(start.getMonth() + 1).padStart(2, '0')} — ${now.getDate()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
            }
            case "month": {
                return now.toLocaleString(locale, { month: 'long', year: 'numeric' });
            }
            case "year":
                return `${now.getFullYear()}`;
            default:
                return t("stats_all_time");
        }
    }, [period, lang, t]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <View style={[styles.header, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <StyledText style={styles.greeting}>
                        {t("tab_stats")}
                    </StyledText>
                </View>
            </View>

            {/* ─── Period Chips ─── */}
            <View style={{ marginBottom: 4 }}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={filterChips}
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={statsStyles.chipsContainer}
                    renderItem={({ item }) => {
                        const isSelected = period === item.key;
                        return (
                            <TouchableOpacity
                                onPress={() => setPeriod(item.key)}
                                style={[
                                    statsStyles.chip,
                                    { backgroundColor: isSelected ? '#234E94' : 'transparent' }
                                ]}
                            >
                                <StyledText style={[
                                    statsStyles.chipText,
                                    { color: isSelected ? '#fff' : colors.PLACEHOLDER, fontWeight: isSelected ? '700' : '500' }
                                ]}>
                                    {item.label}
                                </StyledText>
                                {isSelected && <View style={statsStyles.chipDot} />}
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.PRIMARY_TEXT}
                        colors={[colors.PRIMARY_TEXT]}
                    />
                }
            >
                {/* Date range context */}
                <View style={statsStyles.periodLabelRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.PLACEHOLDER} />
                    <StyledText style={[statsStyles.periodLabelText, { color: colors.PLACEHOLDER }]}>
                        {periodLabel}
                    </StyledText>
                </View>

                {/* Statistics Sections */}
                <TodoStats todoData={todoData} colors={colors} isDark={isDark} t={t} />
                <BreathingStats breathingData={breathingData} colors={colors} isDark={isDark} t={t} />
                <MoodStats moodMetrics={moodMetrics} colors={colors} isDark={isDark} t={t} />
                <WeightStats weightMetrics={weightMetrics} weightChartData={weightChartData} colors={colors} isDark={isDark} t={t} />
                <RatingStats ratingMetrics={ratingMetrics} colors={colors} isDark={isDark} t={t} />
            </ScrollView>
        </View>
    );
}
