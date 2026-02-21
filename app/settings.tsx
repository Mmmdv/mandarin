import ApplicationSection from "@/components/features/settings/sections/ApplicationSection";
import LanguageSection from "@/components/features/settings/sections/LanguageSection";
import NotificationSection from "@/components/features/settings/sections/NotificationSection";
import PermissionsSection from "@/components/features/settings/sections/PermissionsSection";
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
                    <View style={[styles.divider, { backgroundColor: colors.PRIMARY_BORDER }]} />

                    <ThemeSection />
                    <View style={[styles.divider, { backgroundColor: colors.PRIMARY_BORDER }]} />

                    <NotificationSection visible={true} />
                    <View style={[styles.divider, { backgroundColor: colors.PRIMARY_BORDER }]} />

                    <PermissionsSection />
                    <View style={[styles.divider, { backgroundColor: colors.PRIMARY_BORDER }]} />

                    <SecuritySection />
                    <View style={[styles.divider, { backgroundColor: colors.PRIMARY_BORDER }]} />

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
        height: 0.4,
        width: '100%',
        marginVertical: 20,
        opacity: 0.4,
    },
});
