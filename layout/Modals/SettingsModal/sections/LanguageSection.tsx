import StyledText from "@/components/StyledText";
import { useTheme } from "@/hooks/useTheme";
import { useAppDispatch } from "@/store";
import { Lang, updateAppSetting } from "@/store/slices/appSlice";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

const LanguageSection: React.FC = () => {
    const { colors, t, lang } = useTheme();
    const dispatch = useAppDispatch();

    const handleLanguageChange = (newLang: Lang) => {
        dispatch(updateAppSetting({ lang: newLang }));
    };

    return (
        <View style={styles.section}>
            <StyledText style={[styles.sectionTitle, { color: colors.PRIMARY_TEXT }]}>{t("select_language")}</StyledText>
            <View style={styles.optionsContainer}>
                {([Lang.AZ, Lang.EN, Lang.RU] as const).map((langOption) => (
                    <TouchableOpacity
                        key={langOption}
                        style={[
                            styles.optionButton,
                            lang === langOption && { backgroundColor: colors.PRIMARY_ACTIVE_BUTTON },
                            { borderColor: colors.PRIMARY_BORDER_DARK }
                        ]}
                        onPress={() => handleLanguageChange(langOption)}
                    >
                        <StyledText style={[
                            styles.optionText,
                            { color: lang === langOption ? colors.PRIMARY_ACTIVE_BUTTON_TEXT : colors.PRIMARY_TEXT }
                        ]}>
                            {langOption === Lang.AZ ? 'AZ' : langOption === Lang.EN ? 'ENG' : 'RU'}
                        </StyledText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default LanguageSection;
