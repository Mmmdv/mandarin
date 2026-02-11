import { AppStatusBar } from "@/components/AppStatusBar";
import { registerForPushNotificationsAsync } from '@/constants/notifications';
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
    registerForPushNotificationsAsync();
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
