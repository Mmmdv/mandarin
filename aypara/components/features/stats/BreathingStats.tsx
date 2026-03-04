import StyledText from "@/components/ui/StyledText";
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { View } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { statsStyles } from './styles';
import { formatDuration } from './utils';

interface BreathingStatsProps {
    breathingData: {
        totalSessions: number;
        totalDurationSec: number;
    };
    colors: any;
    isDark: boolean;
    t: (key: any) => string;
}

export function BreathingStats({ breathingData, colors, isDark, t }: BreathingStatsProps) {
    return (
        <View style={[statsStyles.section, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
            <SectionHeader icon="leaf-outline" iconBg={isDark ? '#2d2417CC' : '#f5ebe0CC'} iconColor="#c3a17aCC" title={t("stats_breathing_title")} colors={colors} accentColor="#c3a17aCC" />
            <View style={[statsStyles.summaryRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
                <View style={statsStyles.summaryItem}>
                    <Ionicons name="play-circle-outline" size={20} color="#c3a17aCC" />
                    <StyledText style={[statsStyles.summaryValue, { color: colors.PRIMARY_TEXT }]}>{breathingData.totalSessions}</StyledText>
                    <StyledText style={[statsStyles.summaryLabel, { color: colors.PLACEHOLDER }]}>{t("stats_sessions")}</StyledText>
                </View>
                <View style={{ width: 1, height: 28, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                <View style={statsStyles.summaryItem}>
                    <Ionicons name="time-outline" size={20} color="#3b82f6CC" />
                    <StyledText style={[statsStyles.summaryValue, { color: colors.PRIMARY_TEXT }]}>
                        {formatDuration(breathingData.totalDurationSec, {
                            h: t("hours_short"),
                            m: t("minutes_short"),
                            s: t("seconds_short")
                        })}
                    </StyledText>
                    <StyledText style={[statsStyles.summaryLabel, { color: colors.PLACEHOLDER }]}>{t("stats_total_time")}</StyledText>
                </View>
                <View style={{ width: 1, height: 28, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                <View style={statsStyles.summaryItem}>
                    <Ionicons name="stopwatch-outline" size={20} color="#8b5cf6CC" />
                    <StyledText style={[statsStyles.summaryValue, { color: colors.PRIMARY_TEXT }]}>
                        {breathingData.totalSessions > 0
                            ? formatDuration(Math.round(breathingData.totalDurationSec / breathingData.totalSessions), {
                                h: t("hours_short"),
                                m: t("minutes_short"),
                                s: t("seconds_short")
                            })
                            : "—"}
                    </StyledText>
                    <StyledText style={[statsStyles.summaryLabel, { color: colors.PLACEHOLDER }]}>{t("stats_average")}</StyledText>
                </View>
            </View>
        </View>
    );
}
