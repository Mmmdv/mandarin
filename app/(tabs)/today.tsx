import StyledRefreshControl from "@/components/ui/StyledRefreshControl";
import StyledText from "@/components/ui/StyledText";
import ImportantTasksToday from "@/components/features/today/ImportantTasksToday";
import MoodTracker from "@/components/features/today/MoodTracker";
import RatingTracker from "@/components/features/today/RatingTracker";
import WeightTracker from "@/components/features/today/WeightTracker";
import { styles } from "@/constants/homeStyles";
import useRefresh from "@/hooks/useRefresh";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";

export default function Today() {
    const { colors, t } = useTheme();
    const router = useRouter();
    const { refreshing, onRefresh } = useRefresh();

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <View style={[styles.header, { backgroundColor: colors.PRIMARY_BACKGROUND, paddingBottom: 10 }]}>
                {/* Back button removed as per user request */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <StyledText style={styles.greeting}>
                        {t("tab_today")}
                    </StyledText>
                </View>
                {/* Placeholder View for alignment consistency with other headers having icons */}
                {/* Right placeholder to keep title centered if needed */}
                <View style={{ width: 0, height: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <StyledRefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <ImportantTasksToday />
                <MoodTracker />
                <WeightTracker />
                <RatingTracker />
            </ScrollView>
        </View>
    );
}
