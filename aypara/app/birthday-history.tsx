import IsGreetingModal from "@/components/features/birthday/modals/IsGreetingModal";
import StyledHeader from "@/components/ui/StyledHeader";
import StyledText from "@/components/ui/StyledText";
import useBirthday from "@/hooks/useBirthday";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch } from "@/store";
import { markAllHistoryRead, markHistoryGreeted, markHistoryRead } from "@/store/slices/birthdaySlice";
import { Birthday } from "@/types/birthday";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

interface HistoryItem extends Birthday {
    occurrenceDate: Date;
    occurrenceYear: number;
    ageAtThatTime: number;
}

const BirthdayHistoryPage = () => {
    const { colors, t, isDark } = useTheme();
    const { birthdays } = useBirthday();
    const dispatch = useAppDispatch();
    const [selectedFilter, setSelectedFilter] = React.useState<'all' | 'greeted' | 'missed'>('all');

    const historyItems = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const results: HistoryItem[] = [];

        birthdays.forEach(b => {
            const bDate = new Date(b.date);
            const createdDate = new Date(b.createdAt);
            createdDate.setHours(0, 0, 0, 0);

            const startYear = createdDate.getFullYear();
            const endYear = today.getFullYear();

            for (let year = startYear; year <= endYear; year++) {
                const occurrence = new Date(year, bDate.getMonth(), bDate.getDate());
                occurrence.setHours(0, 0, 0, 0);

                if (occurrence >= createdDate && occurrence < today) {
                    results.push({
                        ...b,
                        occurrenceDate: occurrence,
                        occurrenceYear: year,
                        ageAtThatTime: year - bDate.getFullYear()
                    });
                }
            }
        });

        return results.sort((a, b) => b.occurrenceDate.getTime() - a.occurrenceDate.getTime());
    }, [birthdays]);

    const filteredItems = useMemo(() => {
        if (selectedFilter === 'all') return historyItems;
        return historyItems.filter(item => {
            const wasGreeted = (item.greetingYear === item.occurrenceYear && item.greetingSent) ||
                (item.greetedHistory && item.greetedHistory.includes(item.occurrenceYear));
            return selectedFilter === 'greeted' ? wasGreeted : !wasGreeted;
        });
    }, [historyItems, selectedFilter]);

    const formatOccurrenceDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const handleMarkAllAsRead = useCallback(() => {
        const payload = historyItems
            .filter(item => !item.readHistory?.includes(item.occurrenceYear))
            .map(item => ({ id: item.id, year: item.occurrenceYear }));

        if (payload.length > 0) {
            dispatch(markAllHistoryRead(payload));
        }
    }, [historyItems, dispatch]);

    const [confirmTarget, setConfirmTarget] = React.useState<HistoryItem | null>(null);

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const wasGreeted = (item.greetingYear === item.occurrenceYear && item.greetingSent) ||
            (item.greetedHistory && item.greetedHistory.includes(item.occurrenceYear));
        const isUnread = !item.readHistory || !item.readHistory.includes(item.occurrenceYear);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                    if (isUnread) {
                        dispatch(markHistoryRead({ id: item.id, year: item.occurrenceYear }));
                    }
                }}
                style={[styles.card, {
                    backgroundColor: colors.SECONDARY_BACKGROUND,
                    borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
                    opacity: isUnread ? 1 : 0.8,
                    borderWidth: 0.5,
                }]}
            >
                <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                    <StyledText style={[styles.avatarText, { color: colors.PRIMARY_TEXT }]}>
                        {item.name.charAt(0).toUpperCase()}
                    </StyledText>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.nameRow}>
                        <StyledText style={[
                            styles.name,
                            {
                                color: colors.PRIMARY_TEXT,
                                fontSize: 14,
                                fontWeight: isUnread ? "600" : "500"
                            }
                        ]} numberOfLines={1}>
                            {item.name}
                        </StyledText>
                    </View>

                    <View style={styles.infoRow}>
                        <StyledText style={[styles.dateText, { color: colors.SECTION_TEXT, fontSize: 11 }]}>
                            {formatOccurrenceDate(item.occurrenceDate)}
                        </StyledText>
                        <View style={styles.dot} />
                        <StyledText style={[styles.dateText, { color: colors.SECTION_TEXT, fontSize: 11 }]}>
                            {item.ageAtThatTime} {t("birthday_age")}
                        </StyledText>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Ionicons
                            name={wasGreeted ? "checkmark-done-circle" : "close-circle-outline"}
                            size={12}
                            color={wasGreeted ? "#4ECDC4" : colors.SECTION_TEXT}
                        />
                        <StyledText style={{
                            fontSize: 10,
                            fontWeight: '600',
                            color: wasGreeted ? "#4ECDC4" : colors.SECTION_TEXT
                        }}>
                            {wasGreeted ? t("stats_birthday_greeted") : t("stats_birthday_missed")}
                        </StyledText>
                    </View>
                </View>

                {!wasGreeted && (
                    <TouchableOpacity
                        onPress={() => setConfirmTarget(item)}
                        hitSlop={20}
                        style={{
                            padding: 6,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Ionicons name="checkmark-done" size={14} color={colors.PRIMARY_TEXT} />
                    </TouchableOpacity>
                )}

                {isUnread && (
                    <View style={{ justifyContent: 'center', marginLeft: 4 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.CHECKBOX_SUCCESS }} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <StyledHeader
                title={t("birthday_history")}
                rightSection={
                    historyItems.some(item => !item.readHistory?.includes(item.occurrenceYear)) && (
                        <TouchableOpacity onPress={handleMarkAllAsRead} hitSlop={10}>
                            <Ionicons name="checkmark-done-outline" size={22} color={colors.CHECKBOX_SUCCESS} />
                        </TouchableOpacity>
                    )
                }
            />

            <View style={{ paddingVertical: 12 }}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[
                        { key: 'all', label: t('all') },
                        { key: 'greeted', label: t('stats_birthday_greeted') },
                        { key: 'missed', label: t('stats_birthday_missed') },
                    ]}
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexGrow: 1, justifyContent: 'center' }}
                    renderItem={({ item }) => {
                        const isSelected = selectedFilter === item.key;
                        return (
                            <TouchableOpacity
                                onPress={() => setSelectedFilter(item.key as any)}
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

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id}-${item.occurrenceYear}-${index}`}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.SECONDARY_BACKGROUND }]}>
                            <Ionicons name="calendar-outline" size={48} color={colors.PLACEHOLDER} style={{ opacity: 0.5 }} />
                        </View>
                        <StyledText style={{ color: colors.PLACEHOLDER, fontSize: 16 }}>{t("no_results")}</StyledText>
                    </View>
                }
            />

            <IsGreetingModal
                isOpen={!!confirmTarget}
                onClose={() => setConfirmTarget(null)}
                onConfirm={() => {
                    if (confirmTarget) {
                        dispatch(markHistoryGreeted({ id: confirmTarget.id, year: confirmTarget.occurrenceYear }));
                    }
                }}
                name={confirmTarget?.name}
                year={confirmTarget?.occurrenceYear}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 40,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 16,
        borderWidth: 0.2,
        marginBottom: 12,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "700",
    },
    cardContent: {
        flex: 1,
        gap: 2,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        fontSize: 15,
        fontWeight: "600",
        maxWidth: '70%',
    },
    yearBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 6,
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
    statusSection: {
        justifyContent: 'center',
        minWidth: 80,
        alignItems: 'flex-end',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
});

export default BirthdayHistoryPage;
