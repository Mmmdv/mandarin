import StyledText from "@/components/StyledText";
import { formatDate } from "@/helpers/date";
import { useTheme } from "@/hooks/useTheme";
import { selectNotifications } from "@/store/slices/notificationSlice";
import { Todo } from "@/types/todo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

type TodayTasksModalProps = {
    isOpen: boolean;
    onClose: () => void;
    tasks: Todo[];
};

const TodayTasksModal: React.FC<TodayTasksModalProps> = ({
    isOpen,
    onClose,
    tasks
}) => {
    const { colors, t, lang } = useTheme();
    const insets = useSafeAreaInsets();
    const notifications = useSelector(selectNotifications);
    const router = useRouter();

    const handleItemPress = (item: Todo) => {
        const notification = notifications.find(n => n.id === item.notificationId);
        const icon = notification?.categoryIcon;

        let path: any = "/(tabs)/todo"; // Default fallback
        if (icon) {
            if (icon.includes('cart')) path = "/(tabs)/shopping";
            else if (icon.includes('gift')) path = "/(tabs)/birthday";
            else if (icon.includes('ticket')) path = "/(tabs)/events";
            else if (icon.includes('film')) path = "/(tabs)/movies";
            else if (icon.includes('wallet')) path = "/(tabs)/expenses";
            else if (icon.includes('list')) path = "/(tabs)/todo";
        }

        onClose();
        // Use a small timeout to let the modal close smoothly before navigating
        setTimeout(() => {
            router.push(path);
        }, 100);
    };

    const getTimeFromReminder = (reminder: string) => {
        return formatDate(reminder, lang).split(' ')[1];
    };

    const isOverdue = (reminder: string) => {
        return new Date(reminder) < new Date();
    };

    const renderItem = useCallback(({ item, index }: { item: Todo; index: number }) => {
        const itemIsOverdue = item.reminder ? isOverdue(item.reminder) : false;

        // Premium color palette for non-overdue tasks
        const palette = [
            '#14B8A6', // Teal
            '#3B82F6', // Blue
            '#6366F1', // Indigo
            '#8B5CF6', // Purple
        ];

        const baseColor = palette[index % palette.length];
        const statusColor = itemIsOverdue ? '#eb637aff' : baseColor; // Aesthetic Rose Red for overdue
        const statusIcon = itemIsOverdue ? "alert-circle-outline" : "time-outline";
        const statusLabel = itemIsOverdue ? t("status_overdue") : t("status_pending");

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleItemPress(item)}
                style={[
                    localStyles.notificationItem,
                    {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        borderColor: colors.PRIMARY_BORDER_DARK,
                        borderLeftWidth: 4,
                        borderLeftColor: statusColor,
                    }
                ]}
            >
                <View style={{ width: 44, alignItems: 'center' }}>
                    <View style={[
                        localStyles.iconContainer,
                        {
                            backgroundColor: `${statusColor}15`,
                            // Glow effect matching the specific item color
                            shadowColor: statusColor,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: itemIsOverdue ? 0.6 : 0.3,
                            shadowRadius: 10,
                            elevation: itemIsOverdue ? 5 : 2,
                        }
                    ]}>
                        <Ionicons
                            name={(notifications.find(n => n.id === item.notificationId)?.categoryIcon as any) || "list-outline"}
                            size={22}
                            color={statusColor}
                        />
                    </View>
                </View>
                <View style={localStyles.contentContainer}>
                    <StyledText style={[
                        localStyles.itemTitle,
                        {
                            color: colors.PRIMARY_TEXT,
                            fontWeight: "600",
                        }
                    ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >{item.title}</StyledText>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Ionicons name={statusIcon} size={14} color={statusColor} />
                        <StyledText style={{ fontSize: 12, color: statusColor, fontWeight: "600" }}>
                            {getTimeFromReminder(item.reminder!)} • {statusLabel}
                        </StyledText>
                    </View>
                </View>

                {/* Right Arrow Icon */}
                <View style={localStyles.rightIconContainer}>
                    <Ionicons name="chevron-forward" size={18} color={colors.PLACEHOLDER} />
                </View>
            </TouchableOpacity>
        );
    }, [colors]);

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isOpen}
            onRequestClose={onClose}
        >
            <View style={[localStyles.container, { backgroundColor: colors.PRIMARY_BACKGROUND, paddingBottom: insets.bottom }]}>
                {/* Header */}
                <View style={[
                    localStyles.header,
                    {
                        borderBottomColor: colors.PRIMARY_BORDER_DARK,
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        paddingTop: insets.top + 16
                    }
                ]}>
                    <TouchableOpacity onPress={onClose} style={localStyles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.PRIMARY_TEXT} />
                    </TouchableOpacity>

                    <View style={localStyles.titleContainer}>
                        <StyledText style={[localStyles.headerTitle, { color: colors.PRIMARY_TEXT }]}>
                            {t('today_tasks_header')}
                        </StyledText>
                    </View>

                    <View style={localStyles.rightPlaceholder} />
                </View>

                {/* Content */}
                <FlatList
                    data={tasks}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={localStyles.listContent}
                    ListEmptyComponent={
                        <View style={localStyles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={64} color={colors.PLACEHOLDER} style={{ marginBottom: 16 }} />
                            <StyledText style={{ color: colors.PLACEHOLDER, fontSize: 16 }}>{t("no_results")}</StyledText>
                        </View>
                    }
                />
            </View>
        </Modal>
    );
};

const localStyles = StyleSheet.create({
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
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        zIndex: 10,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    rightPlaceholder: {
        width: 40,
    },
    listContent: {
        padding: 20,
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
    itemTitle: {
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 20,
        marginBottom: 2,
    },
    rightIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 100,
    },
});

export default TodayTasksModal;
