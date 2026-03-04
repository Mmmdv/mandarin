import { useCallback, useMemo } from "react";
import { TranslationKey, TRANSLATIONS } from "@/constants/translations";
import { DarkTheme, LightTheme } from "@/constants/ui";
import { useAppSelector } from "@/store";
import { selectAppSettings, Theme } from "@/store/slices/appSlice";

export const useTheme = () => {
    const settings = useAppSelector(selectAppSettings);
    const {
        theme,
        lang,
        notificationsEnabled,
        todoNotifications,
        birthdayNotifications,
        movieNotifications,
        shoppingNotifications,
        eventsNotifications,
        expensesNotifications,
        username,
        biometricEnabled,
    } = settings;

    const colors = useMemo(() => theme === Theme.DARK ? DarkTheme : LightTheme, [theme]);
    const isDark = theme === Theme.DARK;

    const t = useCallback((key: TranslationKey) => {
        return (TRANSLATIONS[lang] as any)[key] || key;
    }, [lang]);

    return useMemo(() => ({
        theme,
        colors,
        lang,
        t,
        isDark,
        notificationsEnabled,
        todoNotifications,
        birthdayNotifications,
        movieNotifications,
        shoppingNotifications,
        eventsNotifications,
        expensesNotifications,
        username,
        biometricEnabled,
    }), [
        theme, colors, lang, t, isDark,
        notificationsEnabled, todoNotifications, birthdayNotifications,
        movieNotifications, shoppingNotifications, eventsNotifications,
        expensesNotifications, username, biometricEnabled
    ]);
};
