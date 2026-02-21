import { useTheme } from "@/hooks/useTheme";
import { useAppSelector } from "@/store";
import { selectAppSettings, updateAppSetting } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    AccessibilityInfo,
    Linking,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useDispatch } from "react-redux";

const ReducedMotionModal: React.FC = () => {
    const [isReducedMotion, setIsReducedMotion] = useState(false);
    const [visible, setVisible] = useState(false);
    const { colors, t } = useTheme();
    const dispatch = useDispatch();
    const { reducedMotionDismissed } = useAppSelector(selectAppSettings);

    useEffect(() => {
        // Check reduced motion on mount
        AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
            setIsReducedMotion(enabled);
            if (enabled && !reducedMotionDismissed) {
                setVisible(true);
            }
        });

        // Listen for changes to reduced motion setting
        const subscription = AccessibilityInfo.addEventListener(
            "reduceMotionChanged",
            (enabled) => {
                setIsReducedMotion(enabled);
                if (!enabled) {
                    // User fixed it — close the modal automatically
                    setVisible(false);
                }
            }
        );

        return () => {
            subscription.remove();
        };
    }, [reducedMotionDismissed]);

    const handleOpenSettings = () => {
        if (Platform.OS === "ios") {
            Linking.openURL("App-Prefs:ACCESSIBILITY");
        } else {
            Linking.openSettings();
        }
    };

    const handleDismiss = () => {
        setVisible(false);
        dispatch(updateAppSetting({ reducedMotionDismissed: true }));
    };

    const handleClose = () => {
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.SECONDARY_BACKGROUND }]}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, { backgroundColor: colors.PRIMARY_ACTIVE_BUTTON + "20" }]}>
                        <Ionicons
                            name="speedometer-outline"
                            size={36}
                            color={colors.CHECKBOX_SUCCESS}
                        />
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: colors.PRIMARY_TEXT }]}>
                        {t("reduced_motion_title")}
                    </Text>

                    {/* Message */}
                    <Text style={[styles.message, { color: colors.SECTION_TEXT }]}>
                        {t("reduced_motion_message")}
                    </Text>

                    {/* Instructions */}
                    <View style={[styles.instructionBox, { backgroundColor: colors.PRIMARY_BACKGROUND }]}>
                        {Platform.OS === "android" ? (
                            <>
                                <Text style={[styles.instructionText, { color: colors.PRIMARY_TEXT }]}>
                                    Settings → Developer Options
                                </Text>
                                <Text style={[styles.instructionDetail, { color: colors.SECTION_TEXT }]}>
                                    Window animation scale → 1x{"\n"}
                                    Transition animation scale → 1x{"\n"}
                                    Animator duration scale → 1x
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.instructionText, { color: colors.PRIMARY_TEXT }]}>
                                    Settings → Accessibility → Motion
                                </Text>
                                <Text style={[styles.instructionDetail, { color: colors.SECTION_TEXT }]}>
                                    Reduce Motion → OFF
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Buttons */}
                    <Pressable
                        style={[styles.primaryButton, { backgroundColor: colors.CHECKBOX_SUCCESS }]}
                        onPress={handleOpenSettings}
                    >
                        <Ionicons name="settings-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.primaryButtonText}>
                            {t("reduced_motion_open_settings")}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.secondaryButton, { borderColor: colors.PRIMARY_BORDER_DARK }]}
                        onPress={handleDismiss}
                    >
                        <Text style={[styles.secondaryButtonText, { color: colors.SECTION_TEXT }]}>
                            {t("reduced_motion_dismiss")}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "88%",
        borderRadius: 16,
        padding: 28,
        alignItems: "center",
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 10,
        textAlign: "center",
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        marginBottom: 18,
    },
    instructionBox: {
        width: "100%",
        borderRadius: 10,
        padding: 14,
        marginBottom: 22,
    },
    instructionText: {
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 6,
    },
    instructionDetail: {
        fontSize: 12,
        lineHeight: 18,
    },
    primaryButton: {
        width: "100%",
        height: 48,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    secondaryButton: {
        width: "100%",
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: "500",
    },
});

export default React.memo(ReducedMotionModal);
