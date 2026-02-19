import StyledRefreshControl from "@/components/ui/StyledRefreshControl";
import StyledText from "@/components/ui/StyledText";
import { GAP, PADDING, styles } from "@/constants/homeStyles";
import useRefresh from "@/hooks/useRefresh";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, LayoutAnimation, Pressable, ScrollView, View } from "react-native";

const { width } = Dimensions.get("window");

type ViewMode = "card" | "list";

export default function MoreScreen() {
    const { colors, t } = useTheme();
    const router = useRouter();
    const { refreshing, onRefresh } = useRefresh();
    const [viewMode, setViewMode] = useState<ViewMode>("card");

    const toggleViewMode = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewMode(prev => prev === "card" ? "list" : "card");
    }, []);

    const menuItems = useMemo(() => [
        {
            id: "mandarin_tree",
            title: t("mandarin_tree"),
            description: t("coming_soon"),
            icon: "tree" as keyof typeof MaterialCommunityIcons.glyphMap, // İndi həqiqətən ağac ikonu var
            route: "/more",
            color: "#1F8B4C",
            iconColor: "#FFF",
            backgroundImage: require("@/assets/images/MainPage/mandarinBackground.png"),
            imageOpacity: 0.1
        },
        {
            id: "breathing",
            title: t("tab_breathing_title"),
            description: t("breathing_desc"),
            icon: "weather-windy" as keyof typeof MaterialCommunityIcons.glyphMap, // Nəfəs / külək hissi
            route: "/breathing",
            color: "#978265",
            iconColor: "#FFF",
            backgroundImage: require("@/assets/images/MainPage/relaxBackground.png"),
            imageOpacity: 0.1
        },
    ], [t, colors]);

    const handlePress = useCallback((id: string, route: string) => {
        router.push(route as any);
    }, [router]);

    const renderCard = useCallback((item: any, cardWidth: number, height: number = 150, isFullWidth: boolean = false) => {
        return (
            <Pressable
                key={item.id}
                style={({ pressed }) => [
                    styles.card,
                    {
                        backgroundColor: item.color,
                        width: cardWidth,
                        height: height,
                        opacity: pressed ? 0.9 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }]
                    }
                ]}
                onPress={() => handlePress(item.id, item.route)}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <MaterialCommunityIcons name={item.icon} size={28} color={item.iconColor} />
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <StyledText style={styles.cardTitle}>{item.title}</StyledText>
                    <StyledText style={[styles.cardDesc, isFullWidth ? {} : { fontSize: 11, lineHeight: 14 }]} numberOfLines={2}>
                        {item.description}
                    </StyledText>
                </View>

                <View style={[styles.decorativeCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                {item.backgroundImage && (
                    <Image
                        source={item.backgroundImage}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: item.imageOpacity || 0.15,
                            zIndex: 0
                        }}
                        contentFit="cover"
                        transition={600}
                    />
                )}
            </Pressable>
        );
    }, [handlePress]);

    const renderListItem = useCallback((item: any) => {
        return (
            <Pressable
                key={item.id}
                style={({ pressed }) => [
                    styles.listItem,
                    {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        opacity: pressed ? 0.85 : 1,
                        transform: [{ scale: pressed ? 0.98 : 1 }]
                    }
                ]}
                onPress={() => handlePress(item.id, item.route)}
            >
                <View style={[styles.listIconContainer, { backgroundColor: item.color }]}>
                    <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
                </View>
                <View style={styles.listTextContainer}>
                    <StyledText style={[styles.listTitle, { color: colors.PRIMARY_TEXT }]}>{item.title}</StyledText>
                    <StyledText style={[styles.listDesc, { color: colors.PLACEHOLDER }]} numberOfLines={1}>{item.description}</StyledText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.PLACEHOLDER} />
            </Pressable>
        );
    }, [handlePress, colors]);

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <View style={[styles.header, { backgroundColor: colors.PRIMARY_BACKGROUND, paddingBottom: 10 }]}>
                {/* <Pressable onPress={() => router.back()} style={{ justifyContent: 'center', paddingRight: 10 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.PRIMARY_TEXT} />
                </Pressable> */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <StyledText style={styles.greeting}>
                        {t("tab_more")}
                    </StyledText>
                </View>
                <Pressable
                    onPress={toggleViewMode}
                    style={({ pressed }) => [
                        styles.viewToggleButton,
                        {
                            backgroundColor: colors.SECONDARY_BACKGROUND,
                            opacity: pressed ? 0.7 : 1,
                        }
                    ]}
                    hitSlop={8}
                >
                    <Ionicons
                        name={viewMode === "card" ? "list" : "grid"}
                        size={20}
                        color={colors.PRIMARY_TEXT}
                    />
                </Pressable>
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
                {viewMode === "card" ? (
                    <View style={{ gap: GAP, marginTop: 6 }}>
                        {/* More screen uses full width cards for its few items */}
                        {menuItems.map(item => (
                            <View key={item.id} style={styles.row}>
                                {renderCard(item, width - (PADDING * 2), 120, true)}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={[styles.listContainer, { marginTop: 6 }]}>
                        {menuItems.map(item => renderListItem(item))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

