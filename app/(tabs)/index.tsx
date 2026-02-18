import StyledText from "@/components/StyledText";
import { COL_2_WIDTH, GAP, PADDING, styles } from "@/constants/homeStyles";
import { useTheme } from "@/hooks/useTheme";
import { incrementUsage, selectUsageStats } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
// import analytics from "@react-native-firebase/analytics";
import StyledRefreshControl from "@/components/StyledRefreshControl";
import useRefresh from "@/hooks/useRefresh";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, LayoutAnimation, Pressable, ScrollView, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const { width } = Dimensions.get("window");

type ViewMode = "card" | "list";

export default function Home() {
    const { colors, t, username } = useTheme();
    const router = useRouter();
    const dispatch = useDispatch();
    const usageStats = useSelector(selectUsageStats);
    const [viewMode, setViewMode] = useState<ViewMode>("card");

    const toggleViewMode = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewMode(prev => prev === "card" ? "list" : "card");
    }, []);

    const baseFeatures = useMemo(() => [
        {
            id: 'todo',
            title: t("tab_todo"),
            description: t("home_plan_day"),
            icon: "checkbox" as keyof typeof Ionicons.glyphMap,
            route: "/(tabs)/todo",
            color: "#322D92",
            iconColor: "#FFF",
            backgroundImage: require("@/assets/images/MainPage/tasksBackground.png"),
            imageOpacity: 0.05
        },
        {
            id: 'movies',
            title: t("tab_movies"),
            description: t("home_movies_desc"),
            icon: "film" as keyof typeof Ionicons.glyphMap,
            route: "/(tabs)/movies",
            color: "#90122E",
            iconColor: "#FFF",
            backgroundImage: require("@/assets/images/MainPage/filmsBackground.png"),
            imageOpacity: 0.12
        },
        {
            id: 'birthday',
            title: t("tab_birthday"),
            description: t("home_birthdays_desc"),
            icon: "gift" as keyof typeof Ionicons.glyphMap,
            route: "/(tabs)/birthday",
            color: "#9D6506",
            iconColor: "#FFF",
            backgroundImage: require("@/assets/images/MainPage/birthdayBackground.png"),
            imageOpacity: 0.12
        },
        {
            id: 'shopping',
            title: t("tab_shopping"),
            description: t("home_shopping_desc"),
            icon: "cart" as keyof typeof Ionicons.glyphMap,
            route: "/(tabs)/shopping",
            color: "#037487",
            iconColor: "#FFF",
            backgroundImage: require("@/assets/images/MainPage/shoppingBackground.png"),
            imageOpacity: 0.12
        },
        {
            id: 'events',
            title: t("tab_events"),
            description: t("home_events_desc"),
            icon: "calendar" as keyof typeof Ionicons.glyphMap,
            route: "/(tabs)/events",
            color: "#593A9D",
            iconColor: "#FFF",
            backgroundImage: require("@/assets/images/MainPage/eventsBackground.png"),
            imageOpacity: 0.12
        },
        {
            id: 'expenses',
            title: t("tab_expenses"),
            description: t("home_expenses_desc"),
            icon: "wallet" as keyof typeof Ionicons.glyphMap,
            route: "/(tabs)/expenses",
            color: "#0A7652",
            iconColor: "#FFF",
            backgroundImage: require("@/assets/images/MainPage/expensesBackground.png"),
            imageOpacity: 0.12
        }
    ], [t]);

    const dynamicFeatures = useMemo(() => {
        return [...baseFeatures].sort((a, b) => {
            const usageA = usageStats?.[a.id] || 0;
            const usageB = usageStats?.[b.id] || 0;

            // If usage is same, keep original order (or prioritize todo)
            if (usageB === usageA) {
                if (a.id === 'todo') return -1;
                if (b.id === 'todo') return 1;
                return 0;
            }

            return usageB - usageA;
        });
    }, [baseFeatures, usageStats]);

    const handlePress = useCallback((id: string, route: string) => {
        dispatch(incrementUsage(id));
        // try {
        //     if (analytics().logSelectContent) {
        //         analytics().logSelectContent({
        //             content_type: 'feature_card',
        //             item_id: id,
        //         });
        //     }
        // } catch (e) {
        //     // Silently fail in Expo Go
        // }
        router.push(route as any);
    }, [router, dispatch]);

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
                        <Ionicons name={item.icon} size={24} color={item.iconColor} />
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <StyledText style={styles.cardTitle}>{item.title}</StyledText>
                    <StyledText style={[styles.cardDesc, isFullWidth ? {} : { fontSize: 11, lineHeight: 14 }]} numberOfLines={2}>
                        {item.description}
                    </StyledText>
                    {isFullWidth && item.subtext && (
                        <StyledText style={[styles.cardDesc, { marginTop: 4, opacity: 0.9, fontSize: 13 }]}>{item.subtext}</StyledText>
                    )}
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
                    <Ionicons name={item.icon} size={22} color={item.iconColor} />
                </View>
                <View style={styles.listTextContainer}>
                    <StyledText style={[styles.listTitle, { color: colors.PRIMARY_TEXT }]}>{item.title}</StyledText>
                    <StyledText style={[styles.listDesc, { color: colors.PLACEHOLDER }]} numberOfLines={1}>{item.description}</StyledText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.PLACEHOLDER} />
            </Pressable>
        );
    }, [handlePress, colors]);

    const { refreshing, onRefresh } = useRefresh();

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <View style={[styles.header, { backgroundColor: colors.PRIMARY_BACKGROUND, paddingBottom: 10 }]}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <StyledText style={styles.greeting}>
                        {t("welcome")}
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
                    <>
                        {/* 1. Full Width - Dynamic Main Card */}
                        <View style={[styles.row, { marginTop: 6 }]}>
                            {renderCard(dynamicFeatures[0], width - (PADDING * 2), 160, true)}
                        </View>

                        {/* 2. Mosaic Row */}
                        <View style={styles.row}>
                            <View style={{ width: COL_2_WIDTH }}>
                                {renderCard(dynamicFeatures[1], COL_2_WIDTH, 260 + GAP)}
                            </View>
                            <View style={{ width: COL_2_WIDTH, gap: GAP }}>
                                {renderCard(dynamicFeatures[2], COL_2_WIDTH, 125)}
                                {renderCard(dynamicFeatures[3], COL_2_WIDTH, 125)}
                            </View>
                        </View>

                        {/* 3. Bottom Row */}
                        <View style={styles.row}>
                            {renderCard(dynamicFeatures[4], COL_2_WIDTH, 130)}
                            {renderCard(dynamicFeatures[5], COL_2_WIDTH, 130)}
                        </View>
                    </>
                ) : (
                    <View style={[styles.listContainer, { marginTop: 6 }]}>
                        {dynamicFeatures.map(item => renderListItem(item))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
