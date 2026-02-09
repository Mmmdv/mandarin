import { COLORS } from "@/constants/ui";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const scaleAnims = useRef(
        state.routes.map(() => new Animated.Value(1))
    ).current;

    const rotateAnims = useRef(
        state.routes.map(() => new Animated.Value(0))
    ).current;

    const getIconName = (routeName: string, isFocused: boolean): keyof typeof Ionicons.glyphMap => {
        if (routeName === "index") {
            return isFocused ? "home" : "home-outline";
        } else if (routeName === "about") {
            return isFocused ? "information-circle" : "information-circle-outline";
        } else if (routeName === "settings") {
            return isFocused ? "settings" : "settings-outline";
        }
        return "home";
    };

    const onTabPress = (index: number, route: any, isFocused: boolean) => {
        const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            // Haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // Reset animations
            scaleAnims[index].setValue(0.8);
            rotateAnims[index].setValue(0);

            // Combined animation: scale + subtle rotation
            Animated.parallel([
                Animated.sequence([
                    Animated.spring(scaleAnims[index], {
                        toValue: 1.20,
                        friction: 3,
                        tension: 300,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnims[index], {
                        toValue: 1,
                        friction: 4,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(rotateAnims[index], {
                        toValue: 1,
                        duration: 150,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnims[index], {
                        toValue: 0,
                        duration: 150,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();

            navigation.navigate(route.name);
        }
    };

    return (
        <View style={styles.tabBarContainer}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.title || route.name;
                    const isFocused = state.index === index;
                    const iconName = getIconName(route.name, isFocused);

                    const rotate = rotateAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '15deg'],
                    });

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => onTabPress(index, route, isFocused)}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                style={[
                                    styles.tabItem,
                                    isFocused && styles.tabItemActive,
                                    {
                                        transform: [
                                            { scale: scaleAnims[index] },
                                            { rotate: rotate }
                                        ]
                                    }
                                ]}
                            >
                                <Ionicons
                                    name={iconName}
                                    size={26}
                                    color={isFocused ? "#5BC0EB" : "#e6e2e2ff"}
                                />
                                <Text style={[
                                    styles.tabLabel,
                                    {
                                        color: isFocused ? "#5BC0EB" : "#e6e2e2ff",
                                        fontWeight: isFocused ? "600" : "400",
                                    }
                                ]}>
                                    {label}
                                </Text>
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
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
    tabBar: {
        flexDirection: "row",
        backgroundColor: COLORS.SECONDARY_BACKGROUND,
        borderRadius: 35,
        borderWidth: 0.4,
        borderColor: "#3a3f47",
        height: 60,
        width: SCREEN_WIDTH * 0.65,
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    tabItem: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 5,
        paddingHorizontal: 25,
        borderRadius: 35,
    },
    tabItemActive: {
        backgroundColor: "#3a3f47",
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 2,
    },
});

export default CustomTabBar;
