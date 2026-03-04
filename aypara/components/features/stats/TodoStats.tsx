import StyledText from "@/components/ui/StyledText";
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { View } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { statsStyles } from './styles';
import { formatMs } from './utils';

interface TodoStatsProps {
    todoData: {
        created: number;
        completed: number;
        deleted: number;
        archived: number;
        completionTimeMs: number;
    };
    colors: any;
    isDark: boolean;
    t: (key: any) => string;
}

export function TodoStats({ todoData, colors, isDark, t }: TodoStatsProps) {
    const effectiveTasks = todoData.created - todoData.deleted;
    const completionRate = effectiveTasks > 0
        ? Math.round((todoData.completed / effectiveTasks) * 100)
        : 0;

    return (
        <View style={[statsStyles.section, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
            <SectionHeader icon="trophy-outline" iconBg={isDark ? '#0c1f3dCC' : '#dbeafeCC'} iconColor="#3b82f6CC" title={t("stats_todo_title")} colors={colors} accentColor="#3b82f6CC" />
            <View style={statsStyles.completionRow}>
                <View style={[statsStyles.completionCircle, { borderColor: completionRate >= 70 ? '#10b981CC' : completionRate >= 40 ? '#3b82f6CC' : (effectiveTasks > 0 ? '#ef4444CC' : colors.PLACEHOLDER) }]}>
                    <StyledText style={[statsStyles.completionPercent, { color: colors.PRIMARY_TEXT }]}>{effectiveTasks > 0 ? `${completionRate}%` : "—"}</StyledText>
                    <StyledText style={[statsStyles.completionLabel, { color: colors.PLACEHOLDER }]}>{t("stats_completion_rate")}</StyledText>
                </View>
                <View style={statsStyles.completionDetails}>
                    {[
                        { color: '#3b82f6CC', label: t("created"), val: todoData.created },
                        { color: '#10b981CC', label: t("completed"), val: todoData.completed },
                        { color: '#8b5cf6CC', label: t("stats_archived"), val: todoData.archived },
                        { color: '#ef4444CC', label: t("stats_deleted"), val: todoData.deleted },
                    ].map(item => (
                        <View key={item.label} style={statsStyles.completionDetailRow}>
                            <View style={[statsStyles.detailDot, { backgroundColor: item.color }]} />
                            <StyledText style={[statsStyles.detailLabel, { color: colors.PLACEHOLDER }]}>{item.label}</StyledText>
                            <StyledText style={[statsStyles.detailValue, { color: colors.PRIMARY_TEXT }]}>{item.val}</StyledText>
                        </View>
                    ))}
                </View>
            </View>
            <View style={[statsStyles.avgTimeCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
                <Ionicons name="timer-outline" size={20} color="#6366f1CC" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <StyledText style={[statsStyles.avgTimeLabel, { color: colors.PLACEHOLDER }]}>{t("stats_avg_completion_time")}</StyledText>
                    <StyledText style={[statsStyles.avgTimeValue, { color: colors.PRIMARY_TEXT }]}>
                        {formatMs(todoData.completionTimeMs, todoData.completed, {
                            d: t("days_short"),
                            h: t("hours_short"),
                            m: t("minutes_short")
                        })}
                    </StyledText>
                </View>
            </View>
        </View>
    );
}
