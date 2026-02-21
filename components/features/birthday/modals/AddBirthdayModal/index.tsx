import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    View
} from "react-native";

// ─── Əsas səhifədəki birthday kartına uyğun rəng paleti ───
const BIRTHDAY_PRIMARY = "#9D6506";
const BIRTHDAY_LIGHT = "#D4880F";

type AddBirthdayModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (
        name: string,
        date: string,
        nickname?: string,
        phone?: string,
        note?: string
    ) => void;
};

const AddBirthdayModal: React.FC<AddBirthdayModalProps> = ({
    isOpen,
    onClose,
    onAdd,
}) => {
    const { t, colors, theme } = useTheme();
    const router = useRouter();
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [dateError, setDateError] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isOpen) {
            setName("");
            setNickname("");
            setPhone("");
            setNote("");
            setDate(undefined);
            setNameError(false);
            setDateError(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (nameError && name) setNameError(false);
    }, [name]);

    const onPressAdd = () => {
        let hasError = false;
        if (!name.trim()) {
            setNameError(true);
            hasError = true;
        }
        if (!date) {
            setDateError(true);
            hasError = true;
        }
        if (hasError) return;

        onAdd(
            name.trim(),
            date!.toISOString(),
            nickname.trim() || undefined,
            phone.trim() || undefined,
            note.trim() || undefined
        );
        onClose();
    };

    const onDateChange = (_event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setDate(selectedDate);
            setDateError(false);
        }
    };

    const formatDate = (d: Date) => {
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={modalStyles.modalContainer}>
                    <View
                        style={[
                            modalStyles.iconContainer,
                            {
                                backgroundColor: colors.SECONDARY_BACKGROUND,
                                shadowColor: BIRTHDAY_PRIMARY,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 5,
                            },
                        ]}
                    >
                        <Ionicons name="gift" size={28} color={BIRTHDAY_LIGHT} />
                    </View>

                    <StyledText style={modalStyles.headerText}>
                        {t("birthday_add")}
                    </StyledText>

                    <View style={modalStyles.divider} />

                    <ScrollView
                        style={{ width: '100%', maxHeight: 400 }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ gap: 16, paddingBottom: 10 }}
                    >
                        {/* 1. Name Input */}
                        <View style={styles.inputGroup}>
                            <StyledText style={[styles.label, { color: colors.SECTION_TEXT }]}>
                                {t("birthday_name")} *
                            </StyledText>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: colors.PRIMARY_TEXT,
                                        backgroundColor: colors.PRIMARY_BACKGROUND,
                                        borderColor: nameError ? "#FF6B6B" : colors.PRIMARY_BORDER_DARK,
                                    },
                                ]}
                                placeholder={t("birthday_name_placeholder")}
                                placeholderTextColor={colors.PLACEHOLDER}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* 2. Phone Input (Optional) */}
                        <View style={styles.inputGroup}>
                            <StyledText style={[styles.label, { color: colors.SECTION_TEXT }]}>
                                {t("birthday_phone")}
                            </StyledText>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: colors.PRIMARY_TEXT,
                                        backgroundColor: colors.PRIMARY_BACKGROUND,
                                        borderColor: colors.PRIMARY_BORDER_DARK,
                                    },
                                ]}
                                placeholder="+994 -- --- -- --"
                                placeholderTextColor={colors.PLACEHOLDER}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* 3. Date Picker (Mandatory) */}
                        <View style={styles.inputGroup}>
                            <StyledText style={[styles.label, { color: colors.SECTION_TEXT }]}>
                                {t("birthday_date")} *
                            </StyledText>
                            <View
                                style={[
                                    styles.dateButton,
                                    {
                                        backgroundColor: colors.PRIMARY_BACKGROUND,
                                        borderColor: dateError ? "#FF6B6B" : colors.PRIMARY_BORDER_DARK,
                                    },
                                ]}
                            >
                                {Platform.OS === "android" ? (
                                    <StyledText
                                        style={[
                                            styles.dateText,
                                            { color: date ? colors.PRIMARY_TEXT : colors.PLACEHOLDER },
                                        ]}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        {date ? formatDate(date) : t("birthday_date")}
                                    </StyledText>
                                ) : (
                                    <DateTimePicker
                                        value={date || new Date(2000, 0, 1)}
                                        mode="date"
                                        display="compact"
                                        onChange={onDateChange}
                                        maximumDate={new Date()}
                                        themeVariant={theme}
                                        style={{ flex: 1 }}
                                    />
                                )}
                                <Ionicons name="calendar-outline" size={20} color={BIRTHDAY_LIGHT} />
                            </View>
                        </View>

                        {/* 4. Nickname Input (Müraciət forması) */}
                        <View style={styles.inputGroup}>
                            <StyledText style={[styles.label, { color: colors.SECTION_TEXT }]}>
                                {t("birthday_nickname")}
                            </StyledText>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: colors.PRIMARY_TEXT,
                                        backgroundColor: colors.PRIMARY_BACKGROUND,
                                        borderColor: colors.PRIMARY_BORDER_DARK,
                                    },
                                ]}
                                placeholder={t("birthday_nickname_placeholder")}
                                placeholderTextColor={colors.PLACEHOLDER}
                                value={nickname}
                                onChangeText={setNickname}
                            />
                        </View>

                        {/* 5. Note Input (Qeyd) */}
                        <View style={styles.inputGroup}>
                            <StyledText style={[styles.label, { color: colors.SECTION_TEXT }]}>
                                {t("birthday_note")}
                            </StyledText>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.noteInput,
                                    {
                                        color: colors.PRIMARY_TEXT,
                                        backgroundColor: colors.PRIMARY_BACKGROUND,
                                        borderColor: colors.PRIMARY_BORDER_DARK,
                                    },
                                ]}
                                placeholder={t("birthday_note_placeholder")}
                                placeholderTextColor={colors.PLACEHOLDER}
                                value={note}
                                onChangeText={setNote}
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        {/* Android Date Picker */}
                        {Platform.OS === "android" && showDatePicker && (
                            <DateTimePicker
                                value={date || new Date(2000, 0, 1)}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </ScrollView>

                    <View style={modalStyles.buttonsContainer}>
                        <StyledButton
                            label={t("cancel")}
                            onPress={onClose}
                            variant="dark_button"
                        />
                        <StyledButton
                            label={t("add")}
                            onPress={onPressAdd}
                            variant="dark_button"
                            disabled={!name || !date}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </StyledModal>
    );
};

const styles = StyleSheet.create({
    inputGroup: {
        width: "100%",
        gap: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: "500",
        marginLeft: 4,
    },
    input: {
        width: "100%",
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 14,
        fontSize: 14,
    },
    noteInput: {
        height: 60,
        textAlignVertical: "top",
        paddingTop: 10,
    },
    dateButton: {
        width: "100%",
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dateText: {
        fontSize: 14,
        flex: 1,
    },
});

export default AddBirthdayModal;
