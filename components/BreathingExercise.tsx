import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import StyledText from './StyledText';

const PHASE_DURATION = 7; // 7 seconds per phase

type Phase = 'inhale' | 'exhale' | 'hold';

export default function BreathingExercise() {
    const { colors, t } = useTheme();
    const { width: screenWidth } = useWindowDimensions();
    const [isActive, setIsActive] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(60); // Default to 1 min
    const [timeLeft, setTimeLeft] = useState(selectedDuration);
    const [phaseTimeLeft, setPhaseTimeLeft] = useState(PHASE_DURATION);
    const [phase, setPhase] = useState<Phase>('inhale');

    // Responsive sizes
    const containerWidth = screenWidth - 40;
    const animationSize = Math.min(screenWidth * 0.6, 250);
    const circleSize = animationSize * 0.5;

    const animatedScale = useRef(new Animated.Value(1)).current;
    const animatedOpacity = useRef(new Animated.Value(0.3)).current;

    // Timer for the whole exercise and phases
    useEffect(() => {
        let interval: any;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
                setPhaseTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Switch phase
                        setPhase((currentPhase) => {
                            if (currentPhase === 'inhale') return 'exhale';
                            if (currentPhase === 'exhale') return 'hold';
                            return 'inhale';
                        });
                        return PHASE_DURATION;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeLeft(selectedDuration); // Reset to selected
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, selectedDuration]);

    // Update timeLeft when selectedDuration changes (if not active)
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(selectedDuration);
        }
    }, [selectedDuration, isActive]);

    // Handle animations based on phase
    useEffect(() => {
        if (!isActive) {
            Animated.spring(animatedScale, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
            Animated.timing(animatedOpacity, {
                toValue: 0.3,
                duration: 500,
                useNativeDriver: true,
            }).start();
            return;
        }

        if (phase === 'inhale') {
            Animated.parallel([
                Animated.timing(animatedScale, {
                    toValue: 1.5,
                    duration: PHASE_DURATION * 1000,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(animatedOpacity, {
                    toValue: 0.8,
                    duration: PHASE_DURATION * 1000,
                    useNativeDriver: true,
                })
            ]).start();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (phase === 'exhale') {
            Animated.parallel([
                Animated.timing(animatedScale, {
                    toValue: 1,
                    duration: PHASE_DURATION * 1000,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(animatedOpacity, {
                    toValue: 0.4,
                    duration: PHASE_DURATION * 1000,
                    useNativeDriver: true,
                })
            ]).start();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
            // Hold phase
            Haptics.selectionAsync();
        }
    }, [phase, isActive]);

    const handleStart = () => {
        setIsActive(true);
        setTimeLeft(selectedDuration);
        setPhaseTimeLeft(PHASE_DURATION);
        setPhase('inhale');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handleStop = () => {
        setIsActive(false);
        setTimeLeft(selectedDuration);
        Haptics.selectionAsync();
    };

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return "Nəfəs al";
            case 'exhale': return "Nəfəs ver";
            case 'hold': return "Gözlə";
            default: return "";
        }
    };

    const durations = [
        { label: '30 saniyə', value: 30 },
        { label: '1 dəqiqə', value: 60 },
        { label: '2 dəqiqə', value: 120 },
    ];

    return (
        <View style={[styles.container, { width: containerWidth }]}>
            {!isActive && (
                <View style={styles.durationSelector}>
                    {durations.map((d) => (
                        <TouchableOpacity
                            key={d.value}
                            onPress={() => {
                                setSelectedDuration(d.value);
                                Haptics.selectionAsync();
                            }}
                            style={[
                                styles.durationButton,
                                selectedDuration === d.value && { backgroundColor: '#FF9F43' }
                            ]}
                        >
                            <StyledText style={[
                                styles.durationText,
                                selectedDuration === d.value && { color: '#FFF', fontWeight: 'bold' }
                            ]}>
                                {d.label.split(' ')[0]} {d.label.split(' ')[1].substring(0, 3)}
                            </StyledText>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={styles.timerContainer}>
                <StyledText style={styles.totalTime}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </StyledText>
                {isActive && (
                    <StyledText style={styles.phaseTime}>
                        {phaseTimeLeft}s
                    </StyledText>
                )}
            </View>

            <View style={[styles.animationWrapper, { width: animationSize, height: animationSize }]}>
                <Animated.View style={[
                    styles.breathingCircle,
                    {
                        width: circleSize,
                        height: circleSize,
                        borderRadius: circleSize / 2,
                        borderColor: '#FF9F43',
                        transform: [{ scale: animatedScale }],
                        opacity: animatedOpacity
                    }
                ]} />
                <View style={styles.phaseTextWrapper}>
                    <StyledText style={[styles.phaseText, { fontSize: animationSize * 0.1 }]}>
                        {isActive ? getPhaseText() : "Hazırsan?"}
                    </StyledText>
                </View>
            </View>

            {!isActive ? (
                <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: '#FF9F43' }]}
                    onPress={handleStart}
                >
                    <Ionicons name="play" size={24} color="#FFF" />
                    <StyledText style={styles.buttonText}>Başla</StyledText>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={[styles.stopButton, { borderColor: colors.ERROR_INPUT_TEXT || '#FF6B6B' }]}
                    onPress={handleStop}
                >
                    <Ionicons name="stop" size={24} color={colors.ERROR_INPUT_TEXT || '#FF6B6B'} />
                    <StyledText style={[styles.buttonText, { color: colors.ERROR_INPUT_TEXT || '#FF6B6B' }]}>Dayandır</StyledText>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        alignSelf: 'center',
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    totalTime: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
    },
    durationSelector: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 5,
        borderRadius: 20,
    },
    durationButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 15,
        minWidth: 70,
        alignItems: 'center',
    },
    durationText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
    },
    phaseTime: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 4,
    },
    animationWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 30,
    },
    breathingCircle: {
        borderWidth: 10,
        position: 'absolute',
    },
    phaseTextWrapper: {
        zIndex: 10,
    },
    phaseText: {
        fontWeight: '600',
        color: '#FFF',
        textAlign: 'center',
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
        gap: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    stopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 25,
        gap: 10,
        borderWidth: 2,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
