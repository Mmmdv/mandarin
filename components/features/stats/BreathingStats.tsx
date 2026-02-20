import React from 'react';
import { View } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { StatCard } from './StatCard';
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
            <View style={statsStyles.statsGrid}>
                <StatCard icon="play-circle-outline" iconColor="#c3a17aCC" iconBg={isDark ? '#2d2417CC' : '#f5ebe0CC'} label={t("stats_sessions")} value={breathingData.totalSessions} delay={100} colors={colors} />
                <StatCard icon="time-outline" iconColor="#3b82f6CC" iconBg={isDark ? '#0c1f3dCC' : '#dbeafeCC'} label={t("stats_total_time")} value={formatDuration(breathingData.totalDurationSec)} delay={200} colors={colors} />
                <StatCard icon="stopwatch-outline" iconColor="#8b5cf6CC" iconBg={isDark ? '#1e103dCC' : '#ede9feCC'} label={t("stats_average")} value={breathingData.totalSessions > 0 ? formatDuration(Math.round(breathingData.totalDurationSec / breathingData.totalSessions)) : "—"} delay={300} colors={colors} />
            </View>
        </View>
    );
}
