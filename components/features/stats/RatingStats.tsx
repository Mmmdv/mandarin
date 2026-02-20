import StyledText from "@/components/ui/StyledText";
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { View } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { statsStyles } from './styles';

interface RatingStatsProps {
    ratingMetrics: {
        avg: string;
        max: number;
        min: number;
        counts: number[];
        total: number;
    } | null;
    colors: any;
    isDark: boolean;
    t: (key: any) => string;
}

export function RatingStats({ ratingMetrics, colors, isDark, t }: RatingStatsProps) {
    return (
        <View style={[statsStyles.section, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
            <SectionHeader icon="star" iconColor="#f59e0bCC" iconBg={isDark ? '#2d1f0eCC' : '#fff9dbCC'} title={t("stats_rating_title")} colors={colors} accentColor="#f59e0bCC" />
            {ratingMetrics ? (
                <View style={statsStyles.ratingContainer}>
                    <View style={statsStyles.ratingSummary}>
                        <StyledText style={[statsStyles.ratingAvgText, { color: colors.PRIMARY_TEXT }]}>{ratingMetrics.avg}</StyledText>
                        <View style={statsStyles.starsRow}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Ionicons
                                    key={s}
                                    name={s <= Math.round(Number(ratingMetrics.avg) / 2) ? "star" : "star-outline"}
                                    size={12}
                                    color="#f59e0bCC"
                                />
                            ))}
                        </View>
                        <StyledText style={[statsStyles.ratingTotalText, { color: colors.PLACEHOLDER }]}>
                            {ratingMetrics.total} {t("days_short")}
                        </StyledText>
                    </View>

                    <View style={statsStyles.ratingBreakdown}>
                        {ratingMetrics.counts.map((count, i) => {
                            const score = 10 - i;
                            const percent = ratingMetrics.total > 0 ? (count / ratingMetrics.total) * 100 : 0;

                            // Color logic for 10-point scale
                            let barColor = '#ef4444CC'; // 1-2
                            if (score >= 9) barColor = '#10b981CC'; // 9-10
                            else if (score >= 7) barColor = '#84cc16CC'; // 7-8
                            else if (score >= 5) barColor = '#f59e0bCC'; // 5-6
                            else if (score >= 3) barColor = '#fb923cCC'; // 3-4

                            return (
                                <View key={score} style={statsStyles.breakdownRow}>
                                    <StyledText style={[statsStyles.breakdownLabel, { color: colors.PLACEHOLDER, minWidth: 14 }]}>{score}</StyledText>
                                    <View style={[statsStyles.breakdownBarBg, { backgroundColor: isDark ? '#1e1e1e' : '#f1f5f9' }]}>
                                        <View
                                            style={[
                                                statsStyles.breakdownBarFill,
                                                {
                                                    width: `${percent}%`,
                                                    backgroundColor: barColor
                                                }
                                            ]}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            ) : (
                <StyledText style={statsStyles.emptyText}>{t("stats_no_data")}</StyledText>
            )}
        </View>
    );
}
