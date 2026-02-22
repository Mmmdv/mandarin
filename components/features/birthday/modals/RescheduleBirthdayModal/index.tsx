import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { getStyles } from "../AddBirthdayModal/styles";

const BIRTHDAY_PRIMARY = "#4F46E5";

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
    const { t, colors, theme, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
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
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
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
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={styles.container}>
                <View
                    style={[
                        modalStyles.iconContainer,
                        {
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                            shadowColor: BIRTHDAY_PRIMARY,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                            elevation: 2
                        },
                    ]}
                >
                    <Ionicons name="calendar-outline" size={28} color={BIRTHDAY_PRIMARY} />
                </View>

                <StyledText style={styles.headerText}>
                    {t("reschedule")}
                </StyledText>

                <View style={modalStyles.divider} />

                {/* Quick Presets */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, width: '100%' }}>
                    {[
                        { h: 9, label: t("preset_morning") },
                        { h: 14, label: t("preset_afternoon") },
                        { h: 20, label: t("preset_evening") }
                    ].map(preset => (
                        <TouchableOpacity
                            key={preset.h}
                            onPress={() => setQuickTime(preset.h)}
                            style={{
                                flex: 1,
                                padding: 8,
                                borderRadius: 12,
                                backgroundColor: date.getHours() === preset.h ? BIRTHDAY_PRIMARY : colors.PRIMARY_BORDER,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <StyledText style={{ fontSize: 10, fontWeight: '700', color: date.getHours() === preset.h ? '#FFF' : colors.PRIMARY_TEXT, textAlign: 'center' }}>
                                {preset.label}
                            </StyledText>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginBottom: 16 }}>
                    <View style={{ flex: 1.5, gap: 4 }}>
                        <StyledText style={[styles.label, { color: colors.SECTION_TEXT }]}>{t("date")}</StyledText>
                        <StyledButton
                            label={formatDateOnly(date)}
                            onPress={() => {
                                setPickerMode('date');
                                setShowPicker(true);
                            }}
                            variant="gray_button"
                            style={{ height: 48, borderRadius: 16 }}
                        />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                        <StyledText style={[styles.label, { color: colors.SECTION_TEXT }]}>{t("time")}</StyledText>
                        <StyledButton
                            label={formatTimeOnly(date)}
                            onPress={() => {
                                setPickerMode('time');
                                setShowPicker(true);
                            }}
                            variant="gray_button"
                            style={{ height: 48, borderRadius: 16 }}
                        />
                    </View>
                </View>

                {(showPicker || Platform.OS === "ios") && (
                    <View style={{ width: '100%', marginBottom: 16 }}>
                        <DateTimePicker
                            value={date}
                            mode={pickerMode}
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={onDateChange}
                            minimumDate={new Date()}
                            themeVariant={theme}
                            style={Platform.OS === "ios" ? { height: 120, width: '100%' } : undefined}
                        />
                    </View>
                )}

                <View style={[modalStyles.buttonsContainer, { marginTop: 10 }]}>
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

// export default RescheduleBirthdayModal;
