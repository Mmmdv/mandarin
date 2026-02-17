import BreathingExercise from "@/components/BreathingExercise";
import StyledRefreshControl from "@/components/StyledRefreshControl";
import StyledText from "@/components/StyledText";
import { styles } from "@/constants/homeStyles";
import useRefresh from "@/hooks/useRefresh";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function BreathingScreen() {
    const { colors, t } = useTheme();
    const router = useRouter();
    const { refreshing, onRefresh } = useRefresh();

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <View style={[styles.header, { backgroundColor: colors.PRIMARY_BACKGROUND, paddingBottom: 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={{ justifyContent: 'center', paddingRight: 10 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.PRIMARY_TEXT} />
                </TouchableOpacity>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <StyledText style={styles.greeting}>
                        {t("tab_breathing_title") || "Nəfəs al"}
                    </StyledText>
                </View>
                <View style={{ width: 40, height: 40 }} />
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
                <View style={{ marginTop: 6 }}>
                    <View style={exerciseStyles.exerciseCard}>
                        <BreathingExercise />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const exerciseStyles = {
    exerciseCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 30,
        marginTop: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
};
