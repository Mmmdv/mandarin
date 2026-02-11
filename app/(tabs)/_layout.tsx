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
                name="birthday"
                options={{ title: "Birthday" }}
            />
            <Tabs.Screen
                name="shopping"
                options={{ title: "Shopping" }}
            />
            <Tabs.Screen
                name="events"
                options={{ title: "Events" }}
            />

            <Tabs.Screen
                name="utilities"
                options={{ title: "Utilities" }}
            />
            <Tabs.Screen
                name="movies"
                options={{ title: "Movies" }}
            />
            <Tabs.Screen
                name="todo"
                options={{ title: "To do" }}
            />
        </Tabs>
    );
}
