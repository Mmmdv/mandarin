import StyledText from "@/components/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch } from "@/store";
import { Theme, updateAppSetting } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

const ThemeSection: React.FC = () => {
    const { colors, t, theme } = useTheme();
    const dispatch = useAppDispatch();

    const handleThemeChange = (newTheme: Theme) => {
        dispatch(updateAppSetting({ theme: newTheme }));
    };

    const themeOptions = [
        { value: Theme.DARK, icon: "moon" as const, label: t("dark") },
        { value: Theme.LIGHT, icon: "sunny" as const, label: t("light") },
    ];

    return (
        <View style={styles.section}>
            <StyledText style={[styles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>{t("select_theme")}</StyledText>
            <View style={styles.optionsContainer}>
                {themeOptions.map((opt) => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[
                            styles.optionButton,
                            theme === opt.value && { backgroundColor: colors.PRIMARY_ACTIVE_BUTTON },
                            { borderColor: colors.PRIMARY_BORDER_DARK }
                        ]}
                        onPress={() => handleThemeChange(opt.value)}
                    >
                        <Ionicons
                            name={opt.icon}
                            size={18}
                            color={theme === opt.value ? colors.PRIMARY_ACTIVE_BUTTON_TEXT : colors.PRIMARY_TEXT}
                            style={{ marginRight: 8 }}
                        />
                        <StyledText style={[
                            styles.optionText,
                            { color: theme === opt.value ? colors.PRIMARY_ACTIVE_BUTTON_TEXT : colors.PRIMARY_TEXT }
                        ]}>
                            {opt.label}
                        </StyledText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default ThemeSection;
