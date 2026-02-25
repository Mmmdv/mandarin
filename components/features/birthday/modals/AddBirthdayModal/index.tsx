import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Contacts from 'expo-contacts';
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Keyboard,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { getStyles as getViewStyles } from "../BirthdayViewModal/styles";
import { getStyles as getAddStyles } from "./styles";

type AddBirthdayModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (
        name: string,
        date: string,
        phone?: string
    ) => void;
};

const AddBirthdayModal: React.FC<AddBirthdayModalProps> = ({
    isOpen,
    onClose,
    onAdd,
}) => {
    const { t, colors, theme, isDark, lang } = useTheme();
    const viewStyles = useMemo(() => getViewStyles(colors, isDark), [colors, isDark]);
    const addStyles = useMemo(() => getAddStyles(colors, isDark), [colors, isDark]);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [dateError, setDateError] = useState(false);
    const [contactSelected, setContactSelected] = useState(false);

    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (isOpen) {
            setName("");
            setPhone("");
            setDate(undefined);
            setNameError(false);
            setDateError(false);
            setContactSelected(false);

            // Auto focus input
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

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
            phone.trim() || undefined
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

    const formatDateDisplay = (date: Date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const months = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
        const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const ruMonths = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

        const monthNames = lang === 'az' ? months : lang === 'ru' ? ruMonths : enMonths;
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    return (
        <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true} expectsKeyboard={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={viewStyles.container}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', width: '100%' }}>
                        <View
                            style={[
                                modalStyles.iconContainer,
                                addStyles.iconContainer,
                                { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' }
                            ]}
                        >
                            <Ionicons name="gift-outline" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                        </View>

                        <StyledText style={viewStyles.headerText}>
                            {t("birthday_add")}
                        </StyledText>
                    </View>

                    <View style={modalStyles.divider} />

                    <ScrollView
                        style={addStyles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={addStyles.scrollContent}
                    >
                        <View style={viewStyles.tableContainer}>
                            {/* 1. Name Input */}
                            <View style={[
                                viewStyles.tableRow,
                                nameError && addStyles.inputError,
                                addStyles.nameRow
                            ]}>
                                <View style={viewStyles.tableLabelColumn}>
                                    <Ionicons name="person-outline" size={18} color={colors.SECTION_TEXT} />
                                    <StyledText style={viewStyles.tableLabelText}>{t("birthday_name")} *</StyledText>
                                </View>
                                <View style={viewStyles.tableValueColumn}>
                                    <TextInput
                                        ref={inputRef}
                                        style={[
                                            viewStyles.tableValueText,
                                            addStyles.inputInline,
                                        ]}
                                        placeholderTextColor={colors.PLACEHOLDER}
                                        value={name}
                                        onChangeText={(text) => {
                                            setName(text);
                                            if (nameError) setNameError(false);
                                        }}
                                        placeholder={t("birthday_name")}
                                    />
                                </View>
                            </View>

                            {/* 2. Date Picker */}
                            <TouchableOpacity
                                style={[
                                    viewStyles.tableRow,
                                    viewStyles.tableRowBorder,
                                    dateError && addStyles.inputError,
                                    addStyles.dateRow
                                ]}
                                onPress={handleOpenDatePicker}
                            >
                                <View style={viewStyles.tableLabelColumn}>
                                    <Ionicons name="calendar-outline" size={18} color={colors.SECTION_TEXT} />
                                    <StyledText style={viewStyles.tableLabelText}>{t("birthday_date")} *</StyledText>
                                </View>
                                <View style={viewStyles.tableValueColumn}>
                                    <StyledText style={viewStyles.tableValueText}>
                                        {date ? formatDateDisplay(date) : t("birthday_date")}
                                    </StyledText>
                                </View>
                            </TouchableOpacity>

                            {/* 3. Phone (Optional) - Only visible if contact picked */}
                            {contactSelected && (
                                <View style={[viewStyles.tableRow, viewStyles.tableRowBorder]}>
                                    <View style={viewStyles.tableLabelColumn}>
                                        <Ionicons name="call-outline" size={18} color={colors.SECTION_TEXT} />
                                        <StyledText style={viewStyles.tableLabelText}>{t("birthday_phone")}</StyledText>
                                    </View>
                                    <View style={viewStyles.tableValueColumn}>
                                        <TextInput
                                            style={[
                                                viewStyles.tableValueText,
                                                addStyles.inputInline,
                                                addStyles.phoneInput
                                            ]}
                                            keyboardType="phone-pad"
                                            placeholderTextColor={colors.PLACEHOLDER}
                                            value={phone}
                                            editable={false} // Only from contacts, so probably shouldn't be edited here
                                            placeholder="+994"
                                        />
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Contacts Picker Button */}
                        <TouchableOpacity
                            onPress={contactSelected ? handleClearContact : handlePickContact}
                            activeOpacity={0.7}
                            style={addStyles.contactButton}
                        >
                            <Ionicons
                                name={contactSelected ? "close-circle" : "person-add-outline"}
                                size={18}
                                color={contactSelected ? colors.SECTION_TEXT : colors.SECTION_TEXT}
                            />
                            <StyledText style={addStyles.contactButtonText}>
                                {contactSelected ? t("clear") : t("birthday_pick_contact")}
                            </StyledText>
                        </TouchableOpacity>

                        {/* Android Date Picker */}
                        {Platform.OS === "android" && showDatePicker && (
                            <DateTimePicker
                                value={date || new Date(2000, 0, 1)}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                                maximumDate={new Date()}
                                locale={lang === 'az' ? 'az-AZ' : lang === 'ru' ? 'ru-RU' : 'en-US'}
                            />
                        )}

                        {/* iOS Date Picker Modal */}
                        {Platform.OS === "ios" && (
                            <StyledModal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}>
                                <View style={viewStyles.container}>
                                    <View style={[modalStyles.iconContainer, {
                                        backgroundColor: colors.SECONDARY_BACKGROUND,
                                        shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 2,
                                        elevation: 2
                                    }]}>
                                        <Ionicons name="calendar-outline" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                                    </View>
                                    <StyledText style={viewStyles.headerText}>{t("birthday_date")}</StyledText>
                                    <View style={modalStyles.divider} />
                                    <DateTimePicker
                                        value={date || new Date(2000, 0, 1)}
                                        mode="date"
                                        display="spinner"
                                        onChange={onDateChange}
                                        maximumDate={new Date()}
                                        themeVariant={theme}
                                        locale={lang === 'az' ? 'az-AZ' : lang === 'ru' ? 'ru-RU' : 'en-US'}
                                        style={{ height: 180, width: '100%' }}
                                    />
                                    <View style={[modalStyles.buttonsContainer, { marginTop: 20 }]}>
                                        <StyledButton
                                            label={t("save")}
                                            onPress={() => {
                                                if (!date) setDate(new Date(2000, 0, 1));
                                                setShowDatePicker(false);
                                            }}
                                            variant="dark_button"
                                        />
                                    </View>
                                </View>
                            </StyledModal>
                        )}
                    </ScrollView>

                    <View style={[modalStyles.buttonsContainer, addStyles.buttonsContainerMargin]}>
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
