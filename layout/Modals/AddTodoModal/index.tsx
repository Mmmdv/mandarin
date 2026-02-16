import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { schedulePushNotification } from "@/constants/notifications";
import { COLORS } from "@/constants/ui";
import { analyzeAudio } from "@/helpers/gemini";
import { useDateTimePicker } from "@/hooks/useDateTimePicker";
import { useTheme } from "@/hooks/useTheme";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useAppDispatch } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Keyboard, Platform, Pressable, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { localStyles } from "./styles";

type AddTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onAdd: (title: string, reminder?: string, notificationId?: string) => void
    categoryTitle?: string
    categoryIcon?: string
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({
    isOpen, onClose, onAdd, categoryTitle, categoryIcon }) => {
    const { t, theme, notificationsEnabled, todoNotifications } = useTheme();
    const dispatch = useAppDispatch();

    const [isFocused, setIsFocused] = useState(false)
    const [title, setTitle] = useState("")
    const [inputError, setInputError] = useState(false)

    const inputRef = useRef<TextInput>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const { startRecording, stopRecording, isRecording } = useVoiceRecorder();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const waveAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // WhatsApp style visualizer bars
    const barAnims = useRef(Array.from({ length: 15 }, () => new Animated.Value(0.2))).current;

    const MAX_DURATION = 30;

    useEffect(() => {
        let timer: any;
        let visualizerInterval: any;

        if (isRecording) {
            setRecordingTime(0);
            progressAnim.setValue(0);

            // Randomly animate bars to simulate voice activity
            visualizerInterval = setInterval(() => {
                barAnims.forEach(anim => {
                    Animated.spring(anim, {
                        toValue: Math.random() * 0.8 + 0.2, // Random height between 0.2 and 1.0
                        useNativeDriver: true,
                        friction: 3,
                        tension: 40,
                    }).start();
                });
            }, 100);

            timer = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= MAX_DURATION - 1) {
                        handleVoiceInput(); // Auto stop
                        return MAX_DURATION;
                    }
                    return prev + 1;
                });
            }, 1000);

            Animated.timing(progressAnim, {
                toValue: 1,
                duration: MAX_DURATION * 1000,
                useNativeDriver: false,
            }).start();
        } else {
            setRecordingTime(0);
            progressAnim.setValue(0);
            // Reset bars
            barAnims.forEach(anim => anim.setValue(0.2));
        }
        return () => {
            clearInterval(timer);
            clearInterval(visualizerInterval);
        };
    }, [isRecording]);

    useEffect(() => {
        let pulse: Animated.CompositeAnimation | null = null;
        let waves: Animated.CompositeAnimation | null = null;

        if (isRecording) {
            pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();

            waves = Animated.loop(
                Animated.stagger(200, waveAnims.map(anim =>
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ])
                ))
            );
            waves.start();
        } else {
            pulseAnim.setValue(1);
            waveAnims.forEach(anim => anim.setValue(0));
        }

        return () => {
            pulse?.stop();
            waves?.stop();
        };
    }, [isRecording]);

    const handleVoiceInput = async () => {
        if (isRecording) {
            const uri = await stopRecording();
            if (uri) {
                setIsAnalyzing(true);
                const result = await analyzeAudio(uri);
                if (result && !result.error) {
                    if (result.title) setTitle(result.title);
                    if (result.date) {
                        const date = new Date(result.date);
                        if (!isNaN(date.getTime())) {
                            picker.setReminderDate(date);
                        }
                    }
                    setIsAnalyzing(false);
                } else {
                    setIsAnalyzing(false);
                    const errorKey = result?.error === 'rate_limit' ? "error_rate_limit" :
                        result?.error === 'network_error' ? "error_network" :
                            result?.error === 'parse_error' ? "error_voice_parse" : "voice_error";

                    Alert.alert(t("error"), t(errorKey as any));
                }
            }
        } else {
            const success = await startRecording();
            if (!success) {
                Alert.alert(t("attention"), t("mic_busy"));
            }
        }
    };

    const onPressAdd = async (dateOverride?: Date) => {
        if (!title.trim()) {
            setInputError(true)
            return
        }
        const finalDate = dateOverride || picker.reminderDate;

        if (finalDate && finalDate < new Date()) {
            picker.setShowPastDateAlert(true);
            return;
        }

        let notificationId: string | undefined;

        if (finalDate && notificationsEnabled && todoNotifications) {
            const displayTitle = categoryTitle || t("tab_todo");
            notificationId = await schedulePushNotification(displayTitle, title, finalDate, categoryIcon);
            if (notificationId) {
                dispatch(addNotification({
                    id: notificationId,
                    title: displayTitle,
                    body: title,
                    date: finalDate.toISOString(),
                    categoryIcon,
                }));
            }
        }

        onAdd(title, finalDate?.toISOString(), notificationId)
        onClose()
    }

    const picker = useDateTimePicker({
        onDateConfirmedAndroid: (date) => {
            setTimeout(() => onPressAdd(date), 100);
        },
        tabSettingEnabled: todoNotifications
    });

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.1 : 1,
            useNativeDriver: false,
            friction: 8,
            tension: 40
        }).start();
    }, [isFocused]);

    useEffect(() => {
        if (inputError && title) setInputError(false)
    }, [title])

    useEffect(() => {
        if (isOpen) {
            setTitle("")
            setInputError(false)
            setIsFocused(false)
            picker.resetState(undefined)
        }
    }, [isOpen])

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={modalStyles.modalContainer}>
                    <View style={[modalStyles.iconContainer, {
                        backgroundColor: COLORS.SECONDARY_BACKGROUND,
                        shadowColor: COLORS.CHECKBOX_SUCCESS,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5
                    }]}>
                        <Ionicons name="add" size={28} color={COLORS.CHECKBOX_SUCCESS} />
                    </View>

                    <StyledText style={modalStyles.headerText}>{t("add")}</StyledText>

                    <View style={modalStyles.divider} />

                    <Pressable onPress={() => inputRef.current?.focus()} style={{ width: '100%', alignItems: 'center', zIndex: 10 }} disabled={isRecording || isAnalyzing}>
                        <Animated.View style={[
                            localStyles.inputWrapper,
                            isFocused && localStyles.inputFocused,
                            inputError && localStyles.inputError,
                            {
                                minHeight: scaleAnim.interpolate({
                                    inputRange: [1, 1.1],
                                    outputRange: [60, 120]
                                }),
                                marginTop: scaleAnim.interpolate({
                                    inputRange: [1, 1.1],
                                    outputRange: [0, 5]
                                }),
                                marginBottom: scaleAnim.interpolate({
                                    inputRange: [1, 1.1],
                                    outputRange: [12, 15]
                                }),
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}>
                            <TextInput
                                ref={inputRef}
                                style={[localStyles.textInput, { fontSize: title ? 16 : 12 }]}
                                placeholder={t("todo_placeholder")}
                                placeholderTextColor="#666"
                                value={title}
                                onChangeText={setTitle}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                multiline={true}
                            />
                        </Animated.View>
                    </Pressable>

                    {/* Action Row: Reminder & Voice */}
                    <View style={localStyles.actionRow}>
                        {!picker.reminderDate ? (
                            <TouchableOpacity
                                style={localStyles.addReminderButton}
                                onPress={picker.startReminderFlow}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="notifications-outline" size={20} color="#888" />
                                <StyledText style={localStyles.addReminderText}>{t("reminder")}</StyledText>
                                <Ionicons name="add-circle" size={20} color={COLORS.CHECKBOX_SUCCESS} style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        ) : (
                            <View style={[localStyles.reminderChip, { flex: 1 }]}>
                                <TouchableOpacity
                                    style={localStyles.chipContent}
                                    onPress={picker.startReminderFlow}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="calendar" size={18} color="#fff" />
                                    <StyledText style={localStyles.chipText}>
                                        {picker.formatFullDate(picker.reminderDate)}
                                    </StyledText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => picker.setReminderDate(undefined)}
                                    style={localStyles.clearButton}
                                >
                                    <Ionicons name="close-circle" size={20} color="#fff" style={{ opacity: 0.8 }} />
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[localStyles.voiceButton, isRecording && localStyles.voiceButtonActive]}
                            onPress={handleVoiceInput}
                            disabled={isAnalyzing}
                        >
                            <Ionicons
                                name={isRecording ? "stop" : "mic"}
                                size={24}
                                color={isRecording ? "#ea4335" : "#fff"}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Voice Interaction Modal */}
                    <StyledModal isOpen={isRecording || isAnalyzing} onClose={() => { }}>
                        <View style={[modalStyles.modalContainer, { minHeight: 280, paddingVertical: 30 }]}>
                            <View style={localStyles.visualizerContainer}>
                                {isRecording ? (
                                    <View style={localStyles.barsRow}>
                                        {barAnims.map((anim, i) => (
                                            <Animated.View
                                                key={i}
                                                style={[
                                                    localStyles.visualizerBar,
                                                    {
                                                        transform: [{ scaleY: anim }],
                                                        opacity: anim.interpolate({
                                                            inputRange: [0.2, 1],
                                                            outputRange: [0.4, 1]
                                                        })
                                                    }
                                                ]}
                                            />
                                        ))}
                                    </View>
                                ) : (
                                    <View style={localStyles.analyzingLoader}>
                                        <ActivityIndicator color={COLORS.CHECKBOX_SUCCESS} size="large" />
                                    </View>
                                )}
                            </View>

                            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                <View style={[localStyles.micCircle, isRecording && { borderColor: '#ea4335' }]}>
                                    <Ionicons
                                        name={isRecording ? "mic" : "cloud-upload"}
                                        size={32}
                                        color={isRecording ? "#ea4335" : COLORS.CHECKBOX_SUCCESS}
                                    />
                                </View>
                                <StyledText style={localStyles.voiceModalStatusText}>
                                    {isRecording ? t("listening") : t("processing")}
                                </StyledText>
                            </View>

                            {isRecording && (
                                <View style={localStyles.timerContainer}>
                                    <View style={localStyles.progressBarBackground}>
                                        <Animated.View
                                            style={[
                                                localStyles.progressBarFill,
                                                {
                                                    width: progressAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ['0%', '100%']
                                                    })
                                                }
                                            ]}
                                        />
                                    </View>
                                    <StyledText style={localStyles.timerText}>
                                        00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 00:30
                                    </StyledText>
                                </View>
                            )}

                            {isRecording && (
                                <TouchableOpacity
                                    onPress={handleVoiceInput}
                                    style={localStyles.stopRecordingButton}
                                >
                                    <View style={localStyles.stopIcon} />
                                    <StyledText style={localStyles.stopButtonText}>{t("close")}</StyledText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </StyledModal>

                    {/* Android Pickers */}
                    {Platform.OS === 'android' && picker.showDatePicker && (
                        <DateTimePicker
                            value={picker.reminderDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={picker.onChangeDate}
                            minimumDate={new Date()}
                            locale={picker.getLocale()}
                        />
                    )}

                    {Platform.OS === 'android' && picker.showTimePicker && (
                        <DateTimePicker
                            value={picker.reminderDate || new Date()}
                            mode="time"
                            display="default"
                            onChange={picker.onChangeTime}
                            locale={picker.getLocale()}
                            is24Hour={true}
                        />
                    )}

                    {/* iOS Pickers */}
                    {Platform.OS === 'ios' && (
                        <StyledModal
                            isOpen={picker.showDatePicker || picker.showTimePicker}
                            onClose={picker.closePickers}
                        >
                            <View style={modalStyles.modalContainer}>
                                <View style={[modalStyles.iconContainer, {
                                    backgroundColor: COLORS.SECONDARY_BACKGROUND,
                                    shadowColor: picker.showDatePicker ? "#5BC0EB" : "#FFD166",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 5
                                }]}>
                                    <Ionicons
                                        name={picker.showDatePicker ? "calendar" : "time"}
                                        size={28}
                                        color={picker.showDatePicker ? "#5BC0EB" : "#FFD166"}
                                    />
                                </View>

                                <StyledText style={modalStyles.headerText}>
                                    {picker.showDatePicker ? t("date") : t("time")}
                                </StyledText>

                                <View style={modalStyles.divider} />

                                <View style={{ width: '100%', height: 150, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                    <DateTimePicker
                                        value={picker.tempDate || picker.reminderDate || new Date()}
                                        mode={picker.showDatePicker ? "date" : "time"}
                                        display="spinner"
                                        onChange={picker.showDatePicker ? picker.onChangeDate : picker.onChangeTime}
                                        minimumDate={picker.showDatePicker ? new Date() : undefined}
                                        locale={picker.getLocale()}
                                        textColor={COLORS.PRIMARY_TEXT}
                                        themeVariant={theme}
                                        style={{ width: '100%', transform: [{ scale: 0.85 }] }}
                                    />
                                </View>

                                <View style={[modalStyles.buttonsContainer, { marginTop: 20 }]}>
                                    <StyledButton
                                        label={picker.showTimePicker ? t("back") : t("close")}
                                        onPress={picker.showTimePicker ? picker.goBackToDatePicker : picker.closePickers}
                                        variant="dark_button"
                                        style={{ flex: 1 }}
                                    />
                                    <StyledButton
                                        label={picker.showDatePicker ? (picker.reminderDate ? t("back") : t("next")) : t("save")}
                                        onPress={picker.showDatePicker ? (picker.reminderDate ? picker.goBackToTimePicker : picker.confirmDateIOS) : picker.confirmTimeIOS}
                                        variant="dark_button"
                                        style={{ flex: 1 }}
                                    />
                                </View>
                            </View>
                        </StyledModal>
                    )}

                    <View style={modalStyles.buttonsContainer}>
                        <StyledButton
                            label={t("cancel")}
                            onPress={onClose}
                            variant="dark_button"
                        />
                        <StyledButton
                            label={t("add")}
                            onPress={() => onPressAdd()}
                            variant="dark_button"
                            disabled={isRecording || isAnalyzing}
                        />
                    </View>

                    {/* Permission Modal */}
                    <StyledModal isOpen={picker.showPermissionModal} onClose={() => picker.setShowPermissionModal(false)}>
                        <View style={modalStyles.modalContainer}>
                            <View style={[modalStyles.iconContainer, {
                                backgroundColor: COLORS.SECONDARY_BACKGROUND,
                                shadowColor: "#FFD166",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 5
                            }]}>
                                <Ionicons name="notifications" size={28} color="#FFD166" />
                            </View>

                            <StyledText style={modalStyles.headerText}>{t("enable_notifications")}</StyledText>

                            <View style={modalStyles.divider} />

                            <StyledText style={modalStyles.messageText}>
                                {t("enable_notifications_desc")}
                            </StyledText>

                            <View style={modalStyles.buttonsContainer}>
                                <StyledButton
                                    label={t("cancel")}
                                    onPress={() => picker.setShowPermissionModal(false)}
                                    variant="dark_button"
                                />
                                <StyledButton
                                    label={t("enable")}
                                    onPress={() => {
                                        dispatch(updateAppSetting({
                                            notificationsEnabled: true,
                                            todoNotifications: true
                                        }));
                                        picker.setShowPermissionModal(false);
                                        setTimeout(() => {
                                            picker.proceedWithReminder();
                                        }, 300);
                                    }}
                                    variant="dark_button"
                                />
                            </View>
                        </View>
                    </StyledModal>

                    {/* Past Date Alert Modal */}
                    <StyledModal isOpen={picker.showPastDateAlert} onClose={() => picker.setShowPastDateAlert(false)}>
                        <View style={modalStyles.modalContainer}>
                            <View style={[modalStyles.iconContainer, {
                                backgroundColor: COLORS.SECONDARY_BACKGROUND,
                                shadowColor: "#FFB74D",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 5
                            }]}>
                                <Ionicons name="alert-circle" size={28} color="#FFB74D" />
                            </View>

                            <StyledText style={modalStyles.headerText}>{t("attention")}</StyledText>

                            <View style={modalStyles.divider} />

                            <StyledText style={modalStyles.messageText}>
                                {t("past_reminder_error")}
                            </StyledText>

                            <View style={modalStyles.buttonsContainer}>
                                <StyledButton
                                    label={t("close")}
                                    onPress={picker.closePastDateAlert}
                                    variant="dark_button"
                                />
                            </View>
                        </View>
                    </StyledModal>

                </View>
            </TouchableWithoutFeedback>
        </StyledModal>
    )
}

export default AddTodoModal
