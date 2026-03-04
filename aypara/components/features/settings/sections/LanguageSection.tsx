import StyledText from "@/components/ui/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch } from "@/store";
import { Lang, updateAppSetting } from "@/store/slices/appSlice";
import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { getSettingsStyles } from "../styles";

const LanguageSection: React.FC = () => {
    const { colors, t, lang } = useTheme();
    const dispatch = useAppDispatch();
    const styles = useMemo(() => getSettingsStyles(colors), [colors]);

    const handleLanguageChange = (newLang: Lang) => {
        dispatch(updateAppSetting({ lang: newLang }));
    };

    return (
        <View style={styles.section}>
            <StyledText style={styles.sectionTitle}>{t("select_language")}</StyledText>
            <View style={styles.optionsContainer}>
                {([Lang.AZ, Lang.EN, Lang.RU] as const).map((langOption) => {
                    const isActive = lang === langOption;
                    return (
                        <TouchableOpacity
                            key={langOption}
                            style={[
                                styles.optionButton,
                                isActive && {
                                    backgroundColor: colors.PRIMARY_ACTIVE_BUTTON,
                                    borderColor: colors.PRIMARY_ACTIVE_BUTTON,
                                }
                            ]}
                            onPress={() => handleLanguageChange(langOption)}
                        >
                            <StyledText style={[
                                styles.optionText,
                                { color: isActive ? colors.PRIMARY_ACTIVE_BUTTON_TEXT : colors.PRIMARY_TEXT }
                            ]}>
                                {langOption === Lang.AZ ? 'AZ' : langOption === Lang.EN ? 'ENG' : 'RU'}
                            </StyledText>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default LanguageSection;
