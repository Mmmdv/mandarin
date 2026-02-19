import { useTheme } from "@/hooks/useTheme";
import { StatusBar } from "expo-status-bar";
import React from "react";

export const AppStatusBar = () => {
    const { isDark } = useTheme();
    return <StatusBar style={isDark ? "light" : "dark"} />;
};

export default AppStatusBar;
