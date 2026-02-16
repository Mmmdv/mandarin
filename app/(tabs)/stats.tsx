import StyledText from "@/components/StyledText";
import MonthlyStats from "@/components/today/MonthlyStats";
import { styles } from "@/constants/homeStyles";
import { useTheme } from "@/hooks/useTheme";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

export default function Stats() {
    const { colors, t } = useTheme();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <View style={[styles.header, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <StyledText style={styles.greeting}>
                        {t("tab_stats")}
                    </StyledText>
                </View>
                {/* Placeholder View for alignment consistency */}
                <View style={{ width: 40, height: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.PRIMARY_TEXT}
                        colors={[colors.PRIMARY_TEXT]}
                        progressBackgroundColor={colors.SECONDARY_BACKGROUND}
                    />
                }
            >
                <MonthlyStats />
            </ScrollView>
        </View>
    );
}
