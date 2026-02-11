import { AppStatusBar } from "@/components/AppStatusBar";
import { registerForLocalNotificationsAsync } from '@/constants/notifications';
import Header from "@/layout/Header";
import store from "@/store";
import * as Haptics from "expo-haptics";
import * as Notifications from 'expo-notifications';
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import persistStore from "redux-persist/es/persistStore";
import { PersistGate } from "redux-persist/integration/react";

import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications (remote notifications) functionality provided by expo-notifications was removed",
  "`expo-notifications` functionality is not fully supported in Expo Go"
]);

// Suppress specific warnings from appearing in the terminal
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');
  if (
    message.includes("expo-notifications: Android Push notifications") ||
    message.includes("functionality provided by expo-notifications was removed") ||
    message.includes("`expo-notifications` functionality is not fully supported")
  ) {
    return;
  }
  originalWarn(...args);
};

const persistor = persistStore(store);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldSetBadgeCount: false,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowNotification: true,
  }),
});

export default function RootLayout() {
  // Warm up haptics API silently
  useEffect(() => {
    Haptics.selectionAsync();
    registerForLocalNotificationsAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppStatusBar />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ header: () => <Header />, headerShown: true }} />
            </Stack>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
