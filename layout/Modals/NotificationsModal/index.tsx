import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { formatDate, translateReminderStatus } from "@/helpers/date";
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
    const { colors, t, lang } = useTheme();
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
        let statusColor = "#FFB74D";
        let statusIcon: any = "hourglass-outline";
        let statusLabelRaw = item.status || 'Gözlənilir';
        let statusLabel = translateReminderStatus(statusLabelRaw, t);

        if (item.status === 'Ləğv olunub' || item.status === 'Dəyişdirilib və ləğv olunub') {
            statusColor = colors.ERROR_INPUT_TEXT;
            statusIcon = "notifications-off";
        } else if (item.status === 'Göndərilib') {
            statusColor = colors.CHECKBOX_SUCCESS;
            statusIcon = "checkmark-done-circle-outline";
        } else {
            // Default is Gözlənilir
            statusColor = "#FFB74D";
            statusIcon = "hourglass-outline";
        }

        const isUnread = !item.read;

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
                <View style={{ width: 32, alignItems: 'center' }}>
                    {item.categoryIcon && !Ionicons.glyphMap[item.categoryIcon as keyof typeof Ionicons.glyphMap] ? (
                        <StyledText style={{ fontSize: 24 }}>{item.categoryIcon}</StyledText>
                    ) : (
                        <Ionicons name={(item.categoryIcon as any) || "notifications-outline"} size={26} color={statusColor} />
                    )}
                </View>
                <View style={styles.contentContainer}>
                    <StyledText style={[
                        styles.itemTitle,
                        {
                            color: colors.PRIMARY_TEXT,
                            fontWeight: isUnread ? "700" : "600",
                        }
                    ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >{item.body}</StyledText>
                    <StyledText style={styles.itemDate}>
                        {formatDate(item.date, lang)}
                    </StyledText>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Ionicons name={statusIcon} size={14} color={statusColor} />
                        <StyledText style={{ fontSize: 12, color: statusColor, fontWeight: "600" }}>{statusLabel}</StyledText>
                    </View>
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
                        <StyledText style={{ fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: colors.PRIMARY_TEXT }}>
                            {t("notifications")}
                        </StyledText>
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
