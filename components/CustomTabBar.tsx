import { COLORS } from "@/constants/ui";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VISIBLE_TABS = 3;
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.70;
const TAB_WIDTH = TAB_BAR_WIDTH / VISIBLE_TABS;

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { t } = useTheme();
    const scrollRef = useRef<ScrollView>(null);
    const isWrapping = useRef(false);
    const isManualScrolling = useRef(false);

    const routes = state.routes;
    // [Last, ...All, First]
    const extendedRoutes = [
        { ...routes[routes.length - 1], _fake: true, _keySuffix: '_fake_start', _originalIndex: routes.length - 1 },
        ...routes.map((r, i) => ({ ...r, _fake: false, _keySuffix: '', _originalIndex: i })),
        { ...routes[0], _fake: true, _keySuffix: '_fake_end', _originalIndex: 0 }
    ];

    // Indices in extended array:
    // 0: Fake Last
    // 1: Real First
    // ...
    // N: Real Last
    // N+1: Fake First

    // Map state.index (0..N-1) to Scroll Position (1..N)
    const getScrollIndex = (realIndex: number) => realIndex + 1;

    const scaleAnims = useRef(
        extendedRoutes.map(() => new Animated.Value(1))
    ).current;

    const translateYAnims = useRef(
        extendedRoutes.map(() => new Animated.Value(0))
    ).current;

    const bgScaleAnims = useRef(
        extendedRoutes.map(() => new Animated.Value(0)) // Start at 0 scale for background
    ).current;

    const bgOpacityAnims = useRef(
        extendedRoutes.map(() => new Animated.Value(0)) // Start invisible
    ).current;

    const getIconName = (routeName: string, isFocused: boolean): keyof typeof Ionicons.glyphMap => {
        switch (routeName) {
            case "home": return isFocused ? "home" : "home-outline";
            case "index": return isFocused ? "list" : "list-outline";
            case "shopping": return isFocused ? "cart" : "cart-outline";
            case "wedding": return isFocused ? "calendar" : "calendar-outline";
            case "movies": return isFocused ? "film" : "film-outline";
            case "utilities": return isFocused ? "flash" : "flash-outline";
            default: return "ellipse-outline";
        }
    };

    const getLabelName = (routeName: string): string => {
        switch (routeName) {
            case "home": return t("tab_home");
            case "index": return t("tab_todo");
            case "shopping": return t("tab_shopping");
            case "wedding": return t("tab_wedding");
            case "movies": return t("tab_movies");
            case "utilities": return t("tab_utilities");
            default: return "";
        }
    };

    const scrollToOffset = (offset: number, animated: boolean) => {
        scrollRef.current?.scrollTo({ x: offset, animated });
    };

    const animateTab = (index: number, focused: boolean) => {
        Animated.parallel([
            // Icon Scale/Float
            Animated.spring(scaleAnims[index], {
                toValue: focused ? 1.1 : 1, // Slightly smaller scale for scale
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.spring(translateYAnims[index], {
                toValue: focused ? 0 : 0,
                friction: 4,
                useNativeDriver: true,
            }),
            // Background Pill Expansion
            Animated.timing(bgScaleAnims[index], {
                toValue: focused ? 1 : 0.5, // Expand from center
                duration: 250,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(bgOpacityAnims[index], {
                toValue: focused ? 1 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    useEffect(() => {
        // Animate all tabs based on current focus
        extendedRoutes.forEach((route, index) => {
            const isFocused = state.index === route._originalIndex;
            animateTab(index, isFocused);
        });

        if (isWrapping.current || isManualScrolling.current) {
            isWrapping.current = false;
            return;
        }

        const scrollIndex = getScrollIndex(state.index);
        scrollToOffset(scrollIndex * TAB_WIDTH, true);
    }, [state.index]);

    const onTabPress = (renderIndex: number, route: any, isFocused: boolean) => {
        const originalIndex = route._originalIndex;

        const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            if (route._fake) {
                isWrapping.current = true;
                // 1. Scroll to fake position
                scrollToOffset(renderIndex * TAB_WIDTH, true);

                // 2. Snap to real position after animation and navigate
                setTimeout(() => {
                    const realScrollIndex = getScrollIndex(originalIndex);
                    scrollToOffset(realScrollIndex * TAB_WIDTH, false);
                    navigation.navigate(route.name);
                }, 150);
            } else {
                navigation.navigate(route.name);
                scrollToOffset(renderIndex * TAB_WIDTH, true);
            }
        }
    };

    const onMomentumScrollEnd = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / TAB_WIDTH);

        isManualScrolling.current = true;

        if (index === 0) {
            // Scrolled to Fake Last -> Go to Real Last
            const realLastIndex = extendedRoutes.length - 2; // N
            const realLastRoute = extendedRoutes[realLastIndex];
            scrollToOffset(realLastIndex * TAB_WIDTH, false);
            navigation.navigate(realLastRoute.name);
        } else if (index === extendedRoutes.length - 1) {
            // Scrolled to Fake First -> Go to Real First
            const realFirstIndex = 1;
            const realFirstRoute = extendedRoutes[realFirstIndex];
            scrollToOffset(realFirstIndex * TAB_WIDTH, false);
            navigation.navigate(realFirstRoute.name);
        } else {
            // Scrolled to a normal tab
            const route = extendedRoutes[index];
            if (route && route._originalIndex !== state.index) {
                navigation.navigate(route.name);
            }
        }

        setTimeout(() => {
            isManualScrolling.current = false;
        }, 100);
    };

    return (
        <View style={styles.tabBarContainer}>
            <View style={styles.tabBarWrapper}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    snapToInterval={TAB_WIDTH}
                    decelerationRate="fast"
                    scrollEnabled={true}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                >
                    {extendedRoutes.map((route, index) => {
                        const isFocused = state.index === route._originalIndex;
                        const iconName = getIconName(route.name, isFocused);
                        const label = getLabelName(route.name);

                        return (
                            <TouchableOpacity
                                key={route.key + route._keySuffix}
                                onPress={() => onTabPress(index, route, isFocused)}
                                activeOpacity={0.7}
                                style={styles.tabButton}
                            >
                                <View style={styles.tabItemContainer}>
                                    {/* Animated Background Pill */}
                                    <Animated.View
                                        style={[
                                            styles.tabBackgroundPill,
                                            {
                                                opacity: bgOpacityAnims[index],
                                                transform: [{ scale: bgScaleAnims[index] }]
                                            }
                                        ]}
                                    />

                                    <Animated.View
                                        style={[
                                            styles.tabItemContent,
                                            {
                                                transform: [
                                                    { scale: scaleAnims[index] },
                                                    { translateY: translateYAnims[index] }
                                                ]
                                            }
                                        ]}
                                    >
                                        <Ionicons
                                            name={iconName}
                                            size={28}
                                            color={isFocused ? "#86cfeeff" : "#e6e2e2ff"}
                                        />
                                        <Text style={[
                                            styles.tabLabel,
                                            {
                                                color: isFocused ? "#86cfeeff" : "#e6e2e2ff",
                                                fontWeight: isFocused ? "700" : "400",
                                            }
                                        ]} numberOfLines={1}>
                                            {label}
                                        </Text>
                                    </Animated.View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    tabBarWrapper: {
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 30,
        borderWidth: 0.8,
        borderColor: COLORS.PRIMARY_BORDER_DARK,
        height: 70,
        width: TAB_BAR_WIDTH,
        overflow: "hidden",
    },
    scrollContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: (TAB_BAR_WIDTH - TAB_WIDTH) / 2, // Dynamically center
    },
    tabButton: {
        width: TAB_WIDTH,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    tabItemContainer: {
        width: "100%",
        height: "80%",
        alignItems: "center",
        justifyContent: "center",
    },
    tabBackgroundPill: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#353f50ff",
        borderRadius: 20,
        zIndex: 0,
    },
    tabItemContent: {
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    tabLabel: {
        fontSize: 8.5,
        marginTop: 3,
        textAlign: "center",
    },
});

export default CustomTabBar;
