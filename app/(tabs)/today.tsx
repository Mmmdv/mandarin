import StyledText from "@/components/StyledText";
import ImportantTasksToday from "@/components/today/ImportantTasksToday";
import MoodTracker from "@/components/today/MoodTracker";
import RatingTracker from "@/components/today/RatingTracker";
import WeightTracker from "@/components/today/WeightTracker";
import { styles } from "@/constants/homeStyles";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";

export default function Today() {
    const { colors, t } = useTheme();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate a network request or data refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.PRIMARY_TEXT} // For iOS
                        colors={[colors.PRIMARY_TEXT]} // For Android
                        progressBackgroundColor={colors.SECONDARY_BACKGROUND} // Android background
                    />
                }
            >
                <View style={styles.header}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <StyledText style={styles.greeting}>
                            {t("tab_today")}
                        </StyledText>
                    </View>
                </View>
                <ImportantTasksToday />
                <MoodTracker />
                <WeightTracker />
                <RatingTracker />
            </ScrollView>
        </View>
    );
}
