import GestureWrapper from "@/components/layout/GestureWrapper";
import ApplicationSection from "@/components/features/settings/sections/ApplicationSection";
import LanguageSection from "@/components/features/settings/sections/LanguageSection";
import NotificationSection from "@/components/features/settings/sections/NotificationSection";
import SecuritySection from "@/components/features/settings/sections/SecuritySection";
import ThemeSection from "@/components/features/settings/sections/ThemeSection";
import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
    const { colors, t } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <GestureWrapper>
            <View style={[styles.mainContainer, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                <View style={[
                    styles.header,
                    {
                        borderBottomColor: colors.PRIMARY_BORDER_DARK,
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        paddingTop: 55
                    }
                ]}>
                    <View style={styles.leftSection}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.PRIMARY_TEXT} />
                        </TouchableOpacity>

                        <View style={styles.titleContainer}>
                            <StyledText style={[styles.headerTitle, { color: colors.PRIMARY_TEXT }]}>
                                {t("settings")}
                            </StyledText>
                        </View>
                    </View>

                    <View style={styles.rightPlaceholder} />
                </View>

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
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 0.5,
        position: 'relative',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        zIndex: 10,
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    titleContainer: {
        marginLeft: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    rightPlaceholder: {
        minWidth: 40,
        alignItems: 'flex-end',
        zIndex: 10,
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
