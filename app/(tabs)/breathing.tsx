import BreathingExercise from "@/components/features/BreathingExercise";
import StyledRefreshControl from "@/components/ui/StyledRefreshControl";
import StyledText from "@/components/ui/StyledText";
import { getStyles } from "@/constants/homeStyles";
import useRefresh from "@/hooks/useRefresh";
import { useTheme } from "@/hooks/useTheme";
import { selectIsBreathingActive } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

export default function BreathingScreen() {
    const { colors, t } = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const router = useRouter();
    const { refreshing, onRefresh } = useRefresh();
    const isBreathingActive = useSelector(selectIsBreathingActive);
    const navigation = useNavigation();

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (!isBreathingActive) {
                return;
            }
            e.preventDefault();
        });
        return unsubscribe;
    }, [navigation, isBreathingActive]);

    const handleBackPress = () => {
        if (isBreathingActive) return;
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            router.replace('/');
        }
    };

    const exerciseStyles = StyleSheet.create({
        exerciseCard: {
            backgroundColor: colors.SECONDARY_BACKGROUND,
            borderRadius: 30,
            marginTop: 15,
            borderWidth: 1,
            borderColor: colors.PRIMARY_BORDER,
            overflow: 'hidden',
        },
    });

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingBottom: 10, zIndex: 10 }]}>
                <TouchableOpacity
                    onPress={handleBackPress}
                    style={{ justifyContent: 'center', paddingRight: 10, opacity: isBreathingActive ? 0.3 : 1, zIndex: 20 }}
                    disabled={isBreathingActive}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 60 }}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.PRIMARY_TEXT} />
                </TouchableOpacity>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <StyledText style={styles.greeting}>
                        {t("tab_breathing_title") || "Nəfəs al"}
                    </StyledText>
                </View>
                <View style={{ width: 40, height: 40 }} />
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
                <View style={{ marginTop: 6 }}>
                    <View style={exerciseStyles.exerciseCard}>
                        <BreathingExercise />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
