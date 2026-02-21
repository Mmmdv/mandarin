import BiometricGuard from "@/components/features/BiometricGuard/index";
import ReducedMotionModal from "@/components/features/ReducedMotionModal";
import { AppStatusBar } from "@/components/layout/AppStatusBar";
import { useTheme } from "@/hooks/useTheme";
// Force reload comment 3
import { registerForLocalNotificationsAsync } from '@/constants/notifications';
import Header from "@/layout/Header/index";
import store, { persistor } from "@/store";
import { markAsRead, updateNotificationStatus } from "@/store/slices/notificationSlice";
// import analytics from "@react-native-firebase/analytics";
// import crashlytics from "@react-native-firebase/crashlytics";
import * as Haptics from "expo-haptics";
import * as Notifications from 'expo-notifications';
import { Stack } from "expo-router";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

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

function RootLayoutNav() {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.PRIMARY_BACKGROUND }}>
      <SafeAreaProvider style={{ backgroundColor: colors.PRIMARY_BACKGROUND }}>
        <AppStatusBar />
        <BiometricGuard>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.PRIMARY_BACKGROUND }
            }}
          >
            <Stack.Screen name="(tabs)" options={{ header: () => <Header />, headerShown: true }} />
          </Stack>
        </BiometricGuard>
        <ReducedMotionModal />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  // Warm up haptics API silently
  useEffect(() => {
    Haptics.selectionAsync();
    registerForLocalNotificationsAsync();

    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      const id = notification.request.identifier;
      store.dispatch(updateNotificationStatus({ id, status: 'Göndərilib' }));
    });

    const responseReceivedSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const id = response.notification.request.identifier;
      store.dispatch(updateNotificationStatus({ id, status: 'Göndərilib' }));
      store.dispatch(markAsRead(id));
    });

    return () => {
      notificationReceivedSubscription.remove();
      responseReceivedSubscription.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutNav />
      </PersistGate>
    </Provider>
  );
}
