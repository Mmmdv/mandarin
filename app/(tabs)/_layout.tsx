import CustomTabBar from "@/components/CustomTabBar";
import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{ title: "Home" }}
            />
            <Tabs.Screen
                name="about"
                options={{ title: "About" }}
            />
            <Tabs.Screen
                name="settings"
                options={{ title: "Settings" }}
            />
        </Tabs>
    );
}
