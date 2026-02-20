import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import ResetAppModal from "@/layout/Modals/ResetAppModal";
import ResetSuccessModal from "@/layout/Modals/ResetSuccessModal";
import { persistor } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
import React from "react";
import { DevSettings, Image, Linking, Platform, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { styles } from "../styles";

const ApplicationSection: React.FC = () => {
    const { colors, t } = useTheme();
    const dispatch = useDispatch();
    const [isResetModalOpen, setIsResetModalOpen] = React.useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(false);

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
            // 1. Cancel all notifications in the OS
            await Notifications.cancelAllScheduledNotificationsAsync();

            // 2. Clear all AsyncStorage data (including Redux persist data)
            await AsyncStorage.clear();

            // 3. Clear Redux state and its persistence
            await persistor.purge();

            // 4. Dispatch global reset action to clear in-memory state
            dispatch({ type: 'RESET_APP' });

            setIsResetModalOpen(false);
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error("Failed to reset storage:", error);
            setIsResetModalOpen(false);
        }
    };

    const handleCloseSuccess = () => {
        setIsSuccessModalOpen(false);
        // Add a small delay to ensure the modal is closing/closed before reload
        setTimeout(async () => {
            try {
                if (Updates && typeof Updates.reloadAsync === 'function') {
                    await Updates.reloadAsync();
                } else if (__DEV__) {
                    DevSettings.reload();
                }
            } catch (reloadError) {
                console.error("Failed to reload app:", reloadError);
                // Fallback for development
                if (__DEV__) {
                    DevSettings.reload();
                }
            }
        }, 500);
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
                                style={{ width: 32, height: 32, borderRadius: 8 }}
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

            <ResetSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleCloseSuccess}
            />
        </>
    );
};


export default ApplicationSection;
