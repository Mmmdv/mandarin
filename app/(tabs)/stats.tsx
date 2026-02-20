import StyledText from "@/components/ui/StyledText";
import { styles } from "@/constants/homeStyles";
import { useTheme } from "@/hooks/useTheme";
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
    const [period, setPeriod] = useState<Period>("week");

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
        { key: "365" as Period, label: t("stats_365") },
    ], [t]);


    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <View style={[styles.header, { backgroundColor: colors.PRIMARY_BACKGROUND, paddingBottom: 12 }]}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <StyledText style={styles.greeting}>
                        {t("tab_stats")}
                    </StyledText>
                </View>
                {/* Placeholder View for alignment consistency with other headers having icons */}
                <View style={{ width: 0, height: 40 }} />
            </View>

            {/* ─── Period Chips ─── */}
            <View style={{ backgroundColor: colors.PRIMARY_BACKGROUND, paddingBottom: 12 }}>
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
                contentContainerStyle={[styles.scrollContent, { paddingTop: 12 }]}
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
