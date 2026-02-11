import StyledButton from "@/components/StyledButton";
import StyledModal from "@/components/StyledModal";
import StyledText from "@/components/StyledText";
import { modalStyles } from "@/constants/modalStyles";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearNotifications, markAllAsRead, markAsRead, selectNotifications } from "@/store/slices/notificationSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

    // Remove auto-mark-read effect
    // useEffect(() => {
    //     if (visible) {
    //         dispatch(markAllAsRead());
    //     }
    // }, [visible]);

    const handleClearAll = () => {
        setIsDeleteConfirmOpen(true);
    };

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead());
    };

    const confirmClearAll = () => {
        dispatch(clearNotifications());
        setIsDeleteConfirmOpen(false);
    };

    const renderItem = ({ item }: { item: any }) => {
        const isPending = new Date(item.date) > new Date();
        const statusColor = isPending ? "#FFB74D" : colors.CHECKBOX_SUCCESS; // Orange for pending, Teal for sent
        const statusIcon = isPending ? "time-outline" : "notifications";
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
                        opacity: isUnread ? 1 : 0.6
                    }
                ]}
            >
                <View style={[styles.iconContainer, { backgroundColor: isPending ? "rgba(255, 183, 77, 0.15)" : "rgba(78, 205, 196, 0.15)" }]}>
                    <Ionicons name={statusIcon} size={20} color={statusColor} />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.itemHeader}>
                        <StyledText style={[
                            styles.itemTitle,
                            {
                                color: colors.PRIMARY_TEXT,
                                fontWeight: isUnread ? "700" : "400"
                            }
                        ]}>{item.title}</StyledText>
                        <StyledText style={styles.itemDate}>
                            {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </StyledText>
                    </View>
                    <StyledText style={[styles.itemBody, { color: colors.PLACEHOLDER }]}>{item.body}</StyledText>
                    {isPending && (
                        <View style={{ marginTop: 4 }}>
                            <StyledText style={{ fontSize: 12, color: "#FFB74D", fontWeight: "600" }}>{t("pending")}</StyledText>
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
    };

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
                        <View style={[modalStyles.iconContainer, { backgroundColor: "rgba(255, 107, 107, 0.15)" }]}>
                            <Ionicons name="trash-outline" size={28} color="#FF6B6B" />
                        </View>
                        <StyledText style={modalStyles.headerText}>{t("confirm_delete")}</StyledText>
                        <View style={modalStyles.divider} />
                        <StyledText style={modalStyles.messageText}>{t("confirm_delete_message")}</StyledText>
                        <View style={modalStyles.buttonsContainer}>
                            <StyledButton label={t("cancel")} onPress={() => setIsDeleteConfirmOpen(false)} variant="blue_button" />
                            <StyledButton label={t("delete")} onPress={confirmClearAll} variant="blue_button" />
                        </View>
                    </View>
                </StyledModal>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        // paddingTop: Platform.OS === 'android' ? 40 : 16, // Removed because we use padding on container now
        position: 'relative',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        zIndex: 10,
    },
    titleContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1, // Brought to front but transparent to touches
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    rightPlaceholder: {
        minWidth: 40,
        alignItems: 'flex-end',
        zIndex: 10,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },

    notificationItem: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
        marginRight: 8,
    },
    itemDate: {
        fontSize: 12,
        color: "#888",
    },
    itemBody: {
        fontSize: 14,
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 100,
    },
});

export default NotificationsModal;
