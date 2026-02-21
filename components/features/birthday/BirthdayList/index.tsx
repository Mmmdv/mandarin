import StyledRefreshControl from "@/components/ui/StyledRefreshControl";
import StyledText from "@/components/ui/StyledText";
import useRefresh from "@/hooks/useRefresh";
import { useTheme } from "@/hooks/useTheme";
import { Birthday } from "@/types/birthday";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import DeleteBirthdayModal from "../modals/DeleteBirthdayModal";
import GreetingModal from "../modals/GreetingModal";

// ─── Əsas səhifədəki birthday kartına uyğun rəng paleti ───
const BIRTHDAY_PRIMARY = "#9D6506";        // Əsas qızılı (home card color)
const BIRTHDAY_LIGHT = "#D4880F";          // Parlaq qızılı (icon/text)
const BIRTHDAY_BG = "rgba(157, 101, 6, 0.10)";   // Arxa fon
const BIRTHDAY_BG_STRONG = "rgba(157, 101, 6, 0.20)"; // Badge/vurğu
const BIRTHDAY_BORDER = "rgba(157, 101, 6, 0.30)";    // Border

type BirthdayListProps = {
    birthdays: Birthday[];
    todayBirthdays: Birthday[];
    upcomingBirthdays: Birthday[];
    onDelete: (id: string) => void;
    onMarkGreetingSent: (id: string) => void;
    onAddRequest: () => void;
    getDaysUntilBirthday: (date: string) => number;
    getAge: (date: string) => number;
};

const BirthdayList: React.FC<BirthdayListProps> = ({
    birthdays,
    todayBirthdays,
    upcomingBirthdays,
    onDelete,
    onMarkGreetingSent,
    onAddRequest,
    getDaysUntilBirthday,
    getAge,
}) => {
    const { colors, t } = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const { refreshing, onRefresh } = useRefresh();

    const [deleteTarget, setDeleteTarget] = useState<Birthday | null>(null);
    const [greetingTarget, setGreetingTarget] = useState<Birthday | null>(null);

    const formatBirthdayDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const getDaysLabel = (days: number) => {
        if (days === 0) return t("birthday_today");
        if (days === 1) return t("birthday_tomorrow");
        return `${days} ${t("birthday_days_left")}`;
    };

    const getDaysColor = (days: number) => {
        if (days === 0) return BIRTHDAY_LIGHT;
        if (days === 1) return "#FFD166";
        if (days <= 7) return "#4ECDC4";
        return colors.SECTION_TEXT;
    };

    // Empty state
    if (birthdays.length === 0) {
        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                router.replace("/");
                            }
                        }}
                        style={{ marginRight: 10, zIndex: 20 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 60 }}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.PRIMARY_TEXT} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, justifyContent: "center" }} pointerEvents="none">
                        <StyledText style={[styles.headerTitle, { color: colors.PRIMARY_TEXT }]}>
                            {t("tab_birthday")}
                        </StyledText>
                    </View>
                    {/* Right spacer to match filled state layout (width and height must match addButton) */}
                    <View style={{ width: 40, height: 40 }} />
                </View>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingBottom: 80 }}
                    refreshControl={
                        <StyledRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View style={styles.emptyContainer}>
                        <View
                            style={[
                                styles.emptyIcon,
                                {
                                    backgroundColor: colors.SECONDARY_BACKGROUND,
                                    shadowColor: BIRTHDAY_PRIMARY,
                                },
                            ]}
                        >
                            <Ionicons name="gift-outline" size={64} color={BIRTHDAY_LIGHT} />
                        </View>
                        <StyledText
                            style={{ fontSize: 22, fontWeight: "bold", color: colors.PRIMARY_TEXT, marginBottom: 8 }}
                        >
                            {t("birthday_empty_title")}
                        </StyledText>
                        <StyledText
                            style={{
                                fontSize: 16,
                                color: colors.PLACEHOLDER,
                                textAlign: "center",
                                marginBottom: 32,
                                paddingHorizontal: 40,
                            }}
                        >
                            {t("birthday_empty_desc")}
                        </StyledText>
                        <TouchableOpacity
                            onPress={onAddRequest}
                            activeOpacity={0.8}
                            style={[
                                styles.emptyButton,
                                {
                                    backgroundColor: colors.SECONDARY_BACKGROUND,
                                    borderColor: colors.PRIMARY_BORDER_DARK,
                                    shadowColor: BIRTHDAY_PRIMARY,
                                },
                            ]}
                        >
                            <Ionicons name="add" size={24} color={BIRTHDAY_LIGHT} />
                            <StyledText style={{ color: BIRTHDAY_LIGHT, fontSize: 16, fontWeight: "bold" }}>
                                {t("birthday_add")}
                            </StyledText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    const renderBirthdayCard = (item: Birthday) => {
        const daysUntil = getDaysUntilBirthday(item.date);
        const age = getAge(item.date);
        const nextAge = age + (daysUntil === 0 ? 0 : 1);
        const isToday = daysUntil === 0;
        const currentYear = new Date().getFullYear();
        const alreadyGreeted = item.greetingSent && item.greetingYear === currentYear;

        return (
            <View
                key={item.id}
                style={[
                    styles.card,
                    {
                        backgroundColor: isToday
                            ? BIRTHDAY_BG
                            : colors.SECONDARY_BACKGROUND,
                        borderColor: isToday
                            ? BIRTHDAY_BORDER
                            : colors.PRIMARY_BORDER_DARK,
                    },
                ]}
            >
                {/* Avatar */}
                <View
                    style={[
                        styles.avatar,
                        {
                            backgroundColor: isToday
                                ? BIRTHDAY_BG_STRONG
                                : "rgba(157, 101, 6, 0.12)",
                        },
                    ]}
                >
                    <StyledText style={styles.avatarText}>
                        {isToday ? "🎂" : item.name.charAt(0).toUpperCase()}
                    </StyledText>
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                    <View style={styles.nameRow}>
                        <StyledText
                            style={[styles.name, { color: colors.PRIMARY_TEXT }]}
                            numberOfLines={1}
                        >
                            {item.nickname ? `${item.nickname} ` : ""}
                            {item.name}
                        </StyledText>
                    </View>

                    <View style={styles.infoRow}>
                        <StyledText style={[styles.dateText, { color: colors.SECTION_TEXT }]}>
                            {formatBirthdayDate(item.date)}
                        </StyledText>
                        <View style={styles.dot} />
                        <StyledText style={[styles.dateText, { color: colors.SECTION_TEXT }]}>
                            {nextAge} {t("birthday_age")}
                        </StyledText>
                    </View>

                    {/* Days remaining badge */}
                    <View style={[styles.daysBadge, { backgroundColor: getDaysColor(daysUntil) + "20" }]}>
                        <StyledText style={[styles.daysText, { color: getDaysColor(daysUntil) }]}>
                            {getDaysLabel(daysUntil)}
                        </StyledText>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    {isToday && (
                        <TouchableOpacity
                            onPress={() => {
                                if (alreadyGreeted) return;
                                setGreetingTarget(item);
                            }}
                            style={[
                                styles.actionButton,
                                {
                                    backgroundColor: alreadyGreeted
                                        ? "rgba(78, 205, 196, 0.15)"
                                        : BIRTHDAY_BG,
                                },
                            ]}
                        >
                            <Ionicons
                                name={alreadyGreeted ? "checkmark-circle" : "chatbubble-ellipses"}
                                size={18}
                                color={alreadyGreeted ? "#4ECDC4" : BIRTHDAY_LIGHT}
                            />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => setDeleteTarget(item)}
                        style={[styles.actionButton, { backgroundColor: "rgba(255, 107, 107, 0.1)" }]}
                    >
                        <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            router.replace("/");
                        }
                    }}
                    style={{ marginRight: 10, zIndex: 20 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 60 }}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.PRIMARY_TEXT} />
                </TouchableOpacity>
                <View style={{ flex: 1, justifyContent: "center" }} pointerEvents="none">
                    <StyledText style={[styles.headerTitle, { color: colors.PRIMARY_TEXT }]}>
                        {t("tab_birthday")}
                    </StyledText>
                </View>
                {/* Right spacer to match empty state layout and maintain centering */}
                <View style={{ width: 40, height: 40 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <StyledRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Today's birthdays */}
                {todayBirthdays.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: BIRTHDAY_BG }]}>
                                <StyledText style={{ fontSize: 14 }}>🎂</StyledText>
                            </View>
                            <StyledText style={[styles.sectionTitle, { color: colors.SECTION_TEXT }]}>
                                {t("birthday_today")}
                            </StyledText>
                            <View style={[styles.badge, { backgroundColor: BIRTHDAY_BG_STRONG }]}>
                                <StyledText style={[styles.badgeText, { color: BIRTHDAY_LIGHT }]}>
                                    {todayBirthdays.length}
                                </StyledText>
                            </View>
                        </View>
                        {todayBirthdays.map(renderBirthdayCard)}
                    </View>
                )}

                {/* Upcoming birthdays */}
                {upcomingBirthdays.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: "rgba(78, 205, 196, 0.15)" }]}>
                                <Ionicons name="time-outline" size={14} color="#4ECDC4" />
                            </View>
                            <StyledText style={[styles.sectionTitle, { color: colors.SECTION_TEXT }]}>
                                {t("birthday_upcoming")}
                            </StyledText>
                            <View style={[styles.badge, { backgroundColor: "rgba(78, 205, 196, 0.15)" }]}>
                                <StyledText style={[styles.badgeText, { color: "#4ECDC4" }]}>
                                    {upcomingBirthdays.length}
                                </StyledText>
                            </View>
                        </View>
                        {upcomingBirthdays.map(renderBirthdayCard)}
                    </View>
                )}

                {/* All birthdays */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIcon, { backgroundColor: BIRTHDAY_BG }]}>
                            <Ionicons name="people-outline" size={14} color={BIRTHDAY_LIGHT} />
                        </View>
                        <StyledText style={[styles.sectionTitle, { color: colors.SECTION_TEXT }]}>
                            {t("birthday_all")}
                        </StyledText>
                        <View style={[styles.badge, { backgroundColor: BIRTHDAY_BG_STRONG }]}>
                            <StyledText style={[styles.badgeText, { color: BIRTHDAY_LIGHT }]}>
                                {birthdays.length}
                            </StyledText>
                        </View>
                    </View>
                    {birthdays.map(renderBirthdayCard)}
                </View>
            </ScrollView>

            {/* Modals */}
            <DeleteBirthdayModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDelete={() => {
                    if (deleteTarget) {
                        onDelete(deleteTarget.id);
                        setDeleteTarget(null);
                    }
                }}
                name={deleteTarget?.name}
            />

            <GreetingModal
                isOpen={!!greetingTarget}
                onClose={() => setGreetingTarget(null)}
                onSend={() => {
                    if (greetingTarget) {
                        onMarkGreetingSent(greetingTarget.id);
                    }
                }}
                personName={greetingTarget?.name || ""}
                nickname={greetingTarget?.nickname}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 15,
        paddingBottom: 10,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 24,
        marginBottom: 4,
        fontWeight: "bold",
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 8,
    },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        flex: 1,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 14,
        borderWidth: 0.5,
        marginBottom: 8,
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "700",
    },
    cardContent: {
        flex: 1,
        gap: 3,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    name: {
        fontSize: 15,
        fontWeight: "600",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dateText: {
        fontSize: 12,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#888",
    },
    daysBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 2,
    },
    daysText: {
        fontSize: 11,
        fontWeight: "600",
    },
    actions: {
        flexDirection: "column",
        gap: 6,
    },
    actionButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    emptyIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    emptyButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 15,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});

export default BirthdayList;
