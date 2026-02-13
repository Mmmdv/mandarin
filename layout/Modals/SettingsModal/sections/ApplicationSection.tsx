import StyledText from "@/components/StyledText";
import { useTheme } from "@/hooks/useTheme";
import ResetAppModal from "@/layout/Modals/ResetAppModal";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import React from "react";
import { Alert, Image, Linking, Platform, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

const ApplicationSection: React.FC = () => {
    const { colors, t } = useTheme();
    const [isResetModalOpen, setIsResetModalOpen] = React.useState(false);

    const appVersion = Constants.expoConfig?.version ?? '1.0.0';

    const handleRateUs = () => {
        const storeUrl = Platform.OS === 'ios'
            ? 'https://apps.apple.com/app/id6443574936'
            : 'https://play.google.com/store/apps/details?id=com.mmmdv.todolistapp';
        Linking.openURL(storeUrl).catch(err => console.error("An error occurred", err));
    };

    const handleResetStorage = () => {
        setIsResetModalOpen(true);
    };

    const onConfirmReset = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            if (keys.length > 0) {
                await AsyncStorage.clear();
            }

            try {
                if (Updates && Updates.reloadAsync) {
                    await Updates.reloadAsync();
                } else {
                    throw new Error("Updates module not available");
                }
            } catch (reloadError) {
                Alert.alert(
                    t("success") || "Uğurlu",
                    "Tətbiq sıfırlandı. Zəhmət olmasa tətbiqi yenidən başladın."
                );
            }
        } catch (error) {
            console.error("Failed to reset storage:", error);
            Alert.alert(t("error") || "Xəta", "Məlumatları silmək mümkün olmadı.");
        } finally {
            setIsResetModalOpen(false);
        }
    };

    return (
        <>
            <View style={styles.section}>
                <StyledText style={[styles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>{t("application")}</StyledText>
                <View style={styles.aboutContainer}>
                    <View style={[styles.aboutRow, { borderColor: colors.PRIMARY_BORDER_DARK, borderBottomWidth: 0 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Image
                                source={require("@/assets/images/logo.png")}
                                style={{ width: 35, height: 35, borderRadius: 8 }}
                            />
                            <View>
                                <StyledText style={{ fontSize: 16, fontWeight: '600', color: colors.PRIMARY_TEXT }}>{t("version")}</StyledText>
                                <StyledText style={{ fontSize: 13, color: colors.PLACEHOLDER }}>v{appVersion}</StyledText>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.aboutRow, { borderColor: colors.PRIMARY_BORDER_DARK, borderBottomWidth: 0 }]}
                        onPress={handleRateUs}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons name="star" size={20} color="#888" />
                            <StyledText style={[styles.aboutLabel, { color: colors.PRIMARY_TEXT }]}>{t("rate_us")}</StyledText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.PLACEHOLDER} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.aboutRow, { borderColor: colors.PRIMARY_BORDER_DARK, borderBottomWidth: 0 }]}
                        onPress={handleResetStorage}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons name="trash-bin" size={20} color="#888" />
                            <StyledText style={[styles.aboutLabel, { color: colors.PRIMARY_TEXT }]}>{t("reset_factory")}</StyledText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.PLACEHOLDER} />
                    </TouchableOpacity>
                </View>
            </View>

            <ResetAppModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onReset={onConfirmReset}
            />
        </>
    );
};

export default ApplicationSection;
