import CustomSwitch from "@/components/ui/CustomSwitch";
import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch } from "@/store";
import { updateAppSetting } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import * as Linking from "expo-linking";
import React from "react";
import { Alert, View } from "react-native";
import { styles as commonStyles } from "../styles";

const PermissionsSection: React.FC = () => {
    const { colors, t, contactsEnabled } = useTheme();
    const dispatch = useAppDispatch();

    const handleContactsToggle = async (value: boolean) => {
        if (value) {
            const { status, canAskAgain } = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                dispatch(updateAppSetting({ contactsEnabled: true }));
            } else {
                if (!canAskAgain || status === "denied") {
                    Alert.alert(
                        t("attention"),
                        t("contacts_permission_denied"),
                        [
                            { text: t("cancel"), style: "cancel" },
                            { text: t("settings"), onPress: () => Linking.openSettings() }
                        ]
                    );
                }
            }
        } else {
            // Turning off only affects the app's internal usage of contacts
            dispatch(updateAppSetting({ contactsEnabled: false }));
        }
    };

    return (
        <View style={commonStyles.section}>
            <StyledText style={[commonStyles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>{t("permissions")}</StyledText>
            <View style={commonStyles.aboutContainer}>
                <View style={[commonStyles.aboutRow, { borderColor: colors.PRIMARY_BORDER_DARK, borderBottomWidth: 0, backgroundColor: colors.SECONDARY_BACKGROUND }]}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="people" size={20} color={contactsEnabled ? colors.CHECKBOX_SUCCESS : "#888"} />
                        <View style={{ flex: 1 }}>
                            <StyledText style={[commonStyles.aboutLabel, { color: colors.PRIMARY_TEXT }]}>{t("contacts_permission")}</StyledText>
                            <StyledText style={{ fontSize: 11, color: colors.PLACEHOLDER }}>{t("contacts_permission_desc")}</StyledText>
                        </View>
                    </View>
                    <CustomSwitch
                        onValueChange={handleContactsToggle}
                        value={contactsEnabled ?? false}
                    />
                </View>
            </View>
        </View>
    );
};

export default PermissionsSection;
