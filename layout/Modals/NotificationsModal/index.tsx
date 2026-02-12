import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearNotifications, markAllAsRead, markAsRead, selectNotifications } from "@/store/slices/notificationSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { FlatList, Modal, RefreshControl, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

interface NotificationsModalProps {
    visible: boolean;
    onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose }) => {
    const { colors, t } = useTheme();
    const dispatch = useAppDispatch();
    const notifications = useAppSelector(selectNotifications);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const handleClearAll = useCallback(() => {
        setIsDeleteConfirmOpen(true);
    }, []);

    const handleMarkAllRead = useCallback(() => {
        dispatch(markAllAsRead());
    }, [dispatch]);

    const confirmClearAll = useCallback(() => {
        dispatch(clearNotifications());
        setIsDeleteConfirmOpen(false);
    }, [dispatch]);

    const renderItem = useCallback(({ item }: { item: any }) => {
        const isPending = new Date(item.date) > new Date();
        let statusColor = colors.CHECKBOX_SUCCESS;
        let statusIcon: any = "notifications";
        let statusBg = "rgba(78, 205, 196, 0.15)";

        if (item.status === 'cancelled') {
            statusColor = colors.ERROR_INPUT_TEXT;
            statusIcon = "notifications-off";
            statusBg = "rgba(255, 69, 58, 0.1)";
        } else if (item.status === 'changed') {
            statusColor = "#5BC0EB";
            statusIcon = "create-outline";
            statusBg = "rgba(91, 192, 235, 0.15)";
        } else if (isPending) {
            statusColor = "#FFB74D";
            statusIcon = "time-outline";
            statusBg = "rgba(255, 183, 77, 0.15)";
        }

        const isUnread = !item.read;
        const cleanBody = item.body.replace(/^(Title|Başlıq|Заголовок): /i, "");

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                    if (isUnread) {
                        dispatch(markAsRead(item.id));
                    }
                }}
                style={[
                    styles.notificationItem,
                    {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        borderColor: colors.PRIMARY_BORDER_DARK,
                        opacity: isUnread ? 1 : 0.8
                    }
                ]}
            >
                <View style={[
                    styles.iconContainer,
                    {
                        backgroundColor: statusBg,
                        shadowColor: statusColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        elevation: 8
                    }
                ]}>
                    <Ionicons name={statusIcon} size={20} color={statusColor} />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.itemHeader}>
                        <StyledText style={[
                            styles.itemTitle,
                            {
                                color: colors.PRIMARY_TEXT,
                                fontWeight: isUnread ? "700" : "600",
                                fontSize: 16
                            }
                        ]}>{cleanBody}</StyledText>
                    </View>
                    <StyledText style={styles.itemDate}>
                        {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </StyledText>
                    {item.status === 'cancelled' && (
                        <View style={{ marginTop: 4 }}>
                            <StyledText style={{ fontSize: 12, color: colors.ERROR_INPUT_TEXT, fontWeight: "600" }}>{t("canceled")}</StyledText>
                        </View>
                    )}
                    {item.status === 'changed' && (
                        <View style={{ marginTop: 4 }}>
                            <StyledText style={{ fontSize: 12, color: "#5BC0EB", fontWeight: "600" }}>{t("changed_status")}</StyledText>
                        </View>
                    )}
                    {item.status !== 'cancelled' && item.status !== 'changed' && isPending && (
                        <View style={{ marginTop: 4 }}>
                            <StyledText style={{ fontSize: 12, color: "#FFB74D", fontWeight: "600" }}>{t("pending")}</StyledText>
                        </View>
                    )}
                    {item.status !== 'cancelled' && item.status !== 'changed' && !isPending && (
                        <View style={{ marginTop: 4 }}>
                            <StyledText style={{ fontSize: 12, color: colors.CHECKBOX_SUCCESS, fontWeight: "600" }}>{t("sent")}</StyledText>
                        </View>
                    )}
                </View>
                {isUnread && (
                    <View style={{ justifyContent: 'center' }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.CHECKBOX_SUCCESS }} />
                    </View>
                )}
            </TouchableOpacity>
        );
    }, [colors, t, dispatch]);

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND, paddingBottom: insets.bottom }]}>
                {/* Header */}
                <View style={[
                    styles.header,
                    {
                        borderBottomColor: colors.PRIMARY_BORDER_DARK,
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        paddingTop: insets.top + 16
                    }
                ]}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.PRIMARY_TEXT} />
                    </TouchableOpacity>

                    <View style={[styles.titleContainer, { paddingTop: insets.top + 16, paddingBottom: 16 }]} pointerEvents="none">
                        <StyledText style={[styles.headerTitle, { color: colors.PRIMARY_TEXT }]}>{t("notifications")}</StyledText>
                    </View>

                    <View style={styles.rightPlaceholder}>
                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            {notifications.some(n => !n.read) && (
                                <TouchableOpacity onPress={handleMarkAllRead}>
                                    <Ionicons name="checkmark-done-outline" size={22} color={colors.CHECKBOX_SUCCESS} />
                                </TouchableOpacity>
                            )}
                            {notifications.length > 0 && (
                                <TouchableOpacity onPress={handleClearAll}>
                                    <Ionicons name="trash-outline" size={22} color={colors.ERROR_INPUT_TEXT} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* Content */}
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.CHECKBOX_SUCCESS}
                            colors={[colors.CHECKBOX_SUCCESS]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={64} color="#666" style={{ marginBottom: 16 }} />
                            <StyledText style={{ color: colors.PLACEHOLDER, fontSize: 16 }}>{t("no_results")}</StyledText>
                        </View>
                    }
                />

                {/* Custom Delete Confirmation Modal */}
                <StyledModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
                    <View style={modalStyles.modalContainer}>
                        <View style={[modalStyles.iconContainer, {
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                            shadowColor: "#FF6B6B",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5
                        }]}>
                            <Ionicons name="trash-outline" size={28} color="#FF6B6B" />
                        </View>
                        <StyledText style={modalStyles.headerText}>{t("confirm_delete")}</StyledText>
                        <View style={modalStyles.divider} />
                        <StyledText style={modalStyles.messageText}>{t("clear_history_confirm")}</StyledText>
                        <View style={modalStyles.buttonsContainer}>
                            <StyledButton label={t("cancel")} onPress={() => setIsDeleteConfirmOpen(false)} variant="dark_button" />
                            <StyledButton label={t("delete")} onPress={confirmClearAll} variant="dark_button" />
                        </View>
                    </View>
                </StyledModal>
            </View>
        </Modal>
    );
};

export default NotificationsModal;
