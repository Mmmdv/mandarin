import StyledText from '@/components/ui/StyledText';
import { toggleAnimation } from '@/constants/animations';
import { styles as homeStyles } from '@/constants/homeStyles';
import { useTheme } from '@/hooks/useTheme';
import { resetMood, selectDayData, setMood } from '@/store/slices/todaySlice';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { styles } from './styles';

const MOODS = [
    { id: 1, icon: 'battery-dead', label: 'mood_very_bad', color: '#475569', haptic: Haptics.NotificationFeedbackType.Error },
    { id: 2, icon: 'flash-off', label: 'mood_bad', color: '#64748B', haptic: Haptics.ImpactFeedbackStyle.Medium },
    { id: 3, icon: 'leaf', label: 'mood_good', color: '#10B981', haptic: Haptics.ImpactFeedbackStyle.Light },
    { id: 4, icon: 'flash', label: 'mood_very_good', color: '#F59E0B', haptic: Haptics.NotificationFeedbackType.Success },
    { id: 5, icon: 'flame', label: 'mood_excellent', color: '#EF4444', haptic: Haptics.NotificationFeedbackType.Success },
];

export default function MoodTracker() {
    const { colors, t, isDark } = useTheme();
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

    const [isExpanded, setIsExpanded] = useState(true);
    const expandAnim = useRef(new Animated.Value(1)).current;

    const toggleExpanded = () => {
        setIsExpanded(prev => {
            const newValue = !prev;
            Animated.timing(expandAnim, {
                toValue: newValue ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
            LayoutAnimation.configureNext(toggleAnimation);
            return newValue;
        });
    };

    const getRotation = () => expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg']
    });

    const getCircleTransform = () => ({
        transform: [
            { translateX: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
            { translateY: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
            { scale: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }
        ],
        opacity: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] })
    });

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

    const currentThemeColor = selectedMoodDisplay?.color || '#6366F1';

    return (
        <View style={{ marginBottom: 2.5, marginTop: 3 }}>
            <Pressable
                onPress={toggleExpanded}
                style={{
                    ...homeStyles.card,
                    backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 0.3,
                    borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.15)',
                    borderRadius: 20,
                    paddingVertical: 13,
                    paddingHorizontal: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    overflow: 'hidden',
                    marginBottom: 0,
                    marginTop: 0,
                    marginLeft: 0,
                    marginRight: 0,
                    width: '100%'
                }}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${currentThemeColor}${isDark ? '55' : '33'}`, zIndex: 2 }]}>
                    <Ionicons name={selectedMoodDisplay ? (selectedMoodDisplay.icon as any) : "pulse"} size={17} color={isDark ? colors.SECTION_TEXT : colors.PRIMARY_TEXT} />
                </View>
                <StyledText style={[homeStyles.cardTitle, { color: colors.SECTION_TEXT, fontSize: 14, flex: 1, marginBottom: 0, zIndex: 2 }]}>
                    {t(questionKey)}
                </StyledText>
                <View style={{ width: 24, alignItems: 'flex-end', justifyContent: 'center', zIndex: 2 }}>
                    <Animated.View style={{ transform: [{ rotate: getRotation() }] }}>
                        <Ionicons name="chevron-forward" size={14} color={colors.SECTION_TEXT} />
                    </Animated.View>
                </View>
                <Animated.View
                    style={[
                        homeStyles.decorativeCircle,
                        {
                            backgroundColor: `${currentThemeColor}3A`,
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            bottom: -20,
                            right: -20
                        },
                        getCircleTransform()
                    ]}
                    pointerEvents="none"
                />
            </Pressable>

            {isExpanded && (
                <View style={{
                    marginTop: 10,
                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                    borderWidth: 0.3,
                    borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.15)',
                    borderRadius: 20,
                    padding: 20,
                    minHeight: 100,
                    justifyContent: 'center'
                }}>
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
                </View>
            )}

            {isExpanded && (
                <View style={homeStyles.separatorContainer}>
                    <View style={homeStyles.separatorLine} />
                </View>
            )}
        </View>
    );
}
