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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center', width: '100%', marginBottom: 4 }}>
                    <View style={[modalStyles.iconContainer, {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        shadowColor: colors.PRIMARY_ACTIVE_BUTTON,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 2,
                        width: 42,
                        height: 42,
                        borderRadius: 21,
                        flexShrink: 0
                    }]}>
                        <Ionicons name="eye-outline" size={28} color={colors.PRIMARY_ACTIVE_BUTTON} />
                    </View>
                    <StyledText style={[styles.headerText, { textAlign: 'left' }]}>{t("task_details")}</StyledText>
                </View>

                <View style={modalStyles.divider} />

                {/* Table-like Date Section */}
                <View style={styles.tableContainer}>
                    <View style={[styles.tableRow, { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
                        <View style={[styles.tableLabelColumn, { flex: 0, width: '100%' }]}>
                            <Ionicons name="document-text-outline" size={18} color={colors.SECTION_TEXT} />
                            <StyledText style={styles.tableLabelText}>{t("title")}</StyledText>
                        </View>
                        <View style={[styles.tableValueColumn, { flex: 0, width: '100%', alignItems: 'flex-start', paddingLeft: 28 }]}>
                            <StyledText style={[styles.tableValueText, { textAlign: 'left' }]}>
                                {title}
                            </StyledText>
                        </View>
                    </View>
                </View>

                {/* Other Parameters Section */}
                <View style={[styles.tableContainer, { marginTop: 16 }]}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="speedometer-outline" size={18} color={colors.SECTION_TEXT} />
                            <StyledText style={styles.tableLabelText}>
                                {completedAt ? t("execution_time") : t("time_elapsed")}
                            </StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <StyledText style={[styles.tableValueText, { color: colors.SECTION_TEXT }]}>
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
                                <Ionicons name="alarm-outline" size={18} color={colors.SECTION_TEXT} />
                                <StyledText style={styles.tableLabelText}>{t("reminder")}</StyledText>
                            </View>
                            <View style={styles.tableValueColumn}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    {reminderStatus === 'Göndərilib' ? (
                                        <Ionicons name="checkmark-done" size={14} color={colors.CHECKBOX_SUCCESS} />
                                    ) : (reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub' || reminderCancelled || completedAt) ? (
                                        <Ionicons name="notifications-off" size={14} color={colors.ERROR_INPUT_TEXT} />
                                    ) : (
                                        <Ionicons name="hourglass-outline" size={14} color={colors.REMINDER} />
                                    )}
                                    <StyledText style={[styles.tableValueText, { color: colors.SECTION_TEXT }]}>
                                        {formatDate(reminder, lang)}
                                    </StyledText>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={[styles.tableRow, styles.tableRowBorder]}>
                        <View style={styles.tableLabelColumn}>
                            <Ionicons name="add" size={18} color={colors.SECTION_TEXT} />
                            <StyledText style={styles.tableLabelText}>{t("created")}</StyledText>
                        </View>
                        <View style={styles.tableValueColumn}>
                            <StyledText style={[styles.tableValueText, { color: colors.SECTION_TEXT }]}>
                                {formatDate(createdAt, lang)}
                            </StyledText>
                        </View>
                    </View>

                    {updatedAt && (
                        <View style={[styles.tableRow, styles.tableRowBorder]}>
                            <View style={styles.tableLabelColumn}>
                                <Ionicons name="create-outline" size={18} color={colors.SECTION_TEXT} />
                                <StyledText style={styles.tableLabelText}>{t("edited")}</StyledText>
                            </View>
                            <View style={styles.tableValueColumn}>
                                <StyledText style={[styles.tableValueText, { color: colors.SECTION_TEXT }]}>
                                    {formatDate(updatedAt, lang)}
                                </StyledText>
                            </View>
                        </View>
                    )}

                    {completedAt && (
                        <View style={[styles.tableRow, styles.tableRowBorder]}>
                            <View style={styles.tableLabelColumn}>
                                <Ionicons name="checkmark-done-outline" size={18} color={colors.SECTION_TEXT} />
                                <StyledText style={styles.tableLabelText}>{t("completed")}</StyledText>
                            </View>
                            <View style={styles.tableValueColumn}>
                                <StyledText style={[styles.tableValueText, { color: colors.SECTION_TEXT }]}>
                                    {formatDate(completedAt, lang)}
                                </StyledText>
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
