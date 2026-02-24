import StyledHeader from "@/components/ui/StyledHeader";
import StyledText from "@/components/ui/StyledText";
import useBirthday from "@/hooks/useBirthday";
import { useTheme } from "@/hooks/useTheme";
import { Birthday } from "@/types/birthday";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";

interface HistoryItem extends Birthday {
    occurrenceDate: Date;
    occurrenceYear: number;
    ageAtThatTime: number;
}

const BirthdayHistoryPage = () => {
    const { colors, t, isDark } = useTheme();
    const { birthdays } = useBirthday();

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

                // History includes birthdays that happen after (or on) the day the user was added,
                // and strictly before today.
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

        // Sort by occurrence date descending (most recent first)
        return results.sort((a, b) => b.occurrenceDate.getTime() - a.occurrenceDate.getTime());
    }, [birthdays]);

    const formatOccurrenceDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const renderItem = ({ item }: { item: HistoryItem }) => {
        // We can only check greeting status for the year it was last recorded in the slice
        const isGreetingRecordedForThisYear = item.greetingYear === item.occurrenceYear;
        const wasGreeted = isGreetingRecordedForThisYear && item.greetingSent;

        return (
            <View style={[styles.card, {
                backgroundColor: colors.SECONDARY_BACKGROUND,
                borderColor: isDark ? colors.PRIMARY_BORDER_DARK : colors.PRIMARY_BORDER,
            }]}>
                <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(78, 205, 196, 0.15)' : 'rgba(78, 205, 196, 0.1)' }]}>
                    <StyledText style={[styles.avatarText, { color: colors.PRIMARY_TEXT }]}>
                        {item.name.charAt(0).toUpperCase()}
                    </StyledText>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.nameRow}>
                        <StyledText style={[styles.name, { color: colors.PRIMARY_TEXT }]} numberOfLines={1}>
                            {item.name}
                        </StyledText>
                        <View style={[styles.yearBadge, { backgroundColor: colors.TAB_BAR }]}>
                            <StyledText style={{ fontSize: 10, fontWeight: '700', color: colors.PRIMARY_TEXT }}>
                                {item.occurrenceYear}
                            </StyledText>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <StyledText style={[styles.dateText, { color: colors.SECTION_TEXT }]}>
                            {formatOccurrenceDate(item.occurrenceDate)}
                        </StyledText>
                        <View style={styles.dot} />
                        <StyledText style={[styles.dateText, { color: colors.SECTION_TEXT }]}>
                            {item.ageAtThatTime} {t("birthday_age")}
                        </StyledText>
                    </View>
                </View>

                <View style={styles.statusSection}>
                    {isGreetingRecordedForThisYear ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons
                                name={wasGreeted ? "checkmark-done-circle" : "close-circle-outline"}
                                size={16}
                                color={wasGreeted ? "#4ECDC4" : colors.SECTION_TEXT}
                            />
                            <StyledText style={{
                                fontSize: 10,
                                fontWeight: '700',
                                color: wasGreeted ? "#4ECDC4" : colors.SECTION_TEXT
                            }}>
                                {wasGreeted ? t("birthday_greeting_sent") : t("birthday_greeting_not_sent")}
                            </StyledText>
                        </View>
                    ) : (
                        <View style={{ opacity: 0.5 }}>
                            <Ionicons name="calendar-clear-outline" size={16} color={colors.SECTION_TEXT} />
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <StyledHeader title={t("birthday_history")} />

            <FlatList
                data={historyItems}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 15,
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
    }
});

export default BirthdayHistoryPage;
