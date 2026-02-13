import { useTheme } from "@/hooks/useTheme";
import { incrementUsage } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
// import analytics from "@react-native-firebase/analytics";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { generateSideItems, getIconName, getLabelName } from "./helpers";
import { SIDE_ITEMS, TAB_WIDTH, styles } from "./styles";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { t } = useTheme();
    const dispatch = useDispatch();
    const scrollRef = useRef<ScrollView>(null);
    const isWrapping = useRef(false);
    const isManualScrolling = useRef(false);
    const isUserDragging = useRef(false);
    const currentScrollIndex = useRef(SIDE_ITEMS);

    const routes = state.routes;

    // Helper to map route name to usage ID
    const getUsageId = (routeName: string) => {
        if (routeName === 'index') return null; // Skip home
        return routeName; // other routes like 'todo', 'movies' match their screen names
    };

    const extendedRoutes = [
        ...generateSideItems(routes, SIDE_ITEMS, true).map((r, i) => ({
            ...r,
            _fake: true,
            _keySuffix: `_fake_start_${i}`,
            _originalIndex: routes.findIndex(route => route.key === r.key)
        })),
        ...routes.map((r, i) => ({ ...r, _fake: false, _keySuffix: '', _originalIndex: i })),
        ...generateSideItems(routes, SIDE_ITEMS, false).map((r, i) => ({
            ...r,
            _fake: true,
            _keySuffix: `_fake_end_${i}`,
            _originalIndex: routes.findIndex(route => route.key === r.key)
        }))
    ];

    const getScrollIndex = (realIndex: number) => realIndex + SIDE_ITEMS;

    const scaleAnims = useRef(
        extendedRoutes.map(() => new Animated.Value(1))
    ).current;

    const translateYAnims = useRef(
        extendedRoutes.map(() => new Animated.Value(0))
    ).current;

    const bgScaleAnims = useRef(
        extendedRoutes.map(() => new Animated.Value(0))
    ).current;

    const bgOpacityAnims = useRef(
        extendedRoutes.map(() => new Animated.Value(0))
    ).current;

    const scrollToOffset = (offset: number, animated: boolean) => {
        scrollRef.current?.scrollTo({ x: offset, animated });
    };

    const animateTab = (index: number, focused: boolean) => {
        Animated.parallel([
            Animated.spring(scaleAnims[index], {
                toValue: focused ? 1.1 : 1,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.spring(translateYAnims[index], {
                toValue: focused ? 0 : 0,
                friction: 4,
                useNativeDriver: true,
            }),
            Animated.timing(bgScaleAnims[index], {
                toValue: focused ? 1 : 0.5,
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

    // Find the closest extended route index that matches the target originalIndex
    const findClosestMatchingIndex = (targetOriginalIndex: number) => {
        const currentIdx = currentScrollIndex.current;
        let closestIdx = getScrollIndex(targetOriginalIndex); // default: real position
        let closestDist = Math.abs(closestIdx - currentIdx);

        for (let i = 0; i < extendedRoutes.length; i++) {
            if (extendedRoutes[i]._originalIndex === targetOriginalIndex) {
                const dist = Math.abs(i - currentIdx);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIdx = i;
                }
            }
        }

        return closestIdx;
    };

    const onScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        currentScrollIndex.current = Math.round(offsetX / TAB_WIDTH);
    };

    useEffect(() => {
        extendedRoutes.forEach((route, index) => {
            const isFocused = state.index === route._originalIndex;
            animateTab(index, isFocused);
        });

        if (isWrapping.current || isManualScrolling.current) {
            isWrapping.current = false;
            return;
        }

        // Find the closest copy of the target tab and animate to it
        const closestIdx = findClosestMatchingIndex(state.index);
        const realScrollIndex = getScrollIndex(state.index);

        if (closestIdx !== realScrollIndex) {
            // Animate to the closest fake copy, then silently jump to the real position
            scrollToOffset(closestIdx * TAB_WIDTH, true);
            setTimeout(() => {
                scrollToOffset(realScrollIndex * TAB_WIDTH, false);
                currentScrollIndex.current = realScrollIndex;
            }, 250);
        } else {
            scrollToOffset(realScrollIndex * TAB_WIDTH, true);
            currentScrollIndex.current = realScrollIndex;
        }
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

            const usageId = getUsageId(route.name);
            if (usageId) {
                dispatch(incrementUsage(usageId));
                // try {
                //     if (analytics().logSelectContent) {
                //         analytics().logSelectContent({
                //             content_type: 'tab_navigation',
                //             item_id: usageId,
                //         });
                //     }
                // } catch (e) {
                //     // Silently fail in Expo Go
                // }
            }

            if (route._fake) {
                isWrapping.current = true;
                scrollToOffset(renderIndex * TAB_WIDTH, true);

                setTimeout(() => {
                    const realScrollIndex = getScrollIndex(originalIndex);
                    scrollToOffset(realScrollIndex * TAB_WIDTH, false);
                    navigation.navigate(route.name);
                }, 150);
            } else {
                navigation.navigate(route.name);
            }
        }
    };

    const onScrollBeginDrag = () => {
        isUserDragging.current = true;
    };

    const onMomentumScrollEnd = (event: any) => {
        if (!isUserDragging.current) {
            return;
        }

        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / TAB_WIDTH);

        isManualScrolling.current = true;

        const route = extendedRoutes[index];

        if (route) {
            const usageId = getUsageId(route.name);
            if (usageId && route._originalIndex !== state.index) {
                dispatch(incrementUsage(usageId));
                // try {
                //     if (analytics().logSelectContent) {
                //         analytics().logSelectContent({
                //             content_type: 'tab_swipe',
                //             item_id: usageId,
                //         });
                //     }
                // } catch (e) {
                //     // Silently fail in Expo Go
                // }
            }
        }

        if (route._fake) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const realIndex = route._originalIndex;
            const realScrollIndex = getScrollIndex(realIndex);
            scrollToOffset(realScrollIndex * TAB_WIDTH, false);
            navigation.navigate(route.name);
        } else {
            if (route && route._originalIndex !== state.index) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
            }
        }

        setTimeout(() => {
            isManualScrolling.current = false;
            isUserDragging.current = false;
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
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    onScrollBeginDrag={onScrollBeginDrag}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                >
                    {extendedRoutes.map((route, index) => {
                        const isFocused = state.index === route._originalIndex;
                        const iconName = getIconName(route.name, isFocused);
                        const label = getLabelName(route.name, t);

                        return (
                            <TouchableOpacity
                                key={route.key + route._keySuffix}
                                onPress={() => onTabPress(index, route, isFocused)}
                                activeOpacity={0.7}
                                style={styles.tabButton}
                            >
                                <View style={styles.tabItemContainer}>
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
                                            size={26}
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

export default CustomTabBar;
