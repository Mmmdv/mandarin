import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { formatDate, formatDuration } from "@/helpers/date";
import { useTheme } from "@/hooks/useTheme";
import { useAppSelector } from "@/store";
import { NotificationStatus, selectNotificationById } from "@/store/slices/notificationSlice";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";
import { getStyles } from "./styles";

type ViewTodoModalProps = {
    isOpen: boolean
    onClose: () => void
    title: Todo["title"]
    createdAt: Todo["createdAt"]
    updatedAt?: Todo["updatedAt"]
    completedAt?: Todo["completedAt"]
    reminder?: string
    reminderCancelled?: boolean
    notificationId?: string
};

const ViewTodoModal: React.FC<ViewTodoModalProps> = ({
    isOpen,
    onClose,
    title,
    createdAt,
    updatedAt,
    completedAt,
    reminder,
    reminderCancelled,
    notificationId
}) => {
    const { t, lang, colors, isDark } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

    const notification = useAppSelector(state => notificationId ? selectNotificationById(state, notificationId) : undefined);
    const reminderStatus: NotificationStatus | undefined = notification?.status;

    return (
        <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true}>
            <View style={styles.container}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: colors.TAB_BAR,
                    shadowColor: colors.CHECKBOX_SUCCESS,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 2
                }]}>
                    <Ionicons name="checkbox" size={28} color="#4ECDC4" />
                </View>

                <StyledText style={styles.headerText}>{t("task_details")}</StyledText>

                <View style={modalStyles.divider} />

                {/* Prominent Task Title */}
                <View style={styles.titleSection}>
                    <StyledText style={styles.titleValue}>{title}</StyledText>
                </View>

                {/* Table-like Date Section */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="add" size={18} color={isDark ? "#D1D1D1" : "#8E8E93"} />
                            <StyledText style={styles.tableLabelText}>{t("created")}</StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <StyledText style={[styles.tableValueText, { color: isDark ? '#D1D1D1' : '#8E8E93' }]}>
                                {formatDate(createdAt, lang)}
                            </StyledText>
                        </View>
                    </View>

                    {updatedAt && (
                        <View style={[styles.tableRow, styles.tableRowBorder]}>
                            <View style={styles.tableLabelColumn}>
                                <Ionicons name="create-outline" size={18} color="#5BC0EB" />
                                <StyledText style={styles.tableLabelText}>{t("edited")}</StyledText>
                            </View>
                            <View style={styles.tableValueColumn}>
                                <StyledText style={[styles.tableValueText, { color: '#5BC0EB' }]}>
                                    {formatDate(updatedAt, lang)}
                                </StyledText>
                            </View>
                        </View>
                    )}

                    {completedAt && (
                        <View style={[styles.tableRow, styles.tableRowBorder]}>
                            <View style={styles.tableLabelColumn}>
                                <Ionicons name="checkmark-done-outline" size={18} color="#4ECDC4" />
                                <StyledText style={styles.tableLabelText}>{t("completed")}</StyledText>
                            </View>
                            <View style={styles.tableValueColumn}>
                                <StyledText style={[styles.tableValueText, { color: '#4ECDC4' }]}>
                                    {formatDate(completedAt, lang)}
                                </StyledText>
                            </View>
                        </View>
                    )}

                    <View style={[styles.tableRow, styles.tableRowBorder]}>
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="speedometer-outline" size={18} color="#FF7043" />
                            <StyledText style={styles.tableLabelText}>
                                {completedAt ? t("execution_time") : t("time_elapsed")}
                            </StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <StyledText style={[styles.tableValueText, { color: '#FF7043' }]}>
                                {completedAt
                                    ? formatDuration(updatedAt || createdAt, completedAt, t)
                                    : formatDuration(updatedAt || createdAt, new Date().toISOString(), t)
                                }
                            </StyledText>
                        </View>
                    </View>

                    {reminder && (
                        <View style={[styles.tableRow, styles.tableRowBorder]}>
                            <View style={styles.tableLabelColumn}>
                                <Ionicons name="alarm-outline" size={18} color={colors.REMINDER} />
                                <StyledText style={styles.tableLabelText}>{t("reminder")}</StyledText>
                            </View>
                            <View style={styles.tableValueColumn}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    {reminderStatus === 'Göndərilib' ? (
                                        <Ionicons name="checkmark-done-circle-outline" size={14} color={colors.CHECKBOX_SUCCESS} />
                                    ) : (reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub' || reminderCancelled || completedAt) ? (
                                        <Ionicons name="notifications-off" size={14} color={colors.ERROR_INPUT_TEXT} />
                                    ) : (
                                        <Ionicons name="hourglass-outline" size={14} color={colors.REMINDER} />
                                    )}
                                    <StyledText style={[styles.tableValueText, { color: colors.REMINDER }]}>
                                        {formatDate(reminder, lang)}
                                    </StyledText>
                                </View>
                            </View>
                        </View>
                    )}
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

export default ViewTodoModal;
