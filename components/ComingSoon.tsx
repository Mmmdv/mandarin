import StyledText from "@/components/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const ComingSoon: React.FC = () => {
    const { colors, t } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <Animated.View style={[styles.content, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.SECONDARY_BACKGROUND }]}>
                    <Ionicons name="rocket-outline" size={60} color="#4ECDC4" />
                </View>
                <StyledText style={[styles.title, { color: colors.PRIMARY_TEXT }]}>
                    {t("coming_soon")}
                </StyledText>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        paddingBottom: 110, // Account for TabBar height (70 + 20 bottom + 20 padding)
    },
    content: {
        alignItems: "center",
        gap: 20,
        width: "100%",
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        elevation: 5,
        backgroundColor: "#131519", // Default dark, overridden by theme
        shadowColor: "#4ECDC4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        lineHeight: 30,
        maxWidth: "80%",
    },
});

export default ComingSoon;
