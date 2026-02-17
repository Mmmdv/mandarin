import { styles as homeStyles } from '@/constants/homeStyles';
import { useTheme } from '@/hooks/useTheme';
import { resetMood, selectDayData, setMood } from '@/store/slices/todaySlice';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import StyledText from '../StyledText';

const MOODS = [
    { id: 1, icon: 'battery-dead', label: 'mood_very_bad', color: '#475569', haptic: Haptics.NotificationFeedbackType.Error },
    { id: 2, icon: 'flash-off', label: 'mood_bad', color: '#64748B', haptic: Haptics.ImpactFeedbackStyle.Medium },
    { id: 3, icon: 'leaf', label: 'mood_good', color: '#10B981', haptic: Haptics.ImpactFeedbackStyle.Light },
    { id: 4, icon: 'flash', label: 'mood_very_good', color: '#F59E0B', haptic: Haptics.NotificationFeedbackType.Success },
    { id: 5, icon: 'flame', label: 'mood_excellent', color: '#EF4444', haptic: Haptics.NotificationFeedbackType.Success },
];

export default function MoodTracker() {
    const { colors, t } = useTheme();
    const dispatch = useDispatch();
    const today = new Date().toISOString().split('T')[0];
    const dayData: any = useSelector(selectDayData(today));
    const selectedMoodId = dayData?.mood;
    const selectedMoodDisplay = MOODS.find(m => m.id === selectedMoodId);

    // Get a deterministic random question based on logic (date)
    const questionCount = 7;
    const dateSeed = today.split('-').reduce((acc, part) => acc + parseInt(part), 0);
    const questionKey = `mood_q${(dateSeed % questionCount) + 1}` as any;

    const fadeAnim = useRef(new Animated.Value(0.4)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (selectedMoodId) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 0.4,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [selectedMoodId]);

    const triggerHaptics = async (moodId: number) => {
        const mood = MOODS.find(m => m.id === moodId);
        if (!mood) return;

        try {
            if (mood.id === 1) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } else if (mood.id === 5 || mood.id === 4) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                await Haptics.impactAsync(mood.haptic as any);
            }
        } catch (e) { }
    };

    const handleSelect = (moodId: number) => {
        if (!selectedMoodId) {
            dispatch(setMood({ date: today, mood: moodId }));
            triggerHaptics(moodId);

            scaleAnim.setValue(0.8);
            if (moodId <= 2) {
                Animated.sequence([
                    Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                    Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
                ]).start();
            }

            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true
            }).start();
        }
    };

    const handleReset = () => {
        dispatch(resetMood({ date: today }));
        fadeAnim.setValue(0.4);
        scaleAnim.setValue(1);
        shakeAnim.setValue(0);
    };

    const getFeedback = () => {
        if (!selectedMoodId) return '';
        if (selectedMoodId <= 2) return t('mood_feedback_negative');
        if (selectedMoodId === 3) return t('mood_feedback_neutral');
        return t('mood_feedback_positive');
    };

    const currentThemeColor = selectedMoodDisplay?.color || '#6366F1';

    return (
        <View style={[homeStyles.card, { backgroundColor: 'rgba(100, 116, 139, 0.15)', borderWidth: 0.3, borderColor: 'rgba(100, 116, 139, 0.3)', borderRadius: 20, paddingVertical: 13, paddingLeft: 10, paddingRight: 20, marginTop: 6, marginBottom: 5, minHeight: isExpanded ? 140 : undefined }]}>
            <Pressable
                onPress={() => setIsExpanded(!isExpanded)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: isExpanded ? 8 : 0, zIndex: 10 }}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${currentThemeColor}55` }]}>
                    <Ionicons name={selectedMoodDisplay ? (selectedMoodDisplay.icon as any) : "pulse"} size={17} color={colors.SECTION_TEXT} />
                </View>
                <StyledText style={[homeStyles.cardTitle, { color: colors.SECTION_TEXT, fontSize: 14, flex: 1, marginBottom: 0 }]}>
                    {t(questionKey)}
                </StyledText>
                <View style={{ width: 24, alignItems: 'flex-end', justifyContent: 'center', marginLeft: 'auto' }}>
                    <Ionicons name={isExpanded ? "chevron-down" : "chevron-forward"} size={14} color={colors.SECTION_TEXT} />
                </View>
            </Pressable>

            {isExpanded && (
                <>
                    {selectedMoodId ? (
                        <Animated.View style={[
                            styles.votedContainer,
                            {
                                transform: [
                                    { scale: scaleAnim },
                                    { translateX: shakeAnim }
                                ]
                            }
                        ]}>
                            <Animated.View style={[styles.waitingContainer, { opacity: fadeAnim }]}>
                                <View style={styles.loadingRow}>
                                    <Ionicons name="people-outline" size={16} color={colors.PLACEHOLDER} style={{ marginRight: 6 }} />
                                    <StyledText style={[styles.waitingTitle, { color: colors.PLACEHOLDER }]}>
                                        {t('mood_voted')}
                                    </StyledText>
                                </View>
                                <View style={styles.clockRow}>
                                    <Ionicons name="time-outline" size={12} color={colors.PLACEHOLDER} style={{ marginRight: 4, opacity: 0.7 }} />
                                    <StyledText style={[styles.unlockText, { color: colors.PLACEHOLDER, opacity: 0.7 }]}>
                                        {t('mood_unlock_time')}
                                    </StyledText>
                                </View>
                            </Animated.View>

                            <TouchableOpacity
                                onPress={handleReset}
                                style={styles.resetButton}
                            >
                                <StyledText style={{ color: colors.PLACEHOLDER, fontSize: 10, textDecorationLine: 'underline' }}>
                                    {t('test_reset')}
                                </StyledText>
                            </TouchableOpacity>
                        </Animated.View>
                    ) : (
                        <View style={styles.moodsRow}>
                            {MOODS.map((mood) => (
                                <Pressable
                                    key={mood.id}
                                    onPress={() => handleSelect(mood.id)}
                                    style={({ pressed }) => [
                                        styles.moodButton,
                                        {
                                            opacity: pressed ? 0.7 : 1,
                                            transform: [{ scale: pressed ? 0.9 : 1 }]
                                        }
                                    ]}
                                >
                                    <Ionicons name={mood.icon as any} size={32} color={mood.color} />
                                    <StyledText style={[styles.moodLabel, { color: colors.PLACEHOLDER }]}>
                                        {t(mood.label as any)}
                                    </StyledText>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </>
            )}
            <View
                style={[homeStyles.decorativeCircle, { backgroundColor: `${currentThemeColor}3A`, width: 80, height: 80, borderRadius: 40 }]}
                pointerEvents="none"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    moodsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    moodButton: {
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    moodLabel: {
        fontSize: 10,
        textAlign: 'center',
    },
    votedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    waitingContainer: {
        marginTop: 5,
        alignItems: 'center',
        width: '100%',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(212, 209, 209, 0.1)',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    waitingTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    unlockText: {
        fontSize: 12,
    },
    clockRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resetButton: {
        marginTop: 5,
        padding: 5,
    },
    iconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
