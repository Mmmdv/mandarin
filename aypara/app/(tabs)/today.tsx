import ImportantTasksToday from "@/components/features/today/ImportantTasksToday";
import MoodTracker from "@/components/features/today/MoodTracker";
import RatingTracker from "@/components/features/today/RatingTracker";
import WeightTracker from "@/components/features/today/WeightTracker";
import StyledRefreshControl from "@/components/ui/StyledRefreshControl";
import StyledText from "@/components/ui/StyledText";
import { getStyles } from "@/constants/homeStyles";
import useRefresh from "@/hooks/useRefresh";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";

export default function Today() {
    const { colors, t } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const router = useRouter();
    const { refreshing, onRefresh } = useRefresh();

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingBottom: 10 }]}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <StyledText style={styles.greeting}>
                        {t("tab_today")}
                    </StyledText>
                </View>
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
