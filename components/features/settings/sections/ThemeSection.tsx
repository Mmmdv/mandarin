import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch } from "@/store";
import { Theme, updateAppSetting } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { getSettingsStyles } from "../styles";

const ThemeSection: React.FC = () => {
    const { colors, t, theme, isDark } = useTheme();
    const dispatch = useAppDispatch();
    const styles = useMemo(() => getSettingsStyles(colors), [colors]);

    const handleThemeChange = (newTheme: Theme) => {
        dispatch(updateAppSetting({ theme: newTheme }));
    };

    const themeOptions = [
        { value: Theme.DARK, icon: "moon" as const, label: t("dark") },
        { value: Theme.LIGHT, icon: "sunny" as const, label: t("light") },
    ];

    return (
        <View style={styles.section}>
            <StyledText style={styles.sectionTitle}>{t("select_theme")}</StyledText>
            <View style={styles.optionsContainer}>
                {themeOptions.map((opt) => {
                    const isActive = theme === opt.value;
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            style={[
                                styles.optionButton,
                                isActive && {
                                    backgroundColor: colors.PRIMARY_ACTIVE_BUTTON,
                                    borderColor: colors.PRIMARY_ACTIVE_BUTTON,
                                }
                            ]}
                            onPress={() => handleThemeChange(opt.value)}
                        >
                            <Ionicons
                                name={opt.icon}
                                size={18}
                                color={isActive ? colors.PRIMARY_ACTIVE_BUTTON_TEXT : colors.PRIMARY_TEXT}
                                style={{ marginRight: 8 }}
                            />
                            <StyledText style={[
                                styles.optionText,
                                { color: isActive ? colors.PRIMARY_ACTIVE_BUTTON_TEXT : colors.PRIMARY_TEXT }
                            ]}>
                                {opt.label}
                            </StyledText>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default ThemeSection;
