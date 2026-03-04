import StyledButton from "@/components/ui/StyledButton";
import StyledHeader from "@/components/ui/StyledHeader";
import StyledModal from "@/components/ui/StyledModal";
import StyledText from "@/components/ui/StyledText";
import { getModalStyles } from "@/constants/modalStyles";
import { formatDate, translateReminderStatus } from "@/helpers/date";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearNotifications, markAllAsRead, markAsRead, selectNotifications } from "@/store/slices/notificationSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";

const NotificationsPage = () => {
    const { colors, t, lang, isDark } = useTheme();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const notifications = useAppSelector(selectNotifications);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('day');
    const themedModalStyles = React.useMemo(() => getModalStyles(colors), [colors]);

    const filteredNotifications = React.useMemo(() => {
        let result = notifications;

        if (selectedStatus !== 'all') {
            result = result.filter(n => {
                if (selectedStatus === 'Ləğv olunub') {
                    return n.status === 'Ləğv olunub' || n.status === 'Dəyişdirilib və ləğv olunub';
                }
                return n.status === selectedStatus;
            });
        }

        if (selectedPeriod !== 'all') {
            const now = new Date();
            result = result.filter(n => {
                const nDate = new Date(n.date);
                if (selectedPeriod === 'day') {
                    return nDate.getDate() === now.getDate() &&
                        nDate.getMonth() === now.getMonth() &&
                        nDate.getFullYear() === now.getFullYear();
                } else if (selectedPeriod === 'week') {
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
                    startOfWeek.setHours(0, 0, 0, 0);

                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    endOfWeek.setHours(23, 59, 59, 999);

                    return nDate >= startOfWeek && nDate <= endOfWeek;
                } else if (selectedPeriod === 'month') {
                    return nDate.getMonth() === now.getMonth() &&
                        nDate.getFullYear() === now.getFullYear();
                }
                return true;
            });
        }

        return result;
    }, [notifications, selectedStatus, selectedPeriod]);

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
            statusIcon = "checkmark-done-outline";
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
                        opacity: isUnread ? 1 : 0.8,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isDark ? 0 : 0.1,
                        shadowRadius: 2,
                        elevation: isDark ? 0 : 2
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
                            fontWeight: isUnread ? "600" : "500",
                        }
                    ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >{item.body}</StyledText>
                    <StyledText style={[styles.itemDate, { color: isDark ? "#c2c1c1ff" : colors.PLACEHOLDER }]}>
                        {formatDate(item.date, lang)}
                    </StyledText>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Ionicons name={statusIcon} size={12} color={statusColor} />
                        <StyledText style={{ fontSize: 10, color: statusColor, fontWeight: "600" }}>{statusLabel}</StyledText>
                    </View>
                </View>
                {isUnread && (
                    <View style={{ justifyContent: 'center' }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.CHECKBOX_SUCCESS }} />
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

            {/* Period Filter Chips */}
            <View style={{ marginBottom: 0 }}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[
                        { key: 'all', label: t('all') || 'Hamısı' },
                        { key: 'day', label: t('tab_today') || 'Bugün' },
                        { key: 'week', label: t('stats_week') || 'Həftəlik' },
                        { key: 'month', label: t('stats_month') || 'Aylıq' },
                    ]}
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingTop: 16, paddingBottom: 4, flexGrow: 1, justifyContent: 'center' }}
                    renderItem={({ item }) => {
                        const isSelected = selectedPeriod === item.key;
                        return (
                            <TouchableOpacity
                                onPress={() => setSelectedPeriod(item.key)}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 16,
                                    backgroundColor: isSelected ? '#234E94' : (isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)'),
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

            {/* Status Filter Chips */}
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
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingTop: 8, paddingBottom: 16, flexGrow: 1, justifyContent: 'center' }}
                    renderItem={({ item }) => {
                        const isSelected = selectedStatus === item.key;
                        return (
                            <TouchableOpacity
                                onPress={() => setSelectedStatus(item.key)}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 16,
                                    backgroundColor: isSelected ? '#234E94' : (isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)'),
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
                <View style={[themedModalStyles.modalContainer, {
                    borderRadius: 24,
                    padding: 24,
                    borderWidth: 0.2,
                    shadowOpacity: isDark ? 0.3 : 0.2,
                    shadowRadius: isDark ? 20 : 15,
                    borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
                    width: 340,
                    maxWidth: "90%",
                }]}>
                    <View style={[themedModalStyles.iconContainer, {
                        backgroundColor: colors.TAB_BAR,
                        shadowColor: colors.ERROR_INPUT_TEXT,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 2
                    }]}>
                        <Ionicons name="trash-outline" size={28} color={colors.ERROR_INPUT_TEXT} />
                    </View>
                    <StyledText style={[themedModalStyles.headerText, { fontWeight: 'bold', opacity: 0.8 }]}>{t("confirm_delete")}</StyledText>
                    <View style={[themedModalStyles.divider, { backgroundColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_TEXT }]} />
                    <StyledText style={themedModalStyles.messageText}>{t("clear_history_confirm")}</StyledText>
                    <View style={[themedModalStyles.buttonsContainer, { marginTop: 8 }]}>
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
        borderWidth: 0.5,
        gap: 16,
    },
    contentContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 20,
        marginBottom: 5,
    },
    itemDate: {
        fontSize: 11,
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
