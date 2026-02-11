import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/store/slices/appSlice";
import { StatusBar } from "expo-status-bar";

export const AppStatusBar = () => {
    const { theme } = useTheme();

    return (
        <StatusBar
            style={theme === Theme.DARK ? "light" : "dark"}
            backgroundColor="transparent"
            translucent
        />
    );
};
