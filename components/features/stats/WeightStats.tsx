import StyledText from "@/components/ui/StyledText";
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { Dimensions, View } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { SectionHeader } from './SectionHeader';
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
                                width={Dimensions.get("window").width - 50}
                                height={180}
                                chartConfig={{
                                    backgroundColor: colors.SECONDARY_BACKGROUND,
                                    backgroundGradientFrom: colors.SECONDARY_BACKGROUND,
                                    backgroundGradientTo: colors.SECONDARY_BACKGROUND,
                                    decimalPlaces: 1,
                                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                    labelColor: (opacity = 1) => colors.PLACEHOLDER,
                                    style: { borderRadius: 16 },
                                    propsForDots: { r: "2.5", strokeWidth: "1", stroke: "#3b82f6" },
                                    propsForBackgroundLines: {
                                        strokeDasharray: "",
                                        strokeWidth: 0.5,
                                        stroke: (colors.PLACEHOLDER.slice(0, 7)) + '12'
                                    },
                                    paddingRight: 32,
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
                    <View style={[statsStyles.summaryRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
                        <View style={statsStyles.summaryItem}>
                            <Ionicons name="analytics-outline" size={20} color="#10b981CC" />
                            <StyledText style={[statsStyles.summaryValue, { color: colors.PRIMARY_TEXT }]}>{weightMetrics.avg}</StyledText>
                            <StyledText style={[statsStyles.summaryLabel, { color: colors.PLACEHOLDER }]}>{t("stats_avg")}</StyledText>
                        </View>
                        <View style={{ width: 1, height: 28, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                        <View style={statsStyles.summaryItem}>
                            <Ionicons name="trending-up" size={20} color="#ef4444CC" />
                            <StyledText style={[statsStyles.summaryValue, { color: colors.PRIMARY_TEXT }]}>{weightMetrics.max}</StyledText>
                            <StyledText style={[statsStyles.summaryLabel, { color: colors.PLACEHOLDER }]}>{t("stats_max")}</StyledText>
                        </View>
                        <View style={{ width: 1, height: 28, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                        <View style={statsStyles.summaryItem}>
                            <Ionicons name="trending-down" size={20} color="#10b981CC" />
                            <StyledText style={[statsStyles.summaryValue, { color: colors.PRIMARY_TEXT }]}>{weightMetrics.min}</StyledText>
                            <StyledText style={[statsStyles.summaryLabel, { color: colors.PLACEHOLDER }]}>{t("stats_min")}</StyledText>
                        </View>
                    </View>
                </View>
            ) : (
                <StyledText style={statsStyles.emptyText}>{t("stats_no_data")}</StyledText>
            )}
        </View>
    );
}
