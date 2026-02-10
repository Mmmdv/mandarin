import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { COLORS } from "@/constants/ui";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from "react";
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

type AddTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    onAdd: (title: string, reminder?: string) => void
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({
    isOpen, onClose, onAdd }) => {
    const { t, colors } = useTheme();

    const [isFocused, setIsFocused] = useState(false)
    const [title, setTitle] = useState("")
    const [inputError, setInputError] = useState(false)
    const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showTimePicker, setShowTimePicker] = useState(false)

    useEffect(() => {
        if (inputError && title) setInputError(false)
    }, [title])

    useEffect(() => {
        if (isOpen) {
            setTitle("")
            setInputError(false)
            setIsFocused(true)
            setReminderDate(undefined)
        }
    }, [isOpen])

    const onPressAdd = () => {
        if (!title.trim()) {
            setInputError(true)
            return
        }
        onAdd(title, reminderDate?.toISOString())
        onClose()
    }

    const onChangeDate = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            const currentDate = selectedDate;
            if (Platform.OS === 'android') {
                // After picking date, show time picker
                setShowTimePicker(true);
                setReminderDate(currentDate); // Temporary set to date
            } else {
                setReminderDate(currentDate);
            }
        }
    };

    const onChangeTime = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (selectedDate) {
            // Merge time with existing date
            const newDate = new Date(reminderDate || new Date());
            newDate.setHours(selectedDate.getHours());
            newDate.setMinutes(selectedDate.getMinutes());
            setReminderDate(newDate);
        }
    }


    const formatDateTime = (date: Date) => {
        return date.toLocaleString();
    }

    return (
        <StyledModal isOpen={isOpen} onClose={onClose}>
            <View style={modalStyles.modalContainer}>
                <View style={[modalStyles.iconContainer, { backgroundColor: "rgba(78, 205, 196, 0.15)" }]}>
                    <Ionicons name="add" size={28} color={COLORS.CHECKBOX_SUCCESS} />
                </View>

                <StyledText style={modalStyles.headerText}>{t("add")}</StyledText>

                <View style={modalStyles.divider} />

                <View style={[
                    localStyles.inputWrapper,
                    isFocused && localStyles.inputFocused,
                    inputError && localStyles.inputError
                ]}>
                    <TextInput
                        style={localStyles.textInput}
                        placeholder={t("todo_placeholder")}
                        placeholderTextColor="#666"
                        value={title}
                        onChangeText={setTitle}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        multiline={true}
                        autoFocus={true}
                    />
                </View>

                {/* Date Picker Trigger */}
                <TouchableOpacity
                    style={localStyles.dateTrigger}
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="calendar-outline" size={20} color={reminderDate ? COLORS.CHECKBOX_SUCCESS : "#888"} />
                    <StyledText style={[localStyles.dateText, !!reminderDate && { color: COLORS.CHECKBOX_SUCCESS }]}>
                        {reminderDate ? formatDateTime(reminderDate) : "Set Reminder"}
                    </StyledText>
                    {reminderDate && (
                        <TouchableOpacity onPress={() => setReminderDate(undefined)}>
                            <Ionicons name="close-circle" size={18} color="#666" />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={reminderDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                        minimumDate={new Date()}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={reminderDate || new Date()}
                        mode="time"
                        display="default"
                        onChange={onChangeTime}
                    />
                )}

                <View style={modalStyles.buttonsContainer}>
                    <StyledButton
                        label={t("cancel")}
                        onPress={onClose}
                        variant="gray_button"
                    />
                    <StyledButton
                        label={t("add")}
                        onPress={onPressAdd}
                        variant="green_button"
                    />
                </View>
            </View>
        </StyledModal>
    )
}

const localStyles = StyleSheet.create({
    inputWrapper: {
        backgroundColor: "#151616ff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#3a3f47",
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 60,
        width: "100%",
        marginBottom: 15,
    },
    inputFocused: {
        borderColor: "#888282ff",
        backgroundColor: "#151616ff",
    },
    inputError: {
        borderColor: COLORS.ERROR_INPUT_TEXT,
    },
    textInput: {
        color: COLORS.PRIMARY_TEXT,
        fontSize: 14,
        minHeight: 40,
    },
    dateTrigger: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#151616ff",
        padding: 12,
        borderRadius: 12,
        gap: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#3a3f47",
    },
    dateText: {
        color: "#888",
        fontSize: 14,
        flex: 1,
    }
})

export default AddTodoModal
