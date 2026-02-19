import TaskSuccessModal from '@/components/features/todo/modals/TaskSuccessModal';
import StyledText from "@/components/ui/StyledText";
import { schedulePushNotification } from '@/constants/notifications';
import { useTheme } from '@/hooks/useTheme';
import { setBreathingActive } from '@/store/slices/appSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { addTodo } from '@/store/slices/todoSlice';
import { Todo } from '@/types/todo';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS_THEME, PHASE_DURATIONS, Phase, SOUNDS, getMotivationalMessages } from './constants';
import { styles } from './styles';

export default function BreathingExercise() {
    const { colors, t } = useTheme();
    const dispatch = useDispatch();
    const { width: screenWidth } = useWindowDimensions();
    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(90); // Default to 1.5 min (54, 90, 180)
    const [timeLeft, setTimeLeft] = useState(selectedDuration);
    const [phaseTimeLeft, setPhaseTimeLeft] = useState(PHASE_DURATIONS.inhale);
    const [phase, setPhase] = useState<Phase>('inhale');
    const messages = getMotivationalMessages(t);
    const [message, setMessage] = useState(messages[0]);

    // Sound settings
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);
    const [isSeaEnabled, setIsSeaEnabled] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    const whooshRef = useRef<any>(null);
    const seaRef = useRef<any>(null);

    const handleStop = useCallback(() => {
        setIsActive(false);
        setIsCompleted(false);
        setCountdown(null);
        setTimeLeft(selectedDuration);
        completionAnim.setValue(0);
        dispatch(setBreathingActive(false));
        Haptics.selectionAsync();
    }, [selectedDuration, dispatch]);

    const handleComplete = useCallback(() => {
        setIsActive(false);
        setIsCompleted(true);
        dispatch(setBreathingActive(false));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Completion animation
        Animated.timing(completionAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [dispatch]);

    const [reminderScheduled, setReminderScheduled] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const handleStart = () => {
        setIsCompleted(false);
        setCountdown(3); // Start 3s countdown
        dispatch(setBreathingActive(true));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const scheduleBreathingReminder = async () => {
        try {
            if (reminderScheduled) return;

            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                const { status: newStatus } = await Notifications.requestPermissionsAsync();
                if (newStatus !== 'granted') return;
            }

            // Schedule for 24 hours from now
            const reminderDate = new Date();
            reminderDate.setDate(reminderDate.getDate() + 1);

            const displayTitle = t("breathing_reminder_title");
            const body = t("breathing_reminder_title");
            const categoryIcon = 'list';

            const notificationId = await schedulePushNotification(
                displayTitle,
                body,
                reminderDate,
                categoryIcon
            );

            // Create a task (Todo) for the reminder
            const newTodo: Todo = {
                id: Date.now().toString(),
                title: t("breathing_reminder_title"),
                isCompleted: false,
                isArchived: false,
                createdAt: new Date().toISOString(),
                reminder: reminderDate.toISOString(),
                notificationId: notificationId
            };

            dispatch(addTodo(newTodo));

            if (notificationId) {
                dispatch(addNotification({
                    id: notificationId,
                    title: displayTitle,
                    body: body,
                    date: reminderDate.toISOString(),
                    categoryIcon: categoryIcon,
                }));
            }

            setReminderScheduled(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.log("Error scheduling breathing reminder:", error);
        }
    };

    // Load sounds on mount
    useEffect(() => {
        const loadSounds = async () => {
            try {
                // Load local assets
                const { sound: whooshSound } = await (ExpoAudio.Sound as any).createAsync(
                    SOUNDS.whoosh,
                    { volume: 0.9, rate: 0.9, shouldCorrectPitch: true }
                );
                whooshRef.current = whooshSound;

                const { sound: seaSound } = await (ExpoAudio.Sound as any).createAsync(
                    SOUNDS.sea,
                    { isLooping: true, volume: 0.6 }
                );
                seaRef.current = seaSound;
                setIsLoaded(true);
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
            if (!isLoaded || !seaRef.current) return;

            try {
                const status = await seaRef.current.getStatusAsync();
                if (!status.isLoaded) return;

                if (isSeaEnabled && isActive) {
                    await seaRef.current.playAsync();
                } else {
                    await seaRef.current.pauseAsync();
                }
            } catch (error) {
                console.log("Error handling sea sound:", error);
            }
        };
        handleSeaSound();
    }, [isSeaEnabled, isActive, isLoaded]);

    // Play whoosh only on exhale
    useEffect(() => {
        const playWhoosh = async () => {
            if (!isLoaded || !whooshRef.current) return;

            try {
                const status = await whooshRef.current.getStatusAsync();
                if (!status.isLoaded) return;

                if (isActive && isSoundEnabled && phase === 'exhale') {
                    await whooshRef.current.setPositionAsync(0);
                    await whooshRef.current.playAsync();
                } else if (phase !== 'exhale') {
                    await whooshRef.current.stopAsync();
                }
            } catch (error) {
                console.log("Error playing whoosh:", error);
            }
        };
        playWhoosh();
    }, [phase, isSoundEnabled, isActive, isLoaded]);

    // Responsive sizes
    const containerWidth = screenWidth - 40;
    const animationSize = Math.min(screenWidth * 0.56, 252);
    const circleSize = animationSize * 0.5;

    const animatedScale = useRef(new Animated.Value(1)).current;
    const animatedOpacity = useRef(new Animated.Value(0.3)).current;
    const textOpacity = useRef(new Animated.Value(1)).current;
    const messageOpacity = useRef(new Animated.Value(1)).current;
    const completionAnim = useRef(new Animated.Value(0)).current;

    const triggerTextTransition = () => {
        Animated.sequence([
            Animated.timing(textOpacity, { toValue: 0.3, duration: 200, useNativeDriver: true }),
            Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        Animated.sequence([
            Animated.timing(messageOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(messageOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
    };

    // Timer for the whole exercise and phases
    useEffect(() => {
        let interval: any;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev: number) => prev - 1);
                setPhaseTimeLeft((prev: number) => {
                    if (prev <= 1) {
                        triggerTextTransition();

                        setPhase((currentPhase) => {
                            let nextPhase: Phase;
                            if (currentPhase === 'inhale') nextPhase = 'hold';
                            else if (currentPhase === 'hold') nextPhase = 'exhale';
                            else nextPhase = 'inhale';

                            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                            setMessage(randomMsg);

                            return nextPhase;
                        });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, selectedDuration]);

    useEffect(() => {
        if (isActive && phaseTimeLeft === 0) {
            setPhaseTimeLeft(PHASE_DURATIONS[phase]);
        }
    }, [phase, isActive]);

    useEffect(() => {
        if (!isActive && !isCompleted) {
            setTimeLeft(selectedDuration);
        }
    }, [selectedDuration, isActive, isCompleted]);

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
                    toValue: 2.2,
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
            Animated.sequence([
                Animated.timing(animatedScale, { toValue: 2.15, duration: duration / 2, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(animatedScale, { toValue: 2.2, duration: duration / 2, easing: Easing.linear, useNativeDriver: true }),
            ]).start();
            Haptics.selectionAsync();
        }
    }, [phase, isActive]);

    useEffect(() => {
        let timer: any;
        if (countdown !== null && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
                Haptics.selectionAsync();
            }, 1000);
        } else if (countdown === 0) {
            setIsActive(true);
            setTimeLeft(selectedDuration);
            setPhaseTimeLeft(PHASE_DURATIONS.inhale);
            setPhase('inhale');
            setMessage(messages[0]);
            completionAnim.setValue(0);
            setCountdown(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                dispatch(setBreathingActive(false));
                setIsActive(false);
                setCountdown(null);
            };
        }, [dispatch])
    );

    useEffect(() => {
        return () => {
            dispatch(setBreathingActive(false));
        };
    }, [dispatch]);

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale': return t("breathing_inhale");
            case 'hold': return t("breathing_hold");
            case 'exhale': return t("breathing_exhale");
            default: return "";
        }
    };

    const durations = [
        { label: `39 ${t("breathing_duration_sec")}`, value: 39 },
        { label: `1.5 ${t("breathing_duration_min")}`, value: 90 },
        { label: `3 ${t("breathing_duration_min")}`, value: 180 },
    ];

    if (isCompleted) {
        return (
            <View style={[styles.container, { width: containerWidth }]}>
                <Animated.View style={[styles.completionScreen, { opacity: completionAnim }]}>
                    <Ionicons name="sunny" size={80} color={COLORS_THEME.primary} style={{ marginBottom: 20 }} />
                    <StyledText style={styles.completionTitle}>{t("breathing_completed_title")}</StyledText>
                    <StyledText style={styles.completionSubTitle}>{t("breathing_completed_subtitle")}</StyledText>

                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: COLORS_THEME.primary, marginTop: 40 }]}
                        onPress={handleStop}
                    >
                        <Ionicons name="refresh" size={24} color="#FFF" />
                        <StyledText style={styles.buttonText}>{t("breathing_button_restart")}</StyledText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.stopButton,
                            {
                                borderColor: reminderScheduled ? '#ccc' : COLORS_THEME.primary,
                                marginTop: 15,
                                paddingHorizontal: 20,
                                opacity: reminderScheduled ? 0.6 : 1
                            }
                        ]}
                        onPress={scheduleBreathingReminder}
                        disabled={reminderScheduled}
                    >
                        <Ionicons
                            name={reminderScheduled ? "checkmark-circle" : "notifications-outline"}
                            size={20}
                            color={reminderScheduled ? '#888' : COLORS_THEME.primary}
                        />
                        <StyledText style={[styles.buttonText, { color: reminderScheduled ? '#888' : COLORS_THEME.primary }]}>
                            {reminderScheduled ? t("status_scheduled") : t("breathing_button_remind")}
                        </StyledText>
                    </TouchableOpacity>
                </Animated.View>

                <TaskSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    message={t("breathing_reminder_scheduled")}
                />
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
                        size={18}
                        color={isSoundEnabled ? '#FFF' : COLORS_THEME.textMuted}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        setIsSeaEnabled(!isSeaEnabled);
                        Haptics.selectionAsync();
                    }}
                    style={[styles.soundToggle, isSeaEnabled && styles.toggleActive]}
                >
                    <MaterialCommunityIcons
                        name="waves"
                        size={18}
                        color={isSeaEnabled ? '#FFF' : COLORS_THEME.textMuted}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.mainContent}>
                <View style={styles.timerContainer}>
                    <View style={styles.timeBadge}>
                        <StyledText style={styles.totalTime}>
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </StyledText>
                    </View>
                </View>

                <View style={styles.statusTextContainer}>
                    {countdown !== null ? (
                        <StyledText style={styles.countdownText}>{t("breathing_get_ready")}: {countdown}</StyledText>
                    ) : !isActive ? (
                        <StyledText style={styles.statusText}>{t("breathing_ready")}</StyledText>
                    ) : null}
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
                        {isActive && (
                            <>
                                <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
                                    <StyledText style={[styles.phaseText, { fontSize: animationSize * 0.1, color: COLORS_THEME.text }]}>
                                        {getPhaseText()}
                                    </StyledText>
                                    <StyledText style={[styles.phaseCounterText, { fontSize: animationSize * 0.15, color: COLORS_THEME.primary }]}>
                                        {phaseTimeLeft}<StyledText style={{ fontSize: animationSize * 0.05 }}>s</StyledText>
                                    </StyledText>
                                </Animated.View>
                                <Animated.View style={{ opacity: messageOpacity }}>
                                    <StyledText style={[styles.motivationMessage, { fontSize: animationSize * 0.04 }]}>
                                        {message}
                                    </StyledText>
                                </Animated.View>
                            </>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.bottomControls}>
                <View style={styles.durationContainer}>
                    {!isActive && countdown === null && (
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
                </View>

                <View style={styles.actionButtonContainer}>
                    {!isActive && countdown === null ? (
                        <TouchableOpacity
                            style={[styles.startButton, { backgroundColor: COLORS_THEME.primary }]}
                            onPress={handleStart}
                        >
                            <Ionicons name="play" size={20} color="#FFF" />
                            <StyledText style={styles.buttonText}>{t("breathing_button_start")}</StyledText>
                        </TouchableOpacity>
                    ) : isActive ? (
                        <TouchableOpacity
                            style={[styles.stopButton, { borderColor: COLORS_THEME.primary }]}
                            onPress={handleStop}
                        >
                            <Ionicons name="stop" size={20} color={COLORS_THEME.primary} />
                            <StyledText style={[styles.buttonText, { color: COLORS_THEME.primary }]}>{t("breathing_button_stop")}</StyledText>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ alignItems: 'center', gap: 12, marginTop: -30 }}>
                            <StyledText style={{ color: COLORS_THEME.textMuted, fontSize: 16, fontWeight: '500' }}>
                                {t("breathing_get_ready")}...
                            </StyledText>
                            <TouchableOpacity
                                style={[styles.stopButton, { borderColor: COLORS_THEME.primary, borderStyle: 'dashed' }]}
                                onPress={handleStop}
                            >
                                <Ionicons name="close-circle-outline" size={20} color={COLORS_THEME.primary} />
                                <StyledText style={[styles.buttonText, { color: COLORS_THEME.primary }]}>
                                    {t("breathing_button_stop")}
                                </StyledText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <TaskSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                message={t("breathing_reminder_scheduled")}
            />
        </View>
    );
}
