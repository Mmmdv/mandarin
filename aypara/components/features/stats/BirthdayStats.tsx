import StyledText from "@/components/ui/StyledText";
import { View } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { statsStyles } from './styles';

interface BirthdayStatsProps {
    birthdayData: {
        greeted: number;
        missed: number;
        upcoming: number;
        total: number;
    } | null;
    colors: any;
    isDark: boolean;
    t: (key: any) => string;
}

export function BirthdayStats({ birthdayData, colors, isDark, t }: BirthdayStatsProps) {
    if (!birthdayData) return null;

    const completionRate = birthdayData.total > 0
        ? Math.round((birthdayData.greeted / (birthdayData.total - birthdayData.upcoming || 1)) * 100)
        : 0;

    // Adjust completion rate to only consider birthdays that have already happened
    const passedBirthdays = birthdayData.total - birthdayData.upcoming;
    const effectiveRate = passedBirthdays > 0
        ? Math.round((birthdayData.greeted / passedBirthdays) * 100)
        : 0;

    return (
        <View style={[statsStyles.section, { backgroundColor: colors.SECONDARY_BACKGROUND, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderWidth: 1 }]}>
            <SectionHeader icon="gift-outline" iconBg={isDark ? '#3d0c24CC' : '#fce7f3CC'} iconColor="#ec4899CC" title={t("stats_birthday_title")} colors={colors} accentColor="#ec4899CC" />

            <View style={statsStyles.completionRow}>
                <View style={[statsStyles.completionCircle, { borderColor: effectiveRate >= 70 ? '#10b981CC' : effectiveRate >= 40 ? '#f59e0bCC' : (passedBirthdays > 0 ? '#ef4444CC' : colors.PLACEHOLDER) }]}>
                    <StyledText style={[statsStyles.completionPercent, { color: colors.PRIMARY_TEXT }]}>{passedBirthdays > 0 ? `${effectiveRate}%` : "—"}</StyledText>
                    <StyledText style={[statsStyles.completionLabel, { color: colors.PLACEHOLDER }]}>{t("stats_birthday_rate")}</StyledText>
                </View>
                <View style={[statsStyles.completionDetails, { justifyContent: 'center' }]}>
                    {[
                        { color: '#6366f1CC', label: t("stats_birthday_total"), val: birthdayData.total },
                        { color: '#ec4899CC', label: t("stats_birthday_greeted"), val: birthdayData.greeted },
                        { color: '#ef4444CC', label: t("stats_birthday_missed"), val: birthdayData.missed },
                        { color: '#f59e0bCC', label: t("stats_birthday_upcoming"), val: birthdayData.upcoming },
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
