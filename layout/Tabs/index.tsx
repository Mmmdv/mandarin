import { useTheme } from "@/hooks/useTheme";
import { incrementUsage } from "@/store/slices/appSlice";
import { Ionicons } from "@expo/vector-icons";
// import analytics from "@react-native-firebase/analytics";
import useTodo from "@/hooks/useTodo";
import AddMenuModal from "@/layout/Modals/AddMenuModal";
import AddTodoModal from "@/layout/Modals/AddTodoModal";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { getIconName, getLabelName } from "./helpers";
import { styles } from "./styles";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { t } = useTheme();
    const dispatch = useDispatch();

    const routes = state.routes;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const { onAddTodo } = useTodo();

    const VISIBLE_ROUTES = ["index", "today", "stats", "more"];
    const visibleRoutes = state.routes.filter(r => VISIBLE_ROUTES.includes(r.name));

    // Sort routes to match desired order: index, today, stats, more
    visibleRoutes.sort((a, b) => VISIBLE_ROUTES.indexOf(a.name) - VISIBLE_ROUTES.indexOf(b.name));

    // Desired visual order: Home, Today, ADD, Stats, More
    const displayItems = [
        visibleRoutes[0], // index
        visibleRoutes[1], // today
        { name: "ADD_BUTTON", key: "ADD_BUTTON" },
        visibleRoutes[2], // stats
        visibleRoutes[3]  // more
    ].filter(Boolean); // Safety filter

    // Helper to map route name to usage ID
    const getUsageId = (routeName: string) => {
        if (routeName === 'index') return null; // Skip home
        return routeName;
    };

    const handleAddTodo = (title: string, reminder?: string, notificationId?: string) => {
        onAddTodo(title, reminder, notificationId);
    }

    const onTabPress = (renderIndex: number, route: any, isFocused: boolean) => {
        const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const usageId = getUsageId(route.name);
            if (usageId) {
                dispatch(incrementUsage(usageId));
            }

            navigation.navigate(route.name);
        }
    };

    return (
        <View style={styles.tabBarContainer}>
            <View style={[styles.tabBarWrapper, { justifyContent: 'space-around', width: '100%' }]}>
                {displayItems.map((route, index) => {
                    if (route.name === "ADD_BUTTON") {
                        return (
                            <TouchableOpacity
                                key="ADD_BUTTON"
                                onPress={() => setIsAddMenuOpen(true)}
                                activeOpacity={0.8}
                                style={[styles.tabButton, { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 0 }]}
                            >
                                <View style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 28,
                                    backgroundColor: '#384864ff',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: "#6f83a5ff",
                                    shadowOffset: {
                                        width: 0,
                                        height: 1,
                                    },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4.65,
                                    elevation: 8,
                                }}>
                                    <Ionicons name="add" size={32} color="#86cfeeff" />
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    const currentRouteName = state.routes[state.index].name;
                    const isActive = state.routes[state.index].key === route.key;
                    const MAPPED_TO_HOME = ["todo", "movies", "birthday", "events", "expenses", "shopping"];
                    const MAPPED_TO_MORE = ["breathing"];
                    const isFocused = isActive ||
                        (route.name === 'index' && MAPPED_TO_HOME.includes(currentRouteName)) ||
                        (route.name === 'more' && MAPPED_TO_MORE.includes(currentRouteName));

                    const iconName = getIconName(route.name, isFocused);
                    const label = getLabelName(route.name, t);

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => onTabPress(index, route, isFocused)}
                            activeOpacity={0.7}
                            style={[styles.tabButton, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
                        >
                            <View style={styles.tabItemContainer}>
                                <View style={styles.tabItemContent}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                        <Ionicons
                                            name={iconName}
                                            size={26}
                                            color={isFocused ? "#86cfeeff" : "#e6e2e2ff"}
                                            style={route.name === "today" ? { opacity: 0.9 } : {}}
                                        />
                                        {route.name === "today" && (
                                            <View style={{
                                                position: 'absolute',
                                                top: 6,
                                                backgroundColor: '#131519', // Tab bar arxa fonu
                                                borderRadius: 4,
                                                paddingHorizontal: 2,
                                                minWidth: 18,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Text style={{
                                                    fontSize: 14,
                                                    fontWeight: 'bold',
                                                    color: '#FFFFFF',
                                                }}>
                                                    {new Date().getDate()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.tabLabel,
                                        {
                                            color: isFocused ? "#86cfeeff" : "#e6e2e2ff",
                                            fontWeight: isFocused ? "700" : "400",
                                        }
                                    ]} numberOfLines={1}>
                                        {label}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <AddTodoModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddTodo}
                categoryTitle={t("tab_todo")}
                categoryIcon="list"
            />

            <AddMenuModal
                isOpen={isAddMenuOpen}
                onClose={() => setIsAddMenuOpen(false)}
                onAddTask={() => {
                    setIsAddMenuOpen(false);
                    setTimeout(() => setIsAddModalOpen(true), 300);
                }}
                onAddBirthday={() => { }}
                onAddMovie={() => { }}
            />
        </View>
    );
}

export default CustomTabBar;
