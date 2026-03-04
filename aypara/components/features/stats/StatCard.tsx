import StyledText from "@/components/ui/StyledText";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { statsStyles } from './styles';

interface StatCardProps {
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBg: string;
    label: string;
    value: string | number;
    delay: number;
    colors: any;
    emoji?: string;
}

export function StatCard({ icon, iconColor, iconBg, label, value, delay, colors, emoji }: StatCardProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [value, delay, fadeAnim, slideAnim]);

    return (
        <Animated.View
            style={[
                statsStyles.statCard,
                {
                    backgroundColor: colors.SECONDARY_BACKGROUND,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={[statsStyles.statIconWrap, { backgroundColor: iconBg }]}>
                {emoji ? (
                    <StyledText style={{ fontSize: 18 }}>{emoji}</StyledText>
                ) : (
                    <Ionicons name={icon!} size={20} color={iconColor} />
                )}
            </View>
            <StyledText style={[statsStyles.statValue, { color: colors.PRIMARY_TEXT }]}>
                {value}
            </StyledText>
            <StyledText style={[statsStyles.statLabel, { color: colors.PLACEHOLDER }]}>
                {label}
            </StyledText>
        </Animated.View>
    );
}
