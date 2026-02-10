import { TranslationKey, TRANSLATIONS } from "@/constants/translations";
import { DarkTheme, LightTheme } from "@/constants/ui";
import { useAppSelector } from "@/store";
import { selectAppSettings, Theme } from "@/store/slices/appSlice";

export const useTheme = () => {
    const { theme, lang } = useAppSelector(selectAppSettings);

    const colors = theme === Theme.DARK ? DarkTheme : LightTheme;
    const isDark = theme === Theme.DARK;

    const t = (key: TranslationKey) => {
        return TRANSLATIONS[lang][key] || key;
    };

    return {
        theme,
        colors,
        lang,
        t,
        isDark
    };
};
