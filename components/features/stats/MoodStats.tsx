import StyledText from "@/components/ui/StyledText";
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { View } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { statsStyles } from './styles';

interface MoodStatsProps {
    moodMetrics: {
        avg: string;
        avgMood: { id: number; icon: string; color: string };
        counts: number[];
        total: number;
        moods: { id: number; icon: string; color: string }[];
    } | null;
    colors: any;
    isDark: boolean;
    t: (key: any) => string;
}

export function MoodStats({ moodMetrics, colors, isDark, t }: MoodStatsProps) {
    return (
        <View style={[statsStyles.section, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
            <SectionHeader icon="pulse" iconColor="#6366f1CC" iconBg={isDark ? '#1e1a3dCC' : '#ede9feCC'} title={t("stats_mood_title")} colors={colors} accentColor="#6366f1CC" />
            {moodMetrics ? (
                <View style={{ gap: 20 }}>
                    <View style={{ gap: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <StyledText style={{ fontSize: 13, color: colors.PLACEHOLDER, fontWeight: '600' }}>{t("stats_mood_spectrum")}</StyledText>
                            <View style={[statsStyles.avgBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
                                <Ionicons name={moodMetrics.avgMood.icon as any} size={14} color={moodMetrics.avgMood.color} style={{ marginRight: 6 }} />
                                <StyledText style={{ fontSize: 14, fontWeight: '800', color: colors.PRIMARY_TEXT }}>{moodMetrics.avg}</StyledText>
                            </View>
                        </View>

                        <View style={statsStyles.moodSpectrum}>
                            {moodMetrics.counts.map((count, i) => {
                                const width = moodMetrics.total > 0 ? (count / moodMetrics.total) * 100 : 0;
                                if (width === 0) return null;
                                return (
                                    <View
                                        key={i}
                                        style={{
                                            width: `${width}%`,
                                            height: '100%',
                                            backgroundColor: moodMetrics.moods[i + 1].color,
                                            borderRadius: 4,
                                            marginHorizontal: 1
                                        }}
                                    />
                                );
                            })}
                        </View>
                    </View>

                    <View style={statsStyles.moodChipsGrid}>
                        {moodMetrics.counts.map((count, i) => {
                            const level = i + 1;
                            const percent = Math.round((count / moodMetrics.total) * 100);
                            return (
                                <View key={i} style={[statsStyles.moodChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
                                    <Ionicons name={moodMetrics.moods[level].icon as any} size={20} color={moodMetrics.moods[level].color} />
                                    <View style={{ flex: 1 }}>
                                        <StyledText style={{ fontSize: 12, fontWeight: '700', color: colors.PRIMARY_TEXT }}>{percent}%</StyledText>
                                        <StyledText style={{ fontSize: 8, color: colors.PRIMARY_TEXT, opacity: 0.7, textTransform: 'uppercase' }}>{count} {t("days_short")}</StyledText>
                                    </View>
                                    {count > 0 && <View style={[statsStyles.activeIndicator, { backgroundColor: moodMetrics.moods[level].color }]} />}
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
