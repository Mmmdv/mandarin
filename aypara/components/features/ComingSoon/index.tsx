import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { styles } from "./styles";

interface ComingSoonProps {
    title?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
    const { colors, t } = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'card' ? 'list' : 'card');
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate refresh delay
        setTimeout(() => {
            setRefreshing(false);
        }, 3000);
    }, []);

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
        <View style={{ flex: 1, backgroundColor: colors.PRIMARY_BACKGROUND }}>
            {title && (
                <View style={[styles.header, { backgroundColor: colors.PRIMARY_BACKGROUND, zIndex: 10 }]}>
                    <Pressable
                        onPress={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                router.replace('/');
                            }
                        }}
                        style={{ justifyContent: 'center', paddingRight: 10, zIndex: 20 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 60 }}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.PRIMARY_TEXT} />
                    </Pressable>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <StyledText style={[styles.headerTitle, { color: colors.PRIMARY_TEXT }]}>
                            {title}
                        </StyledText>
                    </View>
                    <Pressable
                        onPress={toggleViewMode}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: colors.SECONDARY_BACKGROUND
                        }}
                    >
                        <Ionicons
                            name={viewMode === "card" ? "list" : "grid"}
                            size={20}
                            color={colors.PRIMARY_TEXT}
                        />
                    </Pressable>
                </View>
            )}
            <ScrollView
                contentContainerStyle={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.PRIMARY_TEXT}
                        colors={[colors.PRIMARY_TEXT]}
                        progressBackgroundColor={colors.SECONDARY_BACKGROUND}
                    />
                }
            >
                <Animated.View style={[styles.content, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.SECONDARY_BACKGROUND }]}>
                        <Ionicons name="rocket-outline" size={60} color="#4ECDC4" />
                    </View>
                    <StyledText style={[styles.title, { color: colors.PRIMARY_TEXT }]}>
                        {t("coming_soon")}
                    </StyledText>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

export default ComingSoon;
