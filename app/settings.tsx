import ApplicationSection from "@/components/features/settings/sections/ApplicationSection";
import LanguageSection from "@/components/features/settings/sections/LanguageSection";
import NotificationSection from "@/components/features/settings/sections/NotificationSection";
import SecuritySection from "@/components/features/settings/sections/SecuritySection";
import ThemeSection from "@/components/features/settings/sections/ThemeSection";
import GestureWrapper from "@/components/layout/GestureWrapper";
import StyledHeader from "@/components/ui/StyledHeader";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
    const { colors, t } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <GestureWrapper>
            <View style={[styles.mainContainer, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                <StyledHeader title={t("settings")} />

                <ScrollView
                    contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 40 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <LanguageSection />
                    <View style={[styles.divider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />

                    <ThemeSection />
                    <View style={[styles.divider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />

                    <NotificationSection visible={true} />
                    <View style={[styles.divider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />

                    <SecuritySection />
                    <View style={[styles.divider, { backgroundColor: colors.PRIMARY_BORDER_DARK }]} />

                    <ApplicationSection />
                </ScrollView>
            </View>
        </GestureWrapper>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    scrollContainer: {
        padding: 20,
    },
    divider: {
        height: 0.5,
        width: '100%',
        marginVertical: 12,
        opacity: 0.5,
    },
});
