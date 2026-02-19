import StyledButton from "@/components/ui/StyledButton";
import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectAppSettings, updateAppSetting } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

const BiometricGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { colors, t } = useTheme();
    const dispatch = useAppDispatch();
    const { biometricEnabled } = useAppSelector(selectAppSettings);

    // UI state
    const [isLocked, setIsLocked] = useState(biometricEnabled);

    // Logic refs to store state without re-triggering effects or loops
    const isAuthenticating = useRef(false);
    const lastSuccessTime = useRef(0);
    const lastBackgroundTime = useRef(0);
    const currentAppState = useRef(AppState.currentState);

    const authenticate = async (isManual = false) => {
        if (isAuthenticating.current) return;

        // IMMUNITY: If we successfully unlocked in the last 30 seconds, 
        // DO NOT lock again. This breaks the infinite loop.
        const now = Date.now();
        if (!isManual && (now - lastSuccessTime.current < 30000)) {
            setIsLocked(false);
            return;
        }

        isAuthenticating.current = true;

        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();
            const isEnrolled = enrolledLevel !== LocalAuthentication.SecurityLevel.NONE;

            if (hasHardware && isEnrolled) {
                // To force FaceID permission to appear in settings, 
                // we try to authenticate. On iOS, the first attempt triggers the system prompt.
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: t("authenticate_to_open"),
                    fallbackLabel: t("cancel"),
                    cancelLabel: t("cancel"),
                    disableDeviceFallback: false, // Allow passcode but prioritize biometrics
                });

                if (result.success) {
                    lastSuccessTime.current = Date.now();
                    // Slight delay to ensure the OS system dialog is fully gone before UI updates
                    setTimeout(() => setIsLocked(false), 300);
                } else {
                    setIsLocked(true);
                }
            } else {
                // No biometrics - don't lock the user out
                setIsLocked(false);
                if (biometricEnabled) {
                    dispatch(updateAppSetting({ biometricEnabled: false }));
                }
            }
        } catch (error) {
            console.error("Biometric Guard Error:", error);
            setIsLocked(false);
        } finally {
            // Keep the flag true for a bit longer to skip the AppState change 
            // triggered by the closing of the FaceID/Passcode dialog.
            setTimeout(() => {
                isAuthenticating.current = false;
            }, 1000);
        }
    };

    const handleEmergencyBypass = () => {
        Alert.alert(
            t("security"),
            "Biometrik kilid söndürülsün?",
            [
                { text: t("cancel"), style: "cancel" },
                {
                    text: "Bəli, Söndür",
                    style: "destructive",
                    onPress: () => {
                        dispatch(updateAppSetting({ biometricEnabled: false }));
                        setIsLocked(false);
                        lastSuccessTime.current = Date.now();
                    }
                }
            ]
        );
    };

    // 1. Initial trigger or setting toggle
    useEffect(() => {
        if (biometricEnabled) {
            if (Date.now() - lastSuccessTime.current > 10000) {
                setIsLocked(true);
                authenticate(false);
            }
        } else {
            setIsLocked(false);
        }
    }, [biometricEnabled]);

    // 2. AppState change handling (Background -> Foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (!biometricEnabled) return;

            if (currentAppState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App is coming to foreground
                const timeInBg = Date.now() - lastBackgroundTime.current;

                // CRITICAL: Only re-lock if:
                // 1. App was away for more than 45 seconds (shorter than this is usually just the dialog closing)
                // 2. We are not currently in an authentication process (prevents loop)
                // 3. We don't have the 30s immunity after a success
                if (timeInBg > 45000 && !isAuthenticating.current) {
                    if (Date.now() - lastSuccessTime.current > 30000) {
                        setIsLocked(true);
                        authenticate(false);
                    }
                }
            } else if (nextAppState.match(/inactive|background/)) {
                // App is going to background
                // Only record this if NOT currently authenticating
                if (!isAuthenticating.current) {
                    lastBackgroundTime.current = Date.now();
                }
            }

            currentAppState.current = nextAppState;
        });

        return () => subscription.remove();
    }, [biometricEnabled]);

    if (!isLocked) {
        return <>{children}</>;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
            <View style={[styles.circleOverlay, { backgroundColor: colors.CHECKBOX_SUCCESS, opacity: 0.05, top: -50, right: -50 }]} />
            <View style={[styles.circleOverlay, { backgroundColor: colors.CHECKBOX_SUCCESS, opacity: 0.03, bottom: -100, left: -100, width: 300, height: 300 }]} />

            <View style={styles.content}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onLongPress={handleEmergencyBypass}
                    delayLongPress={5000}
                    style={[styles.lockIconContainer, {
                        backgroundColor: colors.SECONDARY_BACKGROUND,
                        borderColor: colors.PRIMARY_BORDER_DARK,
                        shadowColor: colors.CHECKBOX_SUCCESS
                    }]}
                >
                    <Ionicons name="lock-closed" size={44} color={colors.CHECKBOX_SUCCESS} />
                </TouchableOpacity>

                <StyledText style={[styles.title, { color: colors.PRIMARY_TEXT }]}>
                    {t("authenticate_to_open")}
                </StyledText>

                <StyledText style={[styles.description, { color: colors.PLACEHOLDER }]}>
                    {t("biometrics_desc")}
                </StyledText>

                <View style={styles.buttonContainer}>
                    <StyledButton
                        label={t("retry")}
                        onPress={() => authenticate(true)}
                        variant="blue_button"
                        style={styles.retryButton}
                        vibrate={true}
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <Ionicons name="shield-checkmark" size={16} color={colors.PLACEHOLDER} style={{ marginRight: 6 }} />
                <StyledText style={[styles.footerText, { color: colors.PLACEHOLDER }]}>
                    Secure Storage Protected
                </StyledText>
            </View>
        </View>
    );
};

export default BiometricGuard;
