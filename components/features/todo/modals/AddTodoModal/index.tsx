import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { getModalStyles, modalStyles } from "@/constants/modalStyles";
import { schedulePushNotification } from "@/constants/notifications";
import { analyzeAudio } from "@/helpers/gemini";
import { useDateTimePicker } from "@/hooks/useDateTimePicker";
import { useTheme } from "@/hooks/useTheme";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useAppDispatch } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Keyboard, Platform, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { getAddStyles } from "./styles";

type AddTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onAdd: (title: string, reminder?: string, notificationId?: string) => void
    categoryTitle?: string
    categoryIcon?: string
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({
    isOpen, onClose, onAdd, categoryTitle, categoryIcon }) => {
    const { t, theme, colors, isDark, notificationsEnabled, todoNotifications, lang } = useTheme();
    const dispatch = useAppDispatch();

    const themedModalStyles = useMemo(() => getModalStyles(colors), [colors]);
    const themedLocalStyles = useMemo(() => getAddStyles(colors, isDark), [colors, isDark]);

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
                            if (!notificationsEnabled || !todoNotifications) {
                                setTimeout(() => picker.setShowPermissionModal(true), 500);
                            }
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
            const displayTitle = categoryTitle || t("notifications_todo");
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

            // Auto focus input with a small delay for modal transition
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen])

    const formatDateOnly = (date: Date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const months = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
        const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const ruMonths = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

        const monthNames = lang === 'az' ? months : lang === 'ru' ? ruMonths : enMonths;
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const formatTimeOnly = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    return (
        <StyledModal isOpen={isOpen} onClose={onClose} expectsKeyboard={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={themedLocalStyles.container}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', width: '100%', marginBottom: 4 }}>
                        <View style={[modalStyles.iconContainer, {
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                            shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                            elevation: 2,
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            flexShrink: 0
                        }]}>
                            <Ionicons name="add" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                        </View>
                        <StyledText style={[themedLocalStyles.headerText, { textAlign: 'left' }]}>{t("add")}</StyledText>
                    </View>

                    <View style={modalStyles.divider} />

                    {/* 1. Title Section */}
                    <View style={themedLocalStyles.tableContainer}>
                        <View style={[
                            themedLocalStyles.tableRow,
                            { flexDirection: 'column', alignItems: 'flex-start', gap: 8 },
                            inputError && themedLocalStyles.inputError
                        ]}>
                            <View style={[themedLocalStyles.tableLabelColumn, { flex: 0, width: '100%' }]}>
                                <Ionicons name="document-text-outline" size={18} color={colors.SECTION_TEXT} />
                                <StyledText style={themedLocalStyles.tableLabelText}>{t("title")} *</StyledText>
                            </View>
                            <View style={[themedLocalStyles.tableValueColumn, { flex: 0, width: '100%', alignItems: 'flex-start', paddingLeft: 28 }]}>
                                <TextInput
                                    ref={inputRef}
                                    style={[themedLocalStyles.tableValueText, { textAlign: 'left', fontSize: 14, width: '100%' }]}
                                    placeholder={t("todo_placeholder")}
                                    placeholderTextColor={colors.PLACEHOLDER}
                                    value={title}
                                    onChangeText={setTitle}
                                    multiline={true} // Allow longer titles to wrap
                                />
                            </View>
                        </View>
                    </View>

                    {/* 2. Reminder Section */}
                    <View style={[themedLocalStyles.tableContainer, { marginTop: 16 }]}>
                        {/* Date Row */}
                        <TouchableOpacity
                            style={themedLocalStyles.tableRow}
                            onPress={() => picker.setShowDatePicker(true)}
                            activeOpacity={0.7}
                        >
                            <View style={themedLocalStyles.tableLabelColumn}>
                                <Ionicons name="calendar-outline" size={18} color={colors.SECTION_TEXT} />
                                <StyledText style={themedLocalStyles.tableLabelText}>{t("date")}</StyledText>
                            </View>
                            <View style={themedLocalStyles.tableValueColumn}>
                                <StyledText style={[themedLocalStyles.tableValueText, !picker.reminderDate && { color: colors.PLACEHOLDER }]}>
                                    {picker.reminderDate ? formatDateOnly(picker.reminderDate) : t("date")}
                                </StyledText>
                            </View>
                        </TouchableOpacity>

                        {/* Time Row */}
                        <TouchableOpacity
                            style={[themedLocalStyles.tableRow, themedLocalStyles.tableRowBorder]}
                            onPress={() => picker.setShowTimePicker(true)}
                            activeOpacity={0.7}
                        >
                            <View style={themedLocalStyles.tableLabelColumn}>
                                <Ionicons name="time-outline" size={18} color={colors.SECTION_TEXT} />
                                <StyledText style={themedLocalStyles.tableLabelText}>{t("time")}</StyledText>
                            </View>
                            <View style={themedLocalStyles.tableValueColumn}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <StyledText style={[themedLocalStyles.tableValueText, !picker.reminderDate && { color: colors.PLACEHOLDER }]}>
                                        {picker.reminderDate ? formatTimeOnly(picker.reminderDate) : t("time")}
                                    </StyledText>
                                    {picker.reminderDate && (
                                        <TouchableOpacity onPress={(e) => {
                                            e.stopPropagation();
                                            picker.setReminderDate(undefined);
                                        }}>
                                            <Ionicons name="close-circle" size={16} color={colors.SECTION_TEXT} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '100%', paddingHorizontal: 4, marginTop: 0, marginBottom: 4 }}>
                        <StyledText style={{
                            fontSize: 9.5,
                            color: colors.SECTION_TEXT,
                            opacity: 0.7,
                            textAlign: 'center',
                            lineHeight: 10
                        }}>
                            {t("reminder_hint")}
                        </StyledText>
                    </View>

                    {/* Action Row: Voice Input */}
                    <View style={[themedLocalStyles.actionRow, { marginTop: 12 }]}>
                        <TouchableOpacity
                            onPress={handleVoiceInput}
                            activeOpacity={0.7}
                            disabled={isAnalyzing}
                            style={themedLocalStyles.voiceButton}
                        >
                            <Ionicons
                                name={isRecording ? "stop" : "mic-outline"}
                                size={20}
                                color={isRecording ? "#ea4335" : colors.SECTION_TEXT}
                            />
                            <StyledText style={{ color: colors.SECTION_TEXT, fontSize: 13, fontWeight: '600' }}>
                                {isRecording ? t("stop") : t("voice_input")}
                            </StyledText>
                        </TouchableOpacity>
                    </View>

                    {/* Voice Interaction Modal */}
                    <StyledModal isOpen={isRecording || isAnalyzing} onClose={() => { }}>
                        <View style={[themedModalStyles.modalContainer, { minHeight: 280, paddingVertical: 30 }]}>
                            <View style={themedLocalStyles.visualizerContainer}>
                                {isRecording ? (
                                    <View style={themedLocalStyles.barsRow}>
                                        {barAnims.map((anim, i) => (
                                            <Animated.View
                                                key={i}
                                                style={[
                                                    themedLocalStyles.visualizerBar,
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
                                    <View style={themedLocalStyles.analyzingLoader}>
                                        <ActivityIndicator color={colors.CHECKBOX_SUCCESS} size="large" />
                                    </View>
                                )}
                            </View>

                            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                <View style={[themedLocalStyles.micCircle, isRecording && { borderColor: '#ea4335' }]}>
                                    <Ionicons
                                        name={isRecording ? "mic" : "cloud-upload"}
                                        size={32}
                                        color={isRecording ? "#ea4335" : colors.PRIMARY_ACTIVE_BUTTON}
                                    />
                                </View>
                                <StyledText style={themedLocalStyles.voiceModalStatusText}>
                                    {isRecording ? t("listening") : t("processing")}
                                </StyledText>
                            </View>

                            {isRecording && (
                                <View style={themedLocalStyles.timerContainer}>
                                    <View style={themedLocalStyles.progressBarBackground}>
                                        <Animated.View
                                            style={[
                                                themedLocalStyles.progressBarFill,
                                                {
                                                    width: progressAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ['0%', '100%']
                                                    })
                                                }
                                            ]}
                                        />
                                    </View>
                                    <StyledText style={themedLocalStyles.timerText}>
                                        00:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 00:30
                                    </StyledText>
                                </View>
                            )}

                            {isRecording && (
                                <TouchableOpacity
                                    onPress={handleVoiceInput}
                                    style={themedLocalStyles.stopRecordingButton}
                                >
                                    <View style={themedLocalStyles.stopIcon} />
                                    <StyledText style={themedLocalStyles.stopButtonText}>{t("close")}</StyledText>
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
                            <View style={themedModalStyles.modalContainer}>
                                <View style={[themedModalStyles.iconContainer, {
                                    backgroundColor: colors.TAB_BAR,
                                    shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 2,
                                    elevation: 2
                                }]}>
                                    <Ionicons
                                        name={picker.showDatePicker ? "calendar" : "time"}
                                        size={28}
                                        color={colors.PRIMARY_ACTIVE_BUTTON}
                                    />
                                </View>

                                <StyledText style={themedModalStyles.headerText}>
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
                                        textColor={colors.PRIMARY_TEXT}
                                        themeVariant={theme}
                                        style={{ width: '100%', transform: [{ scale: 0.85 }] }}
                                    />
                                </View>

                                <View style={[themedModalStyles.buttonsContainer, { marginTop: 20 }]}>
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

                    <View style={[modalStyles.buttonsContainer, { marginTop: 8 }]}>
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
                        <View style={themedModalStyles.modalContainer}>
                            <View style={[themedModalStyles.iconContainer, {
                                backgroundColor: colors.TAB_BAR,
                                shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 2,
                                elevation: 2
                            }]}>
                                <Ionicons name="notifications" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                            </View>

                            <StyledText style={themedModalStyles.headerText}>{t("enable_notifications")}</StyledText>

                            <View style={modalStyles.divider} />

                            <StyledText style={themedModalStyles.messageText}>
                                {t("enable_notifications_desc")}
                            </StyledText>

                            <View style={themedModalStyles.buttonsContainer}>
                                <StyledButton
                                    label={t("cancel")}
                                    onPress={() => {
                                        picker.setShowPermissionModal(false);
                                        picker.setReminderDate(undefined);
                                    }}
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
                        <View style={themedModalStyles.modalContainer}>
                            <View style={[themedModalStyles.iconContainer, {
                                backgroundColor: colors.TAB_BAR,
                                shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 2,
                                elevation: 2
                            }]}>
                                <Ionicons name="alert-circle" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                            </View>

                            <StyledText style={themedModalStyles.headerText}>{t("attention")}</StyledText>

                            <View style={modalStyles.divider} />

                            <StyledText style={themedModalStyles.messageText}>
                                {t("past_reminder_error")}
                            </StyledText>

                            <View style={themedModalStyles.buttonsContainer}>
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

export default AddTodoModal;
