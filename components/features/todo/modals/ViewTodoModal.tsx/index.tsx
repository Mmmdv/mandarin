import StyledButton from "@/components/ui/StyledButton";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { COLORS } from "@/constants/ui";
import { formatDate, formatDuration } from "@/helpers/date";
import { useTheme } from "@/hooks/useTheme";
import { useAppSelector } from "@/store";
import { NotificationStatus, selectNotificationById } from "@/store/slices/notificationSlice";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

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
    const { t, lang } = useTheme();

    const notification = useAppSelector(state => notificationId ? selectNotificationById(state, notificationId) : undefined);
    const reminderStatus: NotificationStatus | undefined = notification?.status;

    return (
        <StyledModal isOpen={isOpen} onClose={onClose} closeOnOverlayPress={true}>
            <View style={[modalStyles.modalContainer, localStyles.container]}>
                <View style={[modalStyles.iconContainer, {
                    backgroundColor: useTheme().colors.SECONDARY_BACKGROUND,
                    shadowColor: "#4ECDC4",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                }]}>
                    <Ionicons name="checkbox" size={28} color="#4ECDC4" />
                </View>

                <StyledText style={[modalStyles.headerText, localStyles.headerText]}>{t("task_details")}</StyledText>

                <View style={modalStyles.divider} />

                {/* Prominent Task Title */}
                <View style={localStyles.titleSection}>
                    <StyledText style={localStyles.titleValue}>{title}</StyledText>
                </View>

                {/* Table-like Date Section */}
                <View style={localStyles.tableContainer}>
                    <View style={localStyles.tableRow}>
                        <View style={localStyles.tableLabelColumn}>
                            <Ionicons name="add" size={18} color="#D1D1D1" />
                            <StyledText style={localStyles.tableLabelText}>{t("created")}</StyledText>
                        </View>
                        <View style={localStyles.tableValueColumn}>
                            <StyledText style={[localStyles.tableValueText, { color: '#D1D1D1' }]}>
                                {formatDate(createdAt, lang)}
                            </StyledText>
                        </View>
                    </View>

                    {updatedAt && (
                        <View style={[localStyles.tableRow, localStyles.tableRowBorder]}>
                            <View style={localStyles.tableLabelColumn}>
                                <Ionicons name="create-outline" size={18} color="#5BC0EB" />
                                <StyledText style={localStyles.tableLabelText}>{t("edited")}</StyledText>
                            </View>
                            <View style={localStyles.tableValueColumn}>
                                <StyledText style={[localStyles.tableValueText, { color: '#5BC0EB' }]}>
                                    {formatDate(updatedAt, lang)}
                                </StyledText>
                            </View>
                        </View>
                    )}

                    {completedAt && (
                        <View style={[localStyles.tableRow, localStyles.tableRowBorder]}>
                            <View style={localStyles.tableLabelColumn}>
                                <Ionicons name="checkmark-done-outline" size={18} color="#4ECDC4" />
                                <StyledText style={localStyles.tableLabelText}>{t("completed")}</StyledText>
                            </View>
                            <View style={localStyles.tableValueColumn}>
                                <StyledText style={[localStyles.tableValueText, { color: '#4ECDC4' }]}>
                                    {formatDate(completedAt, lang)}
                                </StyledText>
                            </View>
                        </View>
                    )}

                    <View style={[localStyles.tableRow, localStyles.tableRowBorder]}>
                        <View style={localStyles.tableLabelColumn}>
                            <Ionicons name="speedometer-outline" size={18} color="#FF7043" />
                            <StyledText style={localStyles.tableLabelText}>
                                {completedAt ? t("execution_time") : t("time_elapsed")}
                            </StyledText>
                        </View>
                        <View style={localStyles.tableValueColumn}>
                            <StyledText style={[localStyles.tableValueText, { color: '#FF7043' }]}>
                                {completedAt
                                    ? formatDuration(updatedAt || createdAt, completedAt, t)
                                    : formatDuration(updatedAt || createdAt, new Date().toISOString(), t)
                                }
                            </StyledText>
                        </View>
                    </View>

                    {reminder && (
                        <View style={[localStyles.tableRow, localStyles.tableRowBorder]}>
                            <View style={localStyles.tableLabelColumn}>
                                <Ionicons name="alarm-outline" size={18} color="#FFD166" />
                                <StyledText style={localStyles.tableLabelText}>{t("reminder")}</StyledText>
                            </View>
                            <View style={localStyles.tableValueColumn}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    {reminderStatus === 'Göndərilib' ? (
                                        <Ionicons name="checkmark-done-circle-outline" size={14} color={COLORS.CHECKBOX_SUCCESS} />
                                    ) : (reminderStatus === 'Ləğv olunub' || reminderStatus === 'Dəyişdirilib və ləğv olunub' || reminderCancelled || completedAt) ? (
                                        <Ionicons name="notifications-off" size={14} color={COLORS.ERROR_INPUT_TEXT} />
                                    ) : (
                                        <Ionicons name="hourglass-outline" size={14} color="#FFB74D" />
                                    )}
                                    <StyledText style={[localStyles.tableValueText, { color: '#FFD166' }]}>
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

const localStyles = StyleSheet.create({
    container: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        minWidth: 340,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: 'center',
        opacity: 0.8,
    },
    titleSection: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        marginBottom: 8,
    },
    titleLabel: {
        fontSize: 13,
        color: "#aca9a9ff",
        fontWeight: "bold",
        marginBottom: 8,
    },
    titleValue: {
        width: '100%',
        fontSize: 16,
        color: COLORS.PRIMARY_TEXT,
        fontWeight: "bold",
        paddingHorizontal: 16,
        textAlign: 'left',
    },
    tableContainer: {
        width: "100%",
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 4,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    tableRowBorder: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    tableLabelColumn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    tableLabelText: {
        fontSize: 12,
        color: "#aca9a9ff",
        fontWeight: "500",
    },
    tableValueColumn: {
        flex: 1.5,
        alignItems: 'flex-end',
    },
    tableValueText: {
        fontSize: 12,
        color: COLORS.PRIMARY_TEXT,
        fontWeight: "600",
    },
    statusBadge: {
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    statusTextGeneric: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    statusTextCancelled: {
        color: COLORS.ERROR_INPUT_TEXT,
    },
    statusTextPending: {
        color: "#FFB74D",
    },
    statusTextSent: {
        color: COLORS.CHECKBOX_SUCCESS,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
})

export default ViewTodoModal
