import CustomSwitch from "@/components/ui/CustomSwitch";
import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from 'expo-local-authentication';
import React from "react";
import { Alert, View } from "react-native";
import { styles } from "../styles";

const SecuritySection: React.FC = () => {
    const { colors, t, biometricEnabled } = useTheme();
    const dispatch = useAppDispatch();

    const handleBiometricToggle = async (value: boolean) => {
        if (value) {
            // Check if hardware supports biometrics
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                Alert.alert(t("error"), t("biometrics_not_available"));
                return;
            }

            // Just enable. The BiometricGuard will immediately catch the state change 
            // and prompt for authentication once.
            dispatch(updateAppSetting({ biometricEnabled: true }));
        } else {
            // Deactivating requires authentication for security
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: t("authenticate_to_open"),
                fallbackLabel: t("cancel"),
            });

            if (result.success) {
                dispatch(updateAppSetting({ biometricEnabled: false }));
            }
        }
    };

    return (
        <View style={styles.section}>
            <StyledText style={[styles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>{t("security")}</StyledText>
            <View style={styles.aboutContainer}>
                <View style={[styles.aboutRow, { borderColor: colors.PRIMARY_BORDER_DARK, borderBottomWidth: 0, backgroundColor: colors.SECONDARY_BACKGROUND }]}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="finger-print" size={20} color={biometricEnabled ? colors.CHECKBOX_SUCCESS : "#888"} />
                        <View style={{ flex: 1 }}>
                            <StyledText style={[styles.aboutLabel, { color: colors.PRIMARY_TEXT }]}>{t("enable_biometrics")}</StyledText>
                            <StyledText style={{ fontSize: 11, color: colors.PLACEHOLDER }}>{t("biometrics_desc")}</StyledText>
                        </View>
                    </View>
                    <CustomSwitch
                        onValueChange={handleBiometricToggle}
                        value={biometricEnabled ?? false}
                    />
                </View>
            </View>
        </View>
    );
};

export default SecuritySection;
