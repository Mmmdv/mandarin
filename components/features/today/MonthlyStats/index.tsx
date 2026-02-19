import StyledText from '@/components/ui/StyledText';
import { styles as homeStyles } from '@/constants/homeStyles';
import { useTheme } from '@/hooks/useTheme';
import { selectTodayData } from '@/store/slices/todaySlice';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { styles } from './styles';

export default function MonthlyStats() {
    const { colors, t } = useTheme();
    const todayData: any = useSelector(selectTodayData);
    const daily = todayData.daily || {};

    // Simple logic for current month stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthData = Object.entries(daily).filter(([date]) => {
        const d = new Date(date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const moodEntries = monthData.filter(([_, d]: any) => d.mood);
    const avgMood = moodEntries.length > 0
        ? (moodEntries.reduce((acc, [_, data]: any) => acc + (data.mood || 0), 0) / moodEntries.length).toFixed(1)
        : '-';

    const ratingEntries = monthData.filter(([_, d]: any) => d.rating);
    const avgRating = ratingEntries.length > 0
        ? (ratingEntries.reduce((acc, [_, data]: any) => acc + (data.rating || 0), 0) / ratingEntries.length).toFixed(1)
        : '-';

    return (
        <View style={[homeStyles.card, { backgroundColor: colors.SECONDARY_BACKGROUND, padding: 16 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={[homeStyles.iconContainer, { backgroundColor: '#8B5CF6', marginRight: 10, width: 32, height: 32 }]}>
                    <Ionicons name="stats-chart" size={18} color="#FFF" />
                </View>
                <StyledText style={[homeStyles.cardTitle, { color: colors.PRIMARY_TEXT }]}>
                    {t('monthly_stats')}
                </StyledText>
            </View>

            <View style={styles.statsRow}>
                <View style={[styles.statItem, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                    <StyledText style={{ color: colors.PLACEHOLDER, fontSize: 10, textAlign: 'center' }}>{t('avg_mood')}</StyledText>
                    <StyledText style={{ color: colors.PRIMARY_TEXT, fontSize: 18, fontWeight: 'bold' }}>{avgMood}</StyledText>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                    <StyledText style={{ color: colors.PLACEHOLDER, fontSize: 10, textAlign: 'center' }}>{t('avg_rating')}</StyledText>
                    <StyledText style={{ color: colors.PRIMARY_TEXT, fontSize: 18, fontWeight: 'bold' }}>{avgRating}/10</StyledText>
                </View>
                <View style={[styles.statItem, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                    <StyledText style={{ color: colors.PLACEHOLDER, fontSize: 10, textAlign: 'center' }}>{t('days_tracked')}</StyledText>
                    <StyledText style={{ color: colors.PRIMARY_TEXT, fontSize: 18, fontWeight: 'bold' }}>{monthData.length}</StyledText>
                </View>
            </View>
        </View>
    );
}
