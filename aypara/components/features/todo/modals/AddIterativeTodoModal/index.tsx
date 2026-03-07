import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { setupCalendarLocales } from "@/config/calendar";
import {
    checkSystemNotifications,
    schedulePushNotification,
} from "@/constants/notifications";
import { TODO_CATEGORIES } from "@/constants/todo";
import { getShortMonthName } from "@/helpers/date";
import { analyzeAudio } from "@/helpers/gemini";
import { useDateTimePicker } from "@/hooks/useDateTimePicker";
import { useTheme } from "@/hooks/useTheme";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import DateSelectionModal from "@/layout/Modals/DateSelectionModal";
import IOSPickerModal from "@/layout/Modals/IOSPickerModal";
import NotificationPermissionModal from "@/layout/Modals/NotificationPermissionModal";
import OSPermissionModal from "@/layout/Modals/OSPermissionModal";
import PastDateModal from "@/layout/Modals/PastDateModal";
import TimeSelectionModal from "@/layout/Modals/TimeSelectionModal";
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
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    UIManager,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { getAddStyles } from "./styles";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AddIterativeTodoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    title: string,
    reminder?: string,
    notificationId?: string,
    category?: string,
    iterativeDates?: { date: string; notificationId?: string }[],
  ) => void;
  categoryTitle?: string;
  categoryIcon?: string;
  initialCategory?: string;
};

const AddIterativeTodoModal: React.FC<AddIterativeTodoModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categoryTitle,
  categoryIcon,
  initialCategory,
}) => {
  const { t, colors, isDark, todoNotifications, lang } = useTheme();
  const dispatch = useAppDispatch();

  const themedLocalStyles = useMemo(
    () => getAddStyles(colors, isDark),
    [colors, isDark],
  );

  const [title, setTitle] = useState("");
  const [inputError, setInputError] = useState(false);
  const categoryScrollRef = useRef<ScrollView>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || "personal",
  );

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    setupCalendarLocales(lang);
  }, [lang]);

  const toggleDate = (dateString: string) => {
    setSelectedDates((prev) => {
      if (prev.includes(dateString))
        return prev.filter((d) => d !== dateString);
      return [...prev, dateString];
    });
  };

  const markedDates = useMemo(() => {
    const marks: any = {};
    selectedDates.forEach((d) => {
      marks[d] = {
        selected: true,
        selectedColor: colors.TINT,
        textColor: "#ffffff",
      };
    });
    return marks;
  }, [selectedDates, colors.TINT]);

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

    // Determine the base time from dateOverride (voice) or picker
    const timeToUse = dateOverride || picker.reminderDate;

    if (!timeToUse) {
      picker.setShowTimeSelectionAlert(true);
      return;
    }

    if (selectedDates.length < 2) {
      picker.setShowDateSelectionAlert(true);
      return;
    }

    const osGranted = await checkSystemNotifications();
    if (!osGranted) {
      picker.setShowOSPermissionModal(true);
      return;
    }

    if (!todoNotifications) {
      picker.setShowPermissionModal(true);
      return;
    }

    // Build all candidate dates array including their times
    const allParsedDates = [...selectedDates].sort().map((ds) => {
      // ds is 'YYYY-MM-DD', but new Date('YYYY-MM-DD') creates it in UTC.
      // We need it in local.
      const parts = ds.split("-").map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);

      d.setHours(timeToUse.getHours(), timeToUse.getMinutes(), 0, 0);
      return d;
    });

    const now = new Date();
    // Validate that ALL selected dates with their specific time are in the future
    for (const d of allParsedDates) {
      if (d < now) {
        picker.setPickerToReopen(null);
        picker.setShowPastDateAlert(true);
        return;
      }
    }

    const iterativeDatesArray: { date: string; notificationId?: string }[] = [];

    if (todoNotifications) {
      const displayTitle = categoryTitle || t("notifications_todo");

      // we must loop through each date and schedule push notifications
      for (const d of allParsedDates) {
        let nid: string | undefined = undefined;
        try {
          nid = await schedulePushNotification(
            displayTitle,
            title,
            d,
            categoryIcon,
          );
          if (nid) {
            dispatch(
              addNotification({
                id: nid,
                title: displayTitle,
                body: title,
                date: d.toISOString(),
                categoryIcon: categoryIcon,
              }),
            );
          }
        } catch {
          // silently fail if one notification fails
        }
        iterativeDatesArray.push({
          date: d.toISOString(),
          notificationId: nid,
        });
      }
    } else {
      // Just record dates without notification ids
      for (const d of allParsedDates) {
        iterativeDatesArray.push({
          date: d.toISOString(),
          notificationId: undefined,
        });
      }
    }

    // Pass the first date as the default reminder, and pass ALL dates to iterativeDates for internal tracking
    if (iterativeDatesArray.length > 0) {
      onAdd(
        title,
        iterativeDatesArray[0].date,
        iterativeDatesArray[0].notificationId,
        selectedCategory,
        iterativeDatesArray, // Pass full array instead of restDates
      );
    }

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
      setSelectedCategory(initialCategory || "personal");
      setSelectedDates([]);
      setIsCalendarOpen(false);
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

  const getBalancedRows = (items: string[], maxPerRow: number = 5) => {
    const n = items.length;
    if (n === 0) return [];

    const rows = [];
    const rowCount = Math.ceil(n / maxPerRow);
    let start = 0;

    for (let i = 0; i < rowCount; i++) {
      const rowSize = Math.ceil((n - start) / (rowCount - i));
      rows.push(items.slice(start, start + rowSize));
      start += rowSize;
    }
    return rows;
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
          <View style={themedLocalStyles.headerRow}>
            <View style={themedLocalStyles.headerIconContainer}>
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

          <View style={themedLocalStyles.divider} />

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
              keyboardShouldPersistTaps="handled"
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
                    onPress={() => {
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.spring,
                      );
                      setSelectedCategory(cat.id);
                    }}
                    activeOpacity={0.7}
                    style={[
                      themedLocalStyles.categoryItem,
                      {
                        backgroundColor:
                          selectedCategory === cat.id
                            ? colors.REMINDER + (isDark ? "30" : "15")
                            : colors.SECTION_TEXT + (isDark ? "10" : "08"),
                        borderColor:
                          selectedCategory === cat.id
                            ? colors.REMINDER
                            : colors.SECTION_TEXT + (isDark ? "20" : "15"),
                        borderWidth: selectedCategory === cat.id ? 0.5 : 0.2,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={
                        selectedCategory === cat.id
                          ? colors.REMINDER
                          : colors.SECTION_TEXT
                      }
                    />
                    <StyledText
                      style={{
                        fontSize: 10,
                        color:
                          selectedCategory === cat.id
                            ? colors.REMINDER
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
          <View style={[themedLocalStyles.tableContainer, { marginTop: 3 }]}>
            <TouchableOpacity
              style={[
                themedLocalStyles.tableRow,
                { height: "auto", minHeight: 48, paddingVertical: 10 },
              ]}
              onPress={() => setIsCalendarOpen(true)}
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
              <View
                style={[themedLocalStyles.tableValueColumn, { paddingLeft: 4 }]}
              >
                {selectedDates.length === 0 ? (
                  <StyledText
                    style={[
                      themedLocalStyles.tableValueText,
                      { color: colors.PLACEHOLDER },
                    ]}
                  >
                    {t("select_placeholder")}
                  </StyledText>
                ) : (
                  <View
                    style={{ width: "100%", gap: 6, alignItems: "flex-end" }}
                  >
                    {getBalancedRows([...selectedDates].sort(), 5).map(
                      (row, rowIndex) => (
                        <View
                          key={rowIndex}
                          style={themedLocalStyles.miniCalendarWrapper}
                        >
                          {row.map((d) => {
                            const dateObj = new Date(d + "T12:00:00");
                            return (
                              <View
                                key={d}
                                style={[
                                  themedLocalStyles.miniCalendarContainer,
                                  {
                                    backgroundColor: isDark
                                      ? "rgba(255,255,255,0.05)"
                                      : "#ffffff",
                                    borderColor:
                                      colors.PRIMARY_ACTIVE_BUTTON + "40",
                                  },
                                ]}
                              >
                                <View
                                  style={[
                                    themedLocalStyles.miniCalendarHeader,
                                    {
                                      backgroundColor:
                                        colors.PRIMARY_ACTIVE_BUTTON,
                                    },
                                  ]}
                                >
                                  <StyledText
                                    style={
                                      themedLocalStyles.miniCalendarHeaderText
                                    }
                                  >
                                    {getShortMonthName(dateObj, lang)}
                                  </StyledText>
                                </View>
                                <View
                                  style={themedLocalStyles.miniCalendarBody}
                                >
                                  <StyledText
                                    style={[
                                      themedLocalStyles.miniCalendarBodyText,
                                      { color: colors.PRIMARY_TEXT },
                                    ]}
                                  >
                                    {dateObj
                                      .getDate()
                                      .toString()
                                      .padStart(2, "0")}
                                  </StyledText>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      ),
                    )}
                  </View>
                )}
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
                onPress={() => picker.startReminderFlow("time")}
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
            <View style={themedLocalStyles.voiceModalContainer}>
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
              minimumDate={picker.todayStart}
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
          <IOSPickerModal picker={picker} />

          {/* Calendar Modal */}
          <StyledModal
            isOpen={isCalendarOpen}
            onClose={() => setIsCalendarOpen(false)}
          >
            <View
              style={{
                width: "100%",
                backgroundColor: colors.SECONDARY_BACKGROUND,
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Calendar
                minDate={new Date().toISOString().split("T")[0]}
                onDayPress={(day: any) => toggleDate(day.dateString)}
                markedDates={markedDates}
                theme={{
                  calendarBackground: colors.SECONDARY_BACKGROUND,
                  textSectionTitleColor: colors.SECTION_TEXT,
                  selectedDayBackgroundColor: colors.TINT,
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: colors.TINT,
                  dayTextColor: colors.PRIMARY_TEXT,
                  textDisabledColor: colors.PLACEHOLDER,
                  dotColor: colors.TINT,
                  selectedDotColor: "#ffffff",
                  arrowColor: colors.TINT,
                  monthTextColor: colors.PRIMARY_TEXT,
                  indicatorColor: colors.TINT,
                  textDayFontWeight: "500",
                  textMonthFontWeight: "bold",
                  textDayHeaderFontWeight: "600",
                  textDayFontSize: 15,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13,
                }}
              />
              <StyledButton
                label={t("save")}
                onPress={() => setIsCalendarOpen(false)}
                variant="dark_button"
                style={{ marginTop: 20 }}
              />
            </View>
          </StyledModal>

          <View style={[themedLocalStyles.buttonsContainer, { marginTop: 8 }]}>
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
          <NotificationPermissionModal
            isOpen={picker.showPermissionModal}
            onClose={() => picker.setShowPermissionModal(false)}
            onCancel={() => picker.setReminderDate(undefined)}
            onConfirm={() => {
              dispatch(updateAppSetting({ todoNotifications: true }));
              picker.setShowPermissionModal(false);
              setTimeout(() => {
                picker.proceedWithReminder();
              }, 300);
            }}
          />

          <OSPermissionModal
            isOpen={picker.showOSPermissionModal}
            onClose={() => picker.setShowOSPermissionModal(false)}
          />

          <PastDateModal
            isOpen={picker.showPastDateAlert}
            onClose={picker.closePastDateAlert}
          />

          <TimeSelectionModal
            isOpen={picker.showTimeSelectionAlert}
            onClose={() => picker.setShowTimeSelectionAlert(false)}
          />

          <DateSelectionModal
            isOpen={picker.showDateSelectionAlert}
            onClose={() => picker.setShowDateSelectionAlert(false)}
          />
        </View>
      </TouchableWithoutFeedback>
    </StyledModal>
  );
};

export default AddIterativeTodoModal;
