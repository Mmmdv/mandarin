import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Contacts from 'expo-contacts';
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Keyboard,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { getStyles } from "./styles";

// ─── Əsas səhifədəki birthday kartına uyğun rəng paleti ───
const BIRTHDAY_PRIMARY = "#D4880F";
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
    const { t, colors, theme, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
    const router = useRouter();
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [dateError, setDateError] = useState(false);
    const [contactSelected, setContactSelected] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

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
            setContactSelected(false);
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
            undefined,
            phone.trim() || undefined,
            undefined
        );
        onClose();
    };

    const handleOpenDatePicker = () => {
        setShowDatePicker(true);
    };

    const onDateChange = (_event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setDate(selectedDate);
            setDateError(false);
        }
        if (Platform.OS === "android") {
            setShowDatePicker(false);
        }
    };

    const handlePickContact = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            const contact = await Contacts.presentContactPickerAsync();
            if (contact) {
                const contactName = contact.name ||
                    [contact.firstName, contact.lastName].filter(Boolean).join(' ') ||
                    "";
                setName(contactName);
                if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                    setPhone(contact.phoneNumbers[0].number || "");
                }
                setContactSelected(true);
            }
        }
    };

    const handleClearContact = () => {
        setName("");
        setPhone("");
        setContactSelected(false);
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
                <View style={styles.container}>
                    <View
                        style={[
                            modalStyles.iconContainer,
                            {
                                backgroundColor: colors.SECONDARY_BACKGROUND,
                                shadowColor: "#9D6506",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 2,
                                elevation: 2
                            },
                        ]}
                    >
                        <Ionicons name="gift" size={28} color={BIRTHDAY_PRIMARY} />
                    </View>

                    <StyledText style={styles.headerText}>
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
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 4 }}>
                                <StyledText style={[styles.label, { color: colors.SECTION_TEXT }]}>
                                    {t("birthday_name")} *
                                </StyledText>
                                <TouchableOpacity
                                    onPress={contactSelected ? handleClearContact : handlePickContact}
                                    activeOpacity={0.7}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 4,
                                        backgroundColor: contactSelected ? (isDark ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.05)') : 'transparent',
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderRadius: 8
                                    }}
                                >
                                    <Ionicons
                                        name={contactSelected ? "close-circle" : "person-add-outline"}
                                        size={16}
                                        color={contactSelected ? "#FF6B6B" : BIRTHDAY_PRIMARY}
                                    />
                                    <StyledText style={{
                                        fontSize: 11,
                                        fontWeight: '700',
                                        color: contactSelected ? "#FF6B6B" : BIRTHDAY_PRIMARY
                                    }}>
                                        {contactSelected ? t("clear") || "Təmizlə" : t("birthday_pick_contact")}
                                    </StyledText>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: colors.PRIMARY_TEXT,
                                        backgroundColor: colors.PRIMARY_BACKGROUND,
                                        borderColor: colors.PRIMARY_BORDER_DARK,
                                    },
                                    isFocused && styles.inputFocused,
                                    nameError && styles.inputError,
                                ]}
                                placeholder={t("birthday_name_placeholder")}
                                placeholderTextColor={colors.PLACEHOLDER}
                                value={name}
                                onChangeText={setName}
                                onFocus={() => {
                                    setIsFocused(true);
                                    setNameError(false);
                                }}
                                onBlur={() => setIsFocused(false)}
                            />
                        </View>

                        {/* 2. Phone Input - ONLY visible if contact picked */}
                        {contactSelected && (
                            <View style={styles.inputGroup}>
                                <StyledText style={[styles.label, { color: colors.SECTION_TEXT }]}>
                                    {t("birthday_phone")}
                                </StyledText>
                                <View style={{ position: 'relative', justifyContent: 'center' }}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.PLACEHOLDER,
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                borderColor: colors.PRIMARY_BORDER_DARK,
                                                paddingRight: 40, // Space for the lock icon
                                            },
                                        ]}
                                        placeholder="+994 -- --- -- --"
                                        placeholderTextColor={colors.PLACEHOLDER}
                                        value={phone}
                                        editable={false}
                                    />
                                    <View style={{ position: 'absolute', right: 14 }}>
                                        <Ionicons name="lock-closed" size={16} color={colors.PLACEHOLDER} style={{ opacity: 0.5 }} />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* 3. Date Picker (Mandatory) */}
                        <View style={styles.inputGroup}>
                            <StyledText style={[styles.label, { color: colors.SECTION_TEXT }]}>
                                {t("birthday_date")} *
                            </StyledText>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={handleOpenDatePicker}
                                style={[
                                    styles.dateButton,
                                    {
                                        backgroundColor: colors.PRIMARY_BACKGROUND,
                                        borderColor: colors.PRIMARY_BORDER_DARK,
                                    },
                                    dateError && styles.inputError,
                                ]}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 12,
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Ionicons name="calendar-clear" size={18} color={BIRTHDAY_PRIMARY} />
                                    </View>
                                    <StyledText style={{
                                        fontSize: 14,
                                        color: date ? colors.PRIMARY_TEXT : colors.PLACEHOLDER
                                    }}>
                                        {date ? formatDate(date) : t("birthday_date")}
                                    </StyledText>
                                </View>
                                <Ionicons name="chevron-expand-outline" size={18} color={colors.PLACEHOLDER} />
                            </TouchableOpacity>
                        </View>

                        {/* Android Date Picker */}
                        {Platform.OS === "android" && showDatePicker && (
                            <DateTimePicker
                                value={date || new Date(2000, 0, 1)}
                                mode="date"
                                display="spinner"
                                onChange={onDateChange}
                                maximumDate={new Date()}
                            />
                        )}

                        {/* iOS Date Picker Modal */}
                        {Platform.OS === "ios" && (
                            <StyledModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}>
                                <View style={[modalStyles.modalContainer, {
                                    backgroundColor: colors.SECONDARY_BACKGROUND,
                                    borderRadius: 30,
                                    padding: 24,
                                    width: 340,
                                    maxWidth: '90%',
                                    alignItems: 'center'
                                }]}>
                                    <View style={[modalStyles.iconContainer, {
                                        backgroundColor: colors.SECONDARY_BACKGROUND,
                                        shadowColor: "#D4880F",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 2,
                                        elevation: 2
                                    }]}>
                                        <Ionicons name="time" size={28} color={BIRTHDAY_PRIMARY} />
                                    </View>
                                    <StyledText style={styles.headerText}>{t("birthday_date")}</StyledText>
                                    <View style={modalStyles.divider} />
                                    <DateTimePicker
                                        value={date || new Date(2000, 0, 1)}
                                        mode="date"
                                        display="spinner"
                                        onChange={onDateChange}
                                        maximumDate={new Date()}
                                        themeVariant={theme}
                                        style={{ height: 180, width: '100%' }}
                                    />
                                    <View style={[modalStyles.buttonsContainer, { marginTop: 20 }]}>
                                        <StyledButton
                                            label={t("save")}
                                            onPress={() => {
                                                if (!date) {
                                                    setDate(new Date(2000, 0, 1));
                                                    setDateError(false);
                                                }
                                                setShowDatePicker(false);
                                            }}
                                            variant="dark_button"
                                        />
                                    </View>
                                </View>
                            </StyledModal>
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
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </StyledModal >
    );
};

export default AddBirthdayModal;
