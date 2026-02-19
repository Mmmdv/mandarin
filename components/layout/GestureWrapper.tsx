import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, usePathname } from 'expo-router';
import React, { useCallback } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

type GestureWrapperProps = {
    children: React.ReactNode;
};

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const GestureWrapper: React.FC<GestureWrapperProps> = ({ children }) => {
    const pathname = usePathname();
    const { colors } = useTheme();
    const translateX = useSharedValue(0);
    const isThresholdMet = useSharedValue(false);

    // Dynamic threshold based on screen width
    const threshold = -width * 0.35;

    const navigateToHome = useCallback(() => {
        // Only navigate if not already on home
        // In Expo Router (tabs), home is usually '/' or '/index'
        if (pathname !== '/' && pathname !== '/index' && pathname !== '(tabs)') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(tabs)');
        }
    }, [pathname]);

    const gesture = Gesture.Pan()
        .activeOffsetX(-15) // Require 15px movement to the left to start
        .failOffsetY([-40, 40]) // Fail if moving too much vertically
        .onUpdate((e) => {
            // Only allow right-to-left swipe
            if (e.translationX < 0) {
                translateX.value = e.translationX;

                const met = e.translationX < threshold;
                if (met !== isThresholdMet.value) {
                    isThresholdMet.value = met;
                    if (met) {
                        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
                    }
                }
            }
        })
        .onEnd((e) => {
            if (e.translationX < threshold || (e.translationX < -50 && e.velocityX < -800)) {
                runOnJS(navigateToHome)();
            }
            translateX.value = withSpring(0);
            isThresholdMet.value = false;
        });

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, -60],
            [0, 1],
            Extrapolate.CLAMP
        );

        // Calculate how far the bubble should move into the screen
        const translation = interpolate(
            translateX.value,
            [0, threshold],
            [80, -20], // Move from off-screen (80) to 20px from right edge
            Extrapolate.CLAMP
        );

        const scale = withSpring(isThresholdMet.value ? 1.2 : 1, { damping: 12 });

        return {
            opacity,
            transform: [
                { translateX: translation },
                { scale }
            ],
        };
    });

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            color: isThresholdMet.value ? "#86cfeeff" : colors.PRIMARY_TEXT,
            transform: [
                { rotate: `${interpolate(translateX.value, [0, threshold], [0, -15], Extrapolate.CLAMP)}deg` }
            ]
        };
    });

    const animatedBubbleStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: isThresholdMet.value
                ? colors.PRIMARY_ACTIVE_BUTTON
                : colors.SECONDARY_BACKGROUND + 'BB',
            borderColor: isThresholdMet.value ? "#86cfeeff" : colors.PRIMARY_BORDER_DARK,
        };
    });

    return (
        <View style={styles.container}>
            <GestureDetector gesture={gesture}>
                <Animated.View style={styles.container}>
                    {children}

                    {/* Visual Indicator - Appears on the right side */}
                    <Animated.View style={[styles.indicator, animatedIndicatorStyle]}>
                        <Animated.View style={[styles.indicatorCircle, animatedBubbleStyle]}>
                            <AnimatedIonicons
                                name="home"
                                size={28}
                                style={animatedIconStyle}
                            />
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    indicator: {
        position: 'absolute',
        right: 0,
        top: height / 2 - 40,
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        pointerEvents: 'none',
    },
    indicatorCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    }
});

export default GestureWrapper;
