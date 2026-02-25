import StyledText from "@/components/ui/StyledText";
import { View } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { statsStyles } from './styles';

interface BirthdayStatsProps {
    birthdayData: {
        greeted: number;
        missed: number;
        total: number;
    } | null;
    colors: any;
    isDark: boolean;
    t: (key: any) => string;
}

export function BirthdayStats({ birthdayData, colors, isDark, t }: BirthdayStatsProps) {
    if (!birthdayData) return null;

    const completionRate = birthdayData.total > 0
        ? Math.round((birthdayData.greeted / birthdayData.total) * 100)
        : 0;

    return (
        <View style={[statsStyles.section, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
            <SectionHeader icon="gift-outline" iconBg={isDark ? '#3d0c24CC' : '#fce7f3CC'} iconColor="#ec4899CC" title={t("stats_birthday_title")} colors={colors} accentColor="#ec4899CC" />

            <View style={statsStyles.completionRow}>
                <View style={[statsStyles.completionCircle, { borderColor: completionRate >= 70 ? '#10b981CC' : completionRate >= 40 ? '#f59e0bCC' : (birthdayData.total > 0 ? '#ef4444CC' : colors.PLACEHOLDER) }]}>
                    <StyledText style={[statsStyles.completionPercent, { color: colors.PRIMARY_TEXT }]}>{birthdayData.total > 0 ? `${completionRate}%` : "—"}</StyledText>
                    <StyledText style={[statsStyles.completionLabel, { color: colors.PLACEHOLDER }]}>{t("stats_birthday_rate")}</StyledText>
                </View>
                <View style={[statsStyles.completionDetails, { justifyContent: 'center' }]}>
                    {[
                        { color: '#ec4899CC', label: t("stats_birthday_greeted"), val: birthdayData.greeted },
                        { color: '#ef4444CC', label: t("stats_birthday_missed"), val: birthdayData.missed },
                    ].map(item => (
                        <View key={item.label} style={statsStyles.completionDetailRow}>
                            <View style={[statsStyles.detailDot, { backgroundColor: item.color }]} />
                            <StyledText style={[statsStyles.detailLabel, { color: colors.PLACEHOLDER }]}>{item.label}</StyledText>
                            <StyledText style={[statsStyles.detailValue, { color: colors.PRIMARY_TEXT }]}>{item.val}</StyledText>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
