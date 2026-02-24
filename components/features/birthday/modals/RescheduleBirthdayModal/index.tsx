import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { getStyles as getViewStyles } from "../BirthdayViewModal/styles";
import { getStyles as getLocalStyles } from "./styles";

type RescheduleBirthdayModalProps = {
    isOpen: boolean;
    onClose: () => void;
    initialDate: string;
    onReschedule: (date: Date) => void;
};

export function RescheduleBirthdayModal({
    isOpen,
    onClose,
    initialDate,
    onReschedule,
}: RescheduleBirthdayModalProps) {
    const { t, colors, theme, isDark, lang } = useTheme();
    const styles = useMemo(() => getViewStyles(colors, isDark), [colors, isDark]);
    const localStyles = useMemo(() => getLocalStyles(colors, isDark), [colors, isDark]);
    const [date, setDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    useEffect(() => {
        if (isOpen && initialDate) {
            const bDate = new Date(initialDate);
            const now = new Date();
            // Default to this year's birthday at 09:00
            const targetDate = new Date(now.getFullYear(), bDate.getMonth(), bDate.getDate(), 9, 0, 0);
            if (targetDate < now) {
                targetDate.setFullYear(now.getFullYear() + 1);
            }
            setDate(targetDate);
        }
    }, [isOpen, initialDate]);

    const onSave = () => {
        onReschedule(date);
        onClose();
    };

    const onDateChange = (_event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDate(selectedDate);
        }
        if (Platform.OS === "android") {
            setShowPicker(false);
        }
    };

    const formatDateOnly = (d: Date) => {
        const day = d.getDate().toString().padStart(2, "0");
        const months = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
        const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const ruMonths = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

        const monthNames = lang === 'az' ? months : lang === 'ru' ? ruMonths : enMonths;
        const month = monthNames[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const formatTimeOnly = (d: Date) => {
        const hours = d.getHours().toString().padStart(2, "0");
        const minutes = d.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    const setQuickTime = (hours: number) => {
        const newDate = new Date(date);
        newDate.setHours(hours, 0, 0, 0);
        setDate(newDate);
    };

    return (
        <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true}>
            <View style={styles.container}>
                <View
                    style={[
                        modalStyles.iconContainer,
                        localStyles.iconContainer,
                    ]}
                >
                    <Ionicons name="notifications-outline" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                </View>

                <StyledText style={styles.headerText}>
                    {t("edit")}
                </StyledText>

                <View style={modalStyles.divider} />

                {/* Quick Presets */}
                <View style={localStyles.presetsRow}>
                    {[
                        { h: 9, label: t("preset_morning") },
                        { h: 14, label: t("preset_afternoon") },
                        { h: 20, label: t("preset_evening") }
                    ].map(preset => (
                        <TouchableOpacity
                            key={preset.h}
                            onPress={() => setQuickTime(preset.h)}
                            style={[
                                localStyles.presetButton,
                                {
                                    backgroundColor: date.getHours() === preset.h ? colors.PRIMARY_ACTIVE_BUTTON : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                }
                            ]}
                        >
                            <StyledText style={[
                                localStyles.presetText,
                                { color: date.getHours() === preset.h ? '#FFF' : colors.SECTION_TEXT }
                            ]}>
                                {preset.label}
                            </StyledText>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.tableContainer}>
                    <TouchableOpacity
                        style={styles.tableRow}
                        onPress={() => {
                            setPickerMode('date');
                            setShowPicker(true);
                        }}
                    >
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="calendar-outline" size={18} color={colors.SECTION_TEXT} />
                            <StyledText style={styles.tableLabelText}>{t("date")}</StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <StyledText style={styles.tableValueText}>
                                {formatDateOnly(date)}
                            </StyledText>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tableRow, styles.tableRowBorder]}
                        onPress={() => {
                            setPickerMode('time');
                            setShowPicker(true);
                        }}
                    >
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="time-outline" size={18} color={colors.SECTION_TEXT} />
                            <StyledText style={styles.tableLabelText}>{t("time")}</StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <StyledText style={styles.tableValueText}>
                                {formatTimeOnly(date)}
                            </StyledText>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Android Picker */}
                {Platform.OS === "android" && showPicker && (
                    <DateTimePicker
                        value={date}
                        mode={pickerMode}
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                    />
                )}

                {/* iOS Picker Modal */}
                {Platform.OS === "ios" && (
                    <StyledModal isOpen={showPicker} onClose={() => setShowPicker(false)}>
                        <View style={styles.container}>
                            <View style={[modalStyles.iconContainer, {
                                backgroundColor: colors.SECONDARY_BACKGROUND,
                                shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 2,
                                elevation: 2
                            }]}>
                                <Ionicons
                                    name={pickerMode === 'date' ? "calendar-outline" : "time-outline"}
                                    size={28}
                                    color={colors.PRIMARY_ACTIVE_BUTTON}
                                />
                            </View>
                            <StyledText style={styles.headerText}>
                                {pickerMode === 'date' ? t("date") : t("time")}
                            </StyledText>
                            <View style={modalStyles.divider} />
                            <DateTimePicker
                                value={date}
                                mode={pickerMode}
                                display="spinner"
                                onChange={onDateChange}
                                minimumDate={new Date()}
                                themeVariant={theme}
                                style={{ height: 180, width: '100%' }}
                            />
                            <View style={[modalStyles.buttonsContainer, { marginTop: 20 }]}>
                                <StyledButton
                                    label={t("save")}
                                    onPress={() => setShowPicker(false)}
                                    variant="dark_button"
                                />
                            </View>
                        </View>
                    </StyledModal>
                )}

                <View style={[modalStyles.buttonsContainer, localStyles.buttonsContainerMargin]}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                    <StyledButton
                        label={t("save")}
                        onPress={onSave}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
}

export default RescheduleBirthdayModal;
