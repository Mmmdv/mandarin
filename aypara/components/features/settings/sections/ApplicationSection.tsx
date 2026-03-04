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
import React, { useMemo } from "react";
import { DevSettings, Image, Linking, Platform, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { getSettingsStyles } from "../styles";

const ApplicationSection: React.FC = () => {
    const { colors, t } = useTheme();
    const dispatch = useDispatch();
    const styles = useMemo(() => getSettingsStyles(colors), [colors]);
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
            await Notifications.cancelAllScheduledNotificationsAsync();
            await AsyncStorage.clear();
            await persistor.purge();
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
        setTimeout(async () => {
            try {
                if (Updates && typeof Updates.reloadAsync === 'function') {
                    await Updates.reloadAsync();
                } else if (__DEV__) {
                    DevSettings.reload();
                }
            } catch (reloadError) {
                console.error("Failed to reload app:", reloadError);
                if (__DEV__) {
                    DevSettings.reload();
                }
            }
        }, 500);
    };

    return (
        <>
            <View style={styles.section}>
                <StyledText style={styles.sectionTitle}>{t("application")}</StyledText>
                <View style={styles.aboutContainer}>
                    <View style={styles.aboutRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Image
                                source={require("@/assets/images/logo.png")}
                                style={{ width: 32, height: 32, borderRadius: 8 }}
                            />
                            <View>
                                <StyledText style={[styles.aboutLabel, { fontWeight: '600' }]}>{t("version")}</StyledText>
                                <StyledText style={{ fontSize: 13, color: colors.PLACEHOLDER }}>v{appVersion}</StyledText>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.aboutRow}
                        onPress={handleRateUs}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons name="star" size={20} color={colors.PLACEHOLDER} />
                            <StyledText style={styles.aboutLabel}>{t("rate_us")}</StyledText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.PLACEHOLDER} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.aboutRow, { borderBottomWidth: 0 }]}
                        onPress={handleResetStorage}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 0 }}>
                            <Ionicons name="trash-bin" size={20} color={colors.PLACEHOLDER} />
                            <StyledText style={styles.aboutLabel}>{t("reset_factory")}</StyledText>
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
