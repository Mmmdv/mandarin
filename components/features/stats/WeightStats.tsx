import StyledText from "@/components/ui/StyledText";
import React from 'react';
import { Dimensions, View } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { SectionHeader } from './SectionHeader';
import { StatCard } from './StatCard';
import { statsStyles } from './styles';

interface WeightStatsProps {
    weightMetrics: {
        avg: string;
        max: string;
        min: string;
    } | null;
    weightChartData: any;
    colors: any;
    isDark: boolean;
    t: (key: any) => string;
}

export function WeightStats({ weightMetrics, weightChartData, colors, isDark, t }: WeightStatsProps) {
    return (
        <View style={[statsStyles.section, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
            <SectionHeader icon="barbell" iconColor="#10b981CC" iconBg={isDark ? '#0d3320CC' : '#ecfdf5CC'} title={t("stats_weight_title")} colors={colors} accentColor="#10b981CC" />
            {weightMetrics ? (
                <View style={{ gap: 16 }}>
                    {weightChartData && (
                        <View style={statsStyles.chartContainer}>
                            <LineChart
                                data={weightChartData}
                                width={Dimensions.get("window").width - 80}
                                height={180}
                                chartConfig={{
                                    backgroundColor: colors.SECONDARY_BACKGROUND,
                                    backgroundGradientFrom: colors.SECONDARY_BACKGROUND,
                                    backgroundGradientTo: colors.SECONDARY_BACKGROUND,
                                    decimalPlaces: 1,
                                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                    labelColor: (opacity = 1) => colors.PLACEHOLDER,
                                    style: { borderRadius: 16 },
                                    propsForDots: { r: "5", strokeWidth: "2", stroke: "#3b82f6" },
                                    propsForBackgroundLines: {
                                        strokeDasharray: "",
                                        strokeWidth: 0.5,
                                        stroke: (colors.PLACEHOLDER.slice(0, 7)) + '12'
                                    }
                                }}
                                bezier
                                style={{ marginVertical: 8, borderRadius: 16 }}
                                withInnerLines={true}
                                withOuterLines={false}
                                withVerticalLabels={true}
                                withHorizontalLabels={true}
                            />
                        </View>
                    )}
                    <View style={statsStyles.statsGrid}>
                        <StatCard icon="analytics-outline" iconColor="#10b981CC" iconBg={isDark ? '#1a2e1aCC' : '#fffCC'} label={t("stats_avg")} value={weightMetrics.avg} delay={100} colors={colors} />
                        <StatCard icon="trending-up" iconColor="#ef4444CC" iconBg={isDark ? '#2e1a1aCC' : '#fee2e2CC'} label={t("stats_max")} value={weightMetrics.max} delay={200} colors={colors} />
                        <StatCard icon="trending-down" iconColor="#10b981CC" iconBg={isDark ? '#1a2e1aCC' : '#d1fae5CC'} label={t("stats_min")} value={weightMetrics.min} delay={300} colors={colors} />
                    </View>
                </View>
            ) : (
                <StyledText style={statsStyles.emptyText}>{t("stats_no_data")}</StyledText>
            )}
        </View>
    );
}
