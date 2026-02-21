import CustomSwitch from "@/components/ui/CustomSwitch";
import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useMemo } from "react";
import { Alert, View } from "react-native";
import { getSettingsStyles } from "../styles";

const SecuritySection: React.FC = () => {
    const { colors, t, biometricEnabled } = useTheme();
    const dispatch = useAppDispatch();
    const styles = useMemo(() => getSettingsStyles(colors), [colors]);

    const handleBiometricToggle = async (value: boolean) => {
        if (value) {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                Alert.alert(t("error"), t("biometrics_not_available"));
                return;
            }

            dispatch(updateAppSetting({ biometricEnabled: true }));
        } else {
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
            <StyledText style={styles.sectionTitle}>{t("security")}</StyledText>
            <View style={styles.aboutContainer}>
                <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="finger-print" size={20} color={biometricEnabled ? colors.CHECKBOX_SUCCESS : colors.PLACEHOLDER} />
                        <View style={{ flex: 1, gap: 2 }}>
                            <StyledText style={styles.aboutLabel}>{t("enable_biometrics")}</StyledText>
                            <StyledText style={{ fontSize: 12, color: colors.PLACEHOLDER }}>{t("biometrics_desc")}</StyledText>
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
