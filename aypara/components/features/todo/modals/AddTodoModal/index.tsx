import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { getModalStyles, modalStyles } from "@/constants/modalStyles";
import { schedulePushNotification } from "@/constants/notifications";
import { TODO_CATEGORIES } from "@/constants/todo";
import { analyzeAudio } from "@/helpers/gemini";
import { useDateTimePicker } from "@/hooks/useDateTimePicker";
import { useTheme } from "@/hooks/useTheme";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import OSPermissionModal from "@/layout/Modals/OSPermissionModal";
import { useAppDispatch } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { getAddStyles } from "./styles";

type AddTodoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    title: string,
    reminder?: string,
    notificationId?: string,
    category?: string,
  ) => void;
  categoryTitle?: string;
  categoryIcon?: string;
};

const AddTodoModal: React.FC<AddTodoModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categoryTitle,
  categoryIcon,
}) => {
  const { t, theme, colors, isDark, todoNotifications, lang } = useTheme();
  const dispatch = useAppDispatch();

  const themedModalStyles = useMemo(() => getModalStyles(colors), [colors]);
  const themedLocalStyles = useMemo(
    () => getAddStyles(colors, isDark),
    [colors, isDark],
  );

  const [title, setTitle] = useState("");
  const [inputError, setInputError] = useState(false);
  const categoryScrollRef = useRef<ScrollView>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("personal");

  const inputRef = useRef<TextInput>(null);

  const { startRecording, stopRecording, isRecording } = useVoiceRecorder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // WhatsApp style visualizer bars
  const barAnims = useRef(
    Array.from({ length: 15 }, () => new Animated.Value(0.2)),
  ).current;

  const MAX_DURATION = 30;

  async function onPressAdd(dateOverride?: Date) {
    if (!title.trim()) {
      setInputError(true);
      return;
    }
    const finalDate = dateOverride || picker.reminderDate;

    if (finalDate && finalDate < new Date()) {
      picker.setShowPastDateAlert(true);
      return;
    }

    let notificationId: string | undefined;

    if (finalDate && todoNotifications) {
      const displayTitle = categoryTitle || t("notifications_todo");

      notificationId = await schedulePushNotification(
        displayTitle,
        title,
        finalDate,
        categoryIcon,
      );
      if (notificationId) {
        dispatch(
          addNotification({
            id: notificationId,
            title: displayTitle,
            body: title,
            date: finalDate.toISOString(),
            categoryIcon: categoryIcon,
          }),
        );
      }
    }

    onAdd(title, finalDate?.toISOString(), notificationId, selectedCategory);
    onClose();
  }

  const picker = useDateTimePicker({
    onDateConfirmedAndroid: (date) => {
      setTimeout(() => onPressAdd(date), 100);
    },
    tabSettingEnabled: todoNotifications,
  });

  const handleVoiceInput = useCallback(async () => {
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
              if (!todoNotifications) {
                setTimeout(() => picker.setShowPermissionModal(true), 500);
              }
            }
          }
          setIsAnalyzing(false);
        } else {
          setIsAnalyzing(false);
          const errorKey =
            result?.error === "rate_limit"
              ? "error_rate_limit"
              : result?.error === "network_error"
                ? "error_network"
                : result?.error === "parse_error"
                  ? "error_voice_parse"
                  : "voice_error";

          Alert.alert(t("error"), t(errorKey as any));
        }
      }
    } else {
      const success = await startRecording();
      if (!success) {
        Alert.alert(t("attention"), t("mic_busy"));
      }
    }
  }, [
    isRecording,
    stopRecording,
    startRecording,
    setTitle,
    picker,
    todoNotifications,
    t,
  ]);

  useEffect(() => {
    let timer: any;
    let visualizerInterval: any;

    if (isRecording) {
      setRecordingTime(0);
      progressAnim.setValue(0);

      // Reduced frequency to 150ms and simplified animation
      visualizerInterval = setInterval(() => {
        barAnims.forEach((anim) => {
          Animated.timing(anim, {
            toValue: Math.random() * 0.8 + 0.2, // Random height
            duration: 150,
            useNativeDriver: true,
          }).start();
        });
      }, 150);

      timer = setInterval(() => {
        setRecordingTime((prev) => {
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
      barAnims.forEach((anim) => anim.setValue(0.2));
    }
    return () => {
      clearInterval(timer);
      clearInterval(visualizerInterval);
    };
  }, [isRecording, barAnims, progressAnim, handleVoiceInput]);

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
        ]),
      );
      pulse.start();

      waves = Animated.loop(
        Animated.stagger(
          200,
          waveAnims.map((anim) =>
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
            ]),
          ),
        ),
      );
      waves.start();
    } else {
      pulseAnim.setValue(1);
      waveAnims.forEach((anim) => anim.setValue(0));
    }

    return () => {
      pulse?.stop();
      waves?.stop();
    };
  }, [isRecording, pulseAnim, waveAnims]);

  useEffect(() => {
    if (inputError && title) setInputError(false);
  }, [title, inputError]);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setInputError(false);
      setSelectedCategory("personal");
      picker.resetState(undefined);

      // Auto focus input immediately or with a minimal delay
      // to ensure it works across all devices
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (selectedCategory) {
      categoryScrollRef.current?.scrollTo({ x: 0, animated: true });
    }
  }, [selectedCategory]);

  const formatDateOnly = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const months = [
      "Yan",
      "Fev",
      "Mar",
      "Apr",
      "May",
      "İyn",
      "İyl",
      "Avq",
      "Sen",
      "Okt",
      "Noy",
      "Dek",
    ];
    const enMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const ruMonths = [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ];

    const monthNames =
      lang === "az" ? months : lang === "ru" ? ruMonths : enMonths;
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              justifyContent: "center",
              width: "100%",
              marginBottom: 4,
            }}
          >
            <View
              style={[
                modalStyles.iconContainer,
                {
                  backgroundColor: colors.SECONDARY_BACKGROUND,
                  shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 2,
                  elevation: 2,
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  flexShrink: 0,
                },
              ]}
            >
              <Ionicons
                name="add"
                size={28}
                color={colors.PRIMARY_ACTIVE_BUTTON}
              />
            </View>
            <StyledText style={themedLocalStyles.headerText}>
              {t("add")}
            </StyledText>
          </View>

          <View style={modalStyles.divider} />

          {/* 1. Title Section */}
          <View style={themedLocalStyles.tableContainer}>
            <Pressable
              onPress={() => inputRef.current?.focus()}
              style={[
                themedLocalStyles.tableRow,
                { flexDirection: "column", alignItems: "flex-start", gap: 8 },
                inputError && themedLocalStyles.inputError,
              ]}
            >
              <View
                style={[
                  themedLocalStyles.tableLabelColumn,
                  {
                    flex: 0,
                    width: "100%",
                    justifyContent: "space-between",
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={colors.SECTION_TEXT}
                  />
                  <StyledText style={themedLocalStyles.tableLabelText}>
                    {t("title")} *
                  </StyledText>
                </View>

                <TouchableOpacity
                  onPress={handleVoiceInput}
                  activeOpacity={0.7}
                  disabled={isAnalyzing}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: isRecording
                      ? "rgba(234, 67, 53, 0.1)"
                      : "transparent",
                  }}
                >
                  <Ionicons
                    name={isRecording ? "stop-circle" : "mic-outline"}
                    size={20}
                    color={isRecording ? "#ea4335" : colors.SECTION_TEXT}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={[
                  themedLocalStyles.tableValueColumn,
                  {
                    flex: 0,
                    width: "100%",
                    alignItems: "flex-start",
                    paddingLeft: 28,
                  },
                ]}
              >
                <TextInput
                  ref={inputRef}
                  style={[
                    themedLocalStyles.tableValueText,
                    { textAlign: "left", fontSize: 14, width: "100%" },
                  ]}
                  placeholder={t("todo_placeholder")}
                  placeholderTextColor={colors.PLACEHOLDER}
                  value={title}
                  onChangeText={setTitle}
                  multiline={true}
                  autoFocus={true} // Reinforce auto-focus
                  blurOnSubmit={false} // Prevent keyboard flicker on enter
                  showSoftInputOnFocus={true}
                />
              </View>
            </Pressable>
          </View>

          {/* 1.5. Category Section */}
          <View style={[themedLocalStyles.categoryContainer, { marginTop: 3 }]}>
            <ScrollView
              ref={categoryScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={themedLocalStyles.categoryList}
            >
              {[...TODO_CATEGORIES]
                .sort((a, b) =>
                  a.id === selectedCategory
                    ? -1
                    : b.id === selectedCategory
                      ? 1
                      : 0,
                )
                .map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.7}
                    style={[
                      themedLocalStyles.categoryItem,
                      {
                        backgroundColor:
                          selectedCategory === cat.id
                            ? isDark
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.05)"
                            : "transparent",
                        borderColor:
                          selectedCategory === cat.id
                            ? colors.PRIMARY_ACTIVE_BUTTON
                            : isDark
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.1)",
                        borderWidth: selectedCategory === cat.id ? 1.5 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={
                        selectedCategory === cat.id
                          ? colors.PRIMARY_ACTIVE_BUTTON
                          : colors.SECTION_TEXT
                      }
                    />
                    <StyledText
                      style={{
                        fontSize: 11,
                        color:
                          selectedCategory === cat.id
                            ? colors.PRIMARY_TEXT
                            : colors.SECTION_TEXT,
                        fontWeight: selectedCategory === cat.id ? "700" : "500",
                      }}
                    >
                      {t(cat.label as any)}
                    </StyledText>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>

          {/* 2. Reminder Section */}
          <View style={[themedLocalStyles.tableContainer, { marginTop: 16 }]}>
            {/* Date Row */}
            <TouchableOpacity
              style={themedLocalStyles.tableRow}
              onPress={() => picker.startReminderFlow()}
              activeOpacity={0.7}
            >
              <View style={themedLocalStyles.tableLabelColumn}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.SECTION_TEXT}
                />
                <StyledText style={themedLocalStyles.tableLabelText}>
                  {t("date")}
                </StyledText>
              </View>
              <View style={themedLocalStyles.tableValueColumn}>
                <StyledText
                  style={[
                    themedLocalStyles.tableValueText,
                    !picker.reminderDate && { color: colors.PLACEHOLDER },
                  ]}
                >
                  {picker.reminderDate
                    ? formatDateOnly(picker.reminderDate)
                    : t("select_placeholder")}
                </StyledText>
              </View>
            </TouchableOpacity>

            <View
              style={[
                themedLocalStyles.tableRow,
                themedLocalStyles.tableRowBorder,
                { flexDirection: "row", alignItems: "center" },
              ]}
            >
              <TouchableOpacity
                onPress={() => picker.startReminderFlow()}
                activeOpacity={0.7}
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <View style={themedLocalStyles.tableLabelColumn}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.SECTION_TEXT}
                  />
                  <StyledText style={themedLocalStyles.tableLabelText}>
                    {t("time")}
                  </StyledText>
                </View>
                <View style={[themedLocalStyles.tableValueColumn, { flex: 1 }]}>
                  <StyledText
                    style={[
                      themedLocalStyles.tableValueText,
                      !picker.reminderDate && { color: colors.PLACEHOLDER },
                    ]}
                  >
                    {picker.reminderDate
                      ? formatTimeOnly(picker.reminderDate)
                      : t("select_placeholder")}
                  </StyledText>
                </View>
              </TouchableOpacity>
              {picker.reminderDate && (
                <TouchableOpacity
                  onPress={() => picker.setReminderDate(undefined)}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  style={{ paddingLeft: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.SECTION_TEXT}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View
            style={{
              width: "100%",
              paddingHorizontal: 4,
              marginTop: 0,
              marginBottom: 4,
            }}
          >
            <StyledText
              style={{
                fontSize: 9.5,
                color: colors.SECTION_TEXT,
                opacity: 0.7,
                textAlign: "center",
                lineHeight: 10,
              }}
            >
              {t("reminder_hint")}
            </StyledText>
          </View>

          {/* Voice Interaction Modal */}
          <StyledModal isOpen={isRecording || isAnalyzing} onClose={() => {}}>
            <View
              style={[
                themedModalStyles.modalContainer,
                { minHeight: 280, paddingVertical: 30 },
              ]}
            >
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
                              outputRange: [0.4, 1],
                            }),
                          },
                        ]}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={themedLocalStyles.analyzingLoader}>
                    <ActivityIndicator
                      color={colors.CHECKBOX_SUCCESS}
                      size="large"
                    />
                  </View>
                )}
              </View>

              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View
                  style={[
                    themedLocalStyles.micCircle,
                    isRecording && { borderColor: "#ea4335" },
                  ]}
                >
                  <Ionicons
                    name={isRecording ? "mic" : "cloud-upload"}
                    size={32}
                    color={
                      isRecording ? "#ea4335" : colors.PRIMARY_ACTIVE_BUTTON
                    }
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
                            outputRange: ["0%", "100%"],
                          }),
                        },
                      ]}
                    />
                  </View>
                  <StyledText style={themedLocalStyles.timerText}>
                    00:
                    {recordingTime < 10 ? `0${recordingTime}` : recordingTime} /
                    00:30
                  </StyledText>
                </View>
              )}

              {isRecording && (
                <TouchableOpacity
                  onPress={handleVoiceInput}
                  style={themedLocalStyles.stopRecordingButton}
                >
                  <View style={themedLocalStyles.stopIcon} />
                  <StyledText style={themedLocalStyles.stopButtonText}>
                    {t("close")}
                  </StyledText>
                </TouchableOpacity>
              )}
            </View>
          </StyledModal>

          {/* Android Pickers */}
          {Platform.OS === "android" && picker.showDatePicker && (
            <DateTimePicker
              value={picker.reminderDate || new Date()}
              mode="date"
              display="default"
              onChange={picker.onChangeDate}
              minimumDate={new Date()}
              locale={picker.getLocale()}
            />
          )}

          {Platform.OS === "android" && picker.showTimePicker && (
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
          {Platform.OS === "ios" && (
            <StyledModal
              isOpen={picker.showDatePicker || picker.showTimePicker}
              onClose={picker.closePickers}
            >
              <View style={themedModalStyles.modalContainer}>
                <View
                  style={[
                    themedModalStyles.iconContainer,
                    {
                      backgroundColor: colors.TAB_BAR,
                      shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 2,
                      elevation: 2,
                    },
                  ]}
                >
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

                <View
                  style={{
                    width: "100%",
                    height: 150,
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <DateTimePicker
                    value={picker.tempDate || picker.reminderDate || new Date()}
                    mode={picker.showDatePicker ? "date" : "time"}
                    display="spinner"
                    onChange={
                      picker.showDatePicker
                        ? picker.onChangeDate
                        : picker.onChangeTime
                    }
                    minimumDate={picker.showDatePicker ? new Date() : undefined}
                    locale={picker.getLocale()}
                    textColor={colors.PRIMARY_TEXT}
                    themeVariant={theme}
                    style={{ width: "100%", transform: [{ scale: 0.85 }] }}
                  />
                </View>

                <View
                  style={[
                    themedModalStyles.buttonsContainer,
                    { marginTop: 20 },
                  ]}
                >
                  <StyledButton
                    label={picker.showTimePicker ? t("back") : t("close")}
                    onPress={
                      picker.showTimePicker
                        ? picker.goBackToDatePicker
                        : picker.closePickers
                    }
                    variant="dark_button"
                    style={{ flex: 1 }}
                  />
                  <StyledButton
                    label={
                      picker.showDatePicker
                        ? picker.reminderDate
                          ? t("back")
                          : t("next")
                        : t("save")
                    }
                    onPress={
                      picker.showDatePicker
                        ? picker.reminderDate
                          ? picker.goBackToTimePicker
                          : picker.confirmDateIOS
                        : picker.confirmTimeIOS
                    }
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
          <StyledModal
            isOpen={picker.showPermissionModal}
            onClose={() => picker.setShowPermissionModal(false)}
          >
            <View style={themedModalStyles.modalContainer}>
              <View
                style={[
                  themedModalStyles.iconContainer,
                  {
                    backgroundColor: colors.TAB_BAR,
                    shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 2,
                  },
                ]}
              >
                <Ionicons
                  name="notifications"
                  size={28}
                  color={colors.PRIMARY_ACTIVE_BUTTON}
                />
              </View>

              <StyledText style={themedModalStyles.headerText}>
                {t("enable_notifications")}
              </StyledText>

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
                    dispatch(
                      updateAppSetting({
                        todoNotifications: true,
                      }),
                    );
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

          <OSPermissionModal
            isOpen={picker.showOSPermissionModal}
            onClose={() => picker.setShowOSPermissionModal(false)}
          />

          {/* Past Date Alert Modal */}
          <StyledModal
            isOpen={picker.showPastDateAlert}
            onClose={() => picker.setShowPastDateAlert(false)}
          >
            <View style={themedModalStyles.modalContainer}>
              <View
                style={[
                  themedModalStyles.iconContainer,
                  {
                    backgroundColor: colors.TAB_BAR,
                    shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 2,
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle"
                  size={28}
                  color={colors.PRIMARY_ACTIVE_BUTTON}
                />
              </View>

              <StyledText style={themedModalStyles.headerText}>
                {t("attention")}
              </StyledText>

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
  );
};

export default AddTodoModal;
