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
                name="home"
                options={{ title: "Home" }}
            />
            <Tabs.Screen
                name="index"
                options={{ title: "To do" }}
            />
            <Tabs.Screen
                name="shopping"
                options={{ title: "Shopping" }}
            />
            <Tabs.Screen
                name="wedding"
                options={{ title: "Wedding" }}
            />
            <Tabs.Screen
                name="movies"
                options={{ title: "Movies" }}
            />
            <Tabs.Screen
                name="utilities"
                options={{ title: "Utilities" }}
            />
        </Tabs>
    );
}
