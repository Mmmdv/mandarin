import StyledButton from "@/components/ui/StyledButton";
import StyledHeader from "@/components/ui/StyledHeader";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { formatDate, translateReminderStatus } from "@/helpers/date";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearNotifications, markAllAsRead, markAsRead, selectNotifications } from "@/store/slices/notificationSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";

const NotificationsPage = () => {
    const { colors, t, lang } = useTheme();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const notifications = useAppSelector(selectNotifications);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const filteredNotifications = React.useMemo(() => {
        if (selectedStatus === 'all') return notifications;
        return notifications.filter(n => {
            if (selectedStatus === 'Ləğv olunub') {
                return n.status === 'Ləğv olunub' || n.status === 'Dəyişdirilib və ləğv olunub';
            }
            return n.status === selectedStatus;
        });
    }, [notifications, selectedStatus]);

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

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
    }, [colors, t, dispatch, lang]);

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <StyledHeader
                title={t("notifications")}
                rightSection={
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
                }
            />

            {/* Filter Chips */}
            <View style={{ marginBottom: 0 }}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[
                        { key: 'all', label: t('all') || 'Hamısı' },
                        { key: 'Gözlənilir', label: t('status_pending') },
                        { key: 'Göndərilib', label: t('status_sent') },
                        { key: 'Ləğv olunub', label: t('status_cancelled') },
                    ]}
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingTop: 16, paddingBottom: 8, flexGrow: 1, justifyContent: 'center' }}
                    renderItem={({ item }) => {
                        const isSelected = selectedStatus === item.key;
                        return (
                            <TouchableOpacity
                                onPress={() => setSelectedStatus(item.key)}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 16,
                                    backgroundColor: isSelected ? '#234E94' : 'transparent',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <StyledText style={{
                                    color: isSelected ? '#fff' : colors.PLACEHOLDER,
                                    fontSize: 12,
                                    fontWeight: isSelected ? '700' : '500',
                                    marginBottom: isSelected ? 4 : 0,
                                }}>
                                    {item.label}
                                </StyledText>
                                {isSelected && (
                                    <View style={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: '#fff',
                                    }} />
                                )}
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>

            {/* Content */}
            <FlatList
                data={filteredNotifications}
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 40,
    },
    notificationItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        gap: 16,
    },
    contentContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 20,
        marginBottom: 5,
    },
    itemDate: {
        fontSize: 12,
        color: "#c2c1c1ff",
        marginBottom: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 100,
    },
});

export default NotificationsPage;
