import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { formatDate } from "@/helpers/date";
import { useTheme } from "@/hooks/useTheme";
import { useAppSelector } from "@/store";
import { selectNotificationById } from "@/store/slices/notificationSlice";
import { Birthday } from "@/types/birthday";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Linking, TouchableOpacity, View } from "react-native";
import { getStyles } from "./styles";

type BirthdayViewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    birthday: Birthday | null;
};

const BirthdayViewModal: React.FC<BirthdayViewModalProps> = ({
    isOpen,
    onClose,
    birthday,
}) => {
    const { t, lang, colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    const notification = useAppSelector(state =>
        birthday?.notificationId ? selectNotificationById(state, birthday.notificationId) : undefined
    );
    const reminderStatus = notification?.status;
    const isReminderCancelled = reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub';

    if (!birthday) return null;

    const formatBirthdayDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const handleCall = () => {
        if (birthday.phone) {
            Linking.openURL(`tel:${birthday.phone}`);
        }
    };

    return (
        <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true}>
            <View style={styles.container}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: colors.SECONDARY_BACKGROUND,
                    shadowColor: "#D4880F",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 2
                }]}>
                    <Ionicons name="eye-outline" size={28} color="#D4880F" />
                </View>

                <StyledText style={styles.headerText}>{t("birthday_info")}</StyledText>

                <View style={modalStyles.divider} />

                <View style={styles.tableContainer}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="person-outline" size={18} color="#D4880F" />
                            <StyledText style={styles.tableLabelText}>{t("birthday_name")}</StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <StyledText style={styles.tableValueText}>
                                {birthday.name}
                            </StyledText>
                        </View>
                    </View>



                    <View style={[styles.tableRow, styles.tableRowBorder]}>
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="calendar-outline" size={18} color="#D4880F" />
                            <StyledText style={styles.tableLabelText}>{t("birthday_date")}</StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <StyledText style={styles.tableValueText}>
                                {formatBirthdayDate(birthday.date)}
                            </StyledText>
                        </View>
                    </View>

                    {birthday.phone && (
                        <TouchableOpacity
                            style={[styles.tableRow, styles.tableRowBorder]}
                            onPress={handleCall}
                        >
                            <View style={styles.tableLabelColumn}>
                                <Ionicons name="call-outline" size={18} color="#4ECDC4" />
                                <StyledText style={styles.tableLabelText}>{t("birthday_phone")}</StyledText>
                            </View>
                            <View style={styles.tableValueColumn}>
                                <StyledText style={[styles.tableValueText, { color: '#4ECDC4', textDecorationLine: 'underline' }]}>
                                    {birthday.phone}
                                </StyledText>
                            </View>
                        </TouchableOpacity>
                    )}

                    <View style={[styles.tableRow, styles.tableRowBorder]}>
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="alarm-outline" size={18} color={colors.REMINDER} />
                            <StyledText style={styles.tableLabelText}>{t("reminder")}</StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                {reminderStatus === 'Göndərilib' ? (
                                    <Ionicons name="checkmark-done-circle-outline" size={14} color={colors.CHECKBOX_SUCCESS} />
                                ) : isReminderCancelled ? (
                                    <Ionicons name="notifications-off" size={14} color={colors.ERROR_INPUT_TEXT} />
                                ) : (
                                    <Ionicons name="hourglass-outline" size={14} color={colors.REMINDER} />
                                )}
                                <StyledText style={[styles.tableValueText, { color: isReminderCancelled ? colors.ERROR_INPUT_TEXT : colors.REMINDER }]}>
                                    {notification?.date ? formatDate(notification.date, lang) : (isReminderCancelled ? t("status_cancelled") : t("pending"))}
                                </StyledText>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.tableRow, styles.tableRowBorder]}>
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="paper-plane-outline" size={18} color={colors.SECTION_TEXT} />
                            <StyledText style={styles.tableLabelText}>{t("birthday_greeting_sent")}</StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons
                                    name={birthday.greetingSent ? "checkmark-done" : "close-circle-outline"}
                                    size={14}
                                    color={birthday.greetingSent ? "#4ECDC4" : colors.SECTION_TEXT}
                                />
                                <StyledText style={[styles.tableValueText, { color: birthday.greetingSent ? "#4ECDC4" : colors.SECTION_TEXT }]}>
                                    {birthday.greetingSent ? t("status_sent") : t("status_not_sent")}
                                </StyledText>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.tableRow, styles.tableRowBorder]}>
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="add" size={18} color={colors.SECTION_TEXT} />
                            <StyledText style={styles.tableLabelText}>{t("created")}</StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <StyledText style={[styles.tableValueText, { color: colors.SECTION_TEXT }]}>
                                {formatDate(birthday.createdAt, lang)}
                            </StyledText>
                        </View>
                    </View>
                </View>

                <View style={[modalStyles.buttonsContainer, { justifyContent: "center", marginTop: 8 }]}>
                    <StyledButton
                        label={t("close")}
                        onPress={onClose}
                        variant="dark_button"
                    />
                </View>
            </View>
        </StyledModal>
    );
};

export default BirthdayViewModal;
