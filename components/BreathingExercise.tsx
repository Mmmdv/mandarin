import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import StyledText from './StyledText';

// Sound Assets (Using the local files you uploaded)
const SOUNDS = {
    whoosh: require('../assets/sounds/whoosh.mp3'),
    sea: require('../assets/sounds/sea.mp3'),
};

// Sand/Cream Color Palette
const COLORS_THEME = {
    primary: '#D2B48C', // Tan/Sand
    accent: '#F5F5DC',  // Beige/Cream
    text: '#FDF5E6',    // OldLace (off-white)
    textMuted: 'rgba(253, 245, 230, 0.6)',
    backgroundLight: 'rgba(210, 180, 140, 0.1)',
    backgroundMedium: 'rgba(210, 180, 140, 0.2)',
};

const PHASE_DURATIONS = {
    inhale: 4,
    hold: 2,
    exhale: 6,
};

const MOTIVATIONAL_MESSAGES = [
    "Sadəcə nəfəsinə fokuslan",
    "Hər şeyi kənara qoy",
    "Dərindən nəfəs al",
    "Rahatla və boşal",
    "Zehnini sakitləşdir",
    "Hər nəfəsdə daha da rahatla",
    "Anı hiss et",
];

type Phase = 'inhale' | 'exhale' | 'hold';

export default function BreathingExercise() {
    const { colors, t } = useTheme();
    const { width: screenWidth } = useWindowDimensions();
    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(60); // Default to 1 min
    const [timeLeft, setTimeLeft] = useState(selectedDuration);
    const [phaseTimeLeft, setPhaseTimeLeft] = useState(PHASE_DURATIONS.inhale);
    const [phase, setPhase] = useState<Phase>('inhale');
    const [message, setMessage] = useState(MOTIVATIONAL_MESSAGES[0]);

    // Sound settings
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);
    const [isSeaEnabled, setIsSeaEnabled] = useState(false);

    const whooshRef = useRef<any>(null);
    const seaRef = useRef<any>(null);

    // Load sounds on mount
    useEffect(() => {
        const loadSounds = async () => {
            try {
                // Load local assets
                const { sound: whooshSound } = await (ExpoAudio.Sound as any).createAsync(
                    SOUNDS.whoosh,
                    { volume: 0.6 } // Whoosh üçün bir az daha yüksək səs
                );
                whooshRef.current = whooshSound;

                const { sound: seaSound } = await (ExpoAudio.Sound as any).createAsync(
                    SOUNDS.sea,
                    { isLooping: true, volume: 0.8 } // Dəniz səsi artırıldı (80%)
                );
                seaRef.current = seaSound;
                console.log("Sounds loaded successfully from local assets");
            } catch (error) {
                console.log("Error loading sounds:", error);
            }
        };

        loadSounds();

        return () => {
            if (whooshRef.current) whooshRef.current.unloadAsync();
            if (seaRef.current) seaRef.current.unloadAsync();
        };
    }, []);

    // Handle background sea waves
    useEffect(() => {
        const handleSeaSound = async () => {
            if (!seaRef.current) return;

            if (isSeaEnabled && isActive) {
                await seaRef.current.playAsync();
            } else {
                await seaRef.current.pauseAsync();
            }
        };
        handleSeaSound();
    }, [isSeaEnabled, isActive]);

    // Play whoosh only on exhale
    useEffect(() => {
        const playWhoosh = async () => {
            if (isActive && isSoundEnabled && phase === 'exhale' && whooshRef.current) {
                try {
                    // Position'ı başa çək və çal
                    await whooshRef.current.setPositionAsync(0);
                    await whooshRef.current.playAsync();
                    console.log("Whoosh playing...");
                } catch (error) {
                    console.log("Error playing whoosh:", error);
                }
            } else if (phase !== 'exhale' && whooshRef.current) {
                // Digər fazalarda səsi dayandır
                await whooshRef.current.stopAsync();
            }
        };
        playWhoosh();
    }, [phase, isSoundEnabled, isActive]);

    // Responsive sizes
    const containerWidth = screenWidth - 40;
    const animationSize = Math.min(screenWidth * 0.6, 250);
    const circleSize = animationSize * 0.5;

    const animatedScale = useRef(new Animated.Value(1)).current;
    const animatedOpacity = useRef(new Animated.Value(0.3)).current;
    const textOpacity = useRef(new Animated.Value(1)).current;
    const messageOpacity = useRef(new Animated.Value(1)).current;
    const completionAnim = useRef(new Animated.Value(0)).current;

    // Timer for the whole exercise and phases
    useEffect(() => {
        let interval: any;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev: number) => prev - 1);
                setPhaseTimeLeft((prev: number) => {
                    if (prev <= 1) {
                        // Start fading out text just before phase switch
                        triggerTextTransition();

                        setPhase((currentPhase) => {
                            let nextPhase: Phase;
                            if (currentPhase === 'inhale') nextPhase = 'hold';
                            else if (currentPhase === 'hold') nextPhase = 'exhale';
                            else nextPhase = 'inhale';

                            // Change message on phase change
                            const randomMsg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
                            setMessage(randomMsg);

                            return nextPhase;
                        });
                        return 0; // Wait for the next useEffect to set the duration
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, selectedDuration]);

    const triggerTextTransition = () => {
        // Smooth cross-fade for instructions and motivational messages
        Animated.sequence([
            Animated.timing(textOpacity, { toValue: 0.3, duration: 200, useNativeDriver: true }),
            Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        Animated.sequence([
            Animated.timing(messageOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(messageOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
    };

    // Handle phase duration changes when phase changes
    useEffect(() => {
        if (isActive && phaseTimeLeft === 0) {
            setPhaseTimeLeft(PHASE_DURATIONS[phase]);
        }
    }, [phase, isActive]);

    const handleComplete = () => {
        setIsActive(false);
        setIsCompleted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Completion animation
        Animated.timing(completionAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    };

    // Update timeLeft when selectedDuration changes (if not active)
    useEffect(() => {
        if (!isActive && !isCompleted) {
            setTimeLeft(selectedDuration);
        }
    }, [selectedDuration, isActive, isCompleted]);

    // Handle animations based on phase
    useEffect(() => {
        if (!isActive) {
            Animated.spring(animatedScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 1,
                bounciness: 2,
            }).start();
            Animated.timing(animatedOpacity, {
                toValue: 0.3,
                duration: 500,
                useNativeDriver: true,
            }).start();
            return;
        }

        const duration = PHASE_DURATIONS[phase] * 1000;
        const smoothEasing = Easing.bezier(0.4, 0, 0.2, 1);

        if (phase === 'inhale') {
            Animated.parallel([
                Animated.timing(animatedScale, {
                    toValue: 1.6,
                    duration: duration,
                    easing: smoothEasing,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedOpacity, {
                    toValue: 0.9,
                    duration: duration,
                    useNativeDriver: true,
                })
            ]).start();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (phase === 'exhale') {
            Animated.parallel([
                Animated.timing(animatedScale, {
                    toValue: 1,
                    duration: duration,
                    easing: smoothEasing,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedOpacity, {
                    toValue: 0.4,
                    duration: duration,
                    useNativeDriver: true,
                })
            ]).start();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
            // Hold phase - subtle pulse to keep it feeling alive
            Animated.sequence([
                Animated.timing(animatedScale, { toValue: 1.55, duration: duration / 2, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(animatedScale, { toValue: 1.6, duration: duration / 2, easing: Easing.linear, useNativeDriver: true }),
            ]).start();
            Haptics.selectionAsync();
        }
    }, [phase, isActive]);

    const handleStart = () => {
        setIsCompleted(false);
        setIsActive(true);
        setTimeLeft(selectedDuration);
        setPhaseTimeLeft(PHASE_DURATIONS.inhale);
        setPhase('inhale');
        setMessage(MOTIVATIONAL_MESSAGES[0]);
        completionAnim.setValue(0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handleStop = () => {
        setIsActive(false);
        setIsCompleted(false);
        setTimeLeft(selectedDuration);
        completionAnim.setValue(0);
        Haptics.selectionAsync();
    };

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return "Nəfəs al";
            case 'hold': return "Saxla";
            case 'exhale': return "Nəfəs ver";
            default: return "";
        }
    };

    const durations = [
        { label: '36 saniyə', value: 36 },
        { label: '1 dəqiqə', value: 60 },
        { label: '2 dəqiqə', value: 120 },
    ];

    if (isCompleted) {
        return (
            <View style={[styles.container, { width: containerWidth }]}>
                <Animated.View style={[styles.completionScreen, { opacity: completionAnim }]}>
                    <Ionicons name="sunny" size={80} color={COLORS_THEME.primary} style={{ marginBottom: 20 }} />
                    <StyledText style={styles.completionTitle}>Bir az daha yaxşıdır?</StyledText>
                    <StyledText style={styles.completionSubTitle}>Davam etməyə hazırsan</StyledText>

                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: COLORS_THEME.primary, marginTop: 40 }]}
                        onPress={handleStop}
                    >
                        <Ionicons name="refresh" size={24} color="#FFF" />
                        <StyledText style={styles.buttonText}>Yenidən</StyledText>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { width: containerWidth }]}>
            <View style={styles.topControls}>
                <TouchableOpacity
                    onPress={() => {
                        setIsSoundEnabled(!isSoundEnabled);
                        Haptics.selectionAsync();
                    }}
                    style={[styles.soundToggle, isSoundEnabled && styles.toggleActive]}
                >
                    <Ionicons
                        name={isSoundEnabled ? "volume-medium" : "volume-mute"}
                        size={22}
                        color={isSoundEnabled ? COLORS_THEME.primary : COLORS_THEME.textMuted}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        setIsSeaEnabled(!isSeaEnabled);
                        Haptics.selectionAsync();
                    }}
                    style={[styles.soundToggle, isSeaEnabled && styles.toggleActive]}
                >
                    <Ionicons
                        name="water"
                        size={22}
                        color={isSeaEnabled ? COLORS_THEME.primary : COLORS_THEME.textMuted}
                    />
                </TouchableOpacity>
            </View>

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
                                selectedDuration === d.value && { backgroundColor: COLORS_THEME.primary }
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
                        borderColor: COLORS_THEME.primary,
                        transform: [{ scale: animatedScale }],
                        opacity: animatedOpacity
                    }
                ]} />
                <View style={styles.phaseTextWrapper}>
                    <Animated.View style={{ opacity: textOpacity }}>
                        <StyledText style={[styles.phaseText, { fontSize: animationSize * 0.1, color: COLORS_THEME.text }]}>
                            {isActive ? getPhaseText() : "Hazırsan?"}
                        </StyledText>
                    </Animated.View>
                    {isActive && (
                        <Animated.View style={{ opacity: messageOpacity }}>
                            <StyledText style={[styles.motivationMessage, { fontSize: animationSize * 0.05 }]}>
                                {message}
                            </StyledText>
                        </Animated.View>
                    )}
                </View>
            </View>

            {!isActive ? (
                <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: COLORS_THEME.primary }]}
                    onPress={handleStart}
                >
                    <Ionicons name="play" size={24} color="#FFF" />
                    <StyledText style={styles.buttonText}>Başla</StyledText>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={[styles.stopButton, { borderColor: COLORS_THEME.primary }]}
                    onPress={handleStop}
                >
                    <Ionicons name="stop" size={24} color={COLORS_THEME.primary} />
                    <StyledText style={[styles.buttonText, { color: COLORS_THEME.primary }]}>Dayandır</StyledText>
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
        color: COLORS_THEME.text,
    },
    durationSelector: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
        backgroundColor: COLORS_THEME.backgroundLight,
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
        color: COLORS_THEME.textMuted,
        fontSize: 12,
    },
    phaseTime: {
        fontSize: 18,
        color: COLORS_THEME.textMuted,
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
    completionScreen: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    completionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS_THEME.text,
        textAlign: 'center',
        marginBottom: 10,
    },
    completionSubTitle: {
        fontSize: 16,
        color: COLORS_THEME.textMuted,
        textAlign: 'center',
    },
    motivationMessage: {
        color: COLORS_THEME.textMuted,
        textAlign: 'center',
        marginTop: 5,
        fontWeight: '400',
    },
    topControls: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
        width: '100%',
        justifyContent: 'flex-end',
        paddingHorizontal: 10,
    },
    soundToggle: {
        backgroundColor: 'rgba(210, 180, 140, 0.15)',
        padding: 10,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: 'rgba(210, 180, 140, 0.1)',
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleActive: {
        backgroundColor: 'rgba(210, 180, 140, 0.25)',
        borderColor: COLORS_THEME.primary,
        shadowColor: COLORS_THEME.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
});
