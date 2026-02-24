import CustomTabBar from "@/layout/Tabs";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            backBehavior="history"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                }}
            />
            <Tabs.Screen
                name="today"
                options={{
                    title: "Today",
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: "More",
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: "Stats",
                }}
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
                name="expenses"
                options={{ title: "Expenses" }}
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
