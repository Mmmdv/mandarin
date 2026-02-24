import BiometricGuard from "@/components/features/BiometricGuard/index";
import { AppStatusBar } from "@/components/layout/AppStatusBar";
import { useTheme } from "@/hooks/useTheme";
import ReducedMotionModal from "@/layout/Modals/ReducedMotionModal";
// Force reload comment 3
import { registerForLocalNotificationsAsync } from '@/constants/notifications';
import Header from "@/layout/Header/index";
import store, { persistor } from "@/store";
import { markAsRead, updateNotificationStatus } from "@/store/slices/notificationSlice";
// import analytics from "@react-native-firebase/analytics";
// import crashlytics from "@react-native-firebase/crashlytics";
import * as Haptics from "expo-haptics";
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { Directions, Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
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

const TAB_ORDER = ["index", "today", "stats", "more"];
const ROUTE_TO_TAB: Record<string, string> = {
  "index": "index",
  "todo": "index",
  "movies": "index",
  "birthday": "index",
  "events": "index",
  "expenses": "index",
  "shopping": "index",
  "today": "today",
  "stats": "stats",
  "more": "more",
  "breathing": "more"
};

function RootLayoutNav() {
  const { colors } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }]
  }));

  const navigateToTab = (direction: "left" | "right") => {
    const currentRoute = segments[segments.length - 1] || "index";
    const normalizedRoute = currentRoute === "(tabs)" ? "index" : currentRoute;
    const activeMainTab = ROUTE_TO_TAB[normalizedRoute];

    // Main roots are the 4 main tabs
    const isMainTabRoot = ["index", "today", "stats", "more"].includes(normalizedRoute);

    // Animation prep (Reduced intensity by 50%)
    opacity.value = 0.5; // Starts from 0.5 instead of 0 for subtler fade
    translateX.value = direction === "left" ? 15 : -15; // 15px instead of 30px
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!isMainTabRoot) {
      // ON ALT TABS: Both directions should go back to parent/home
      if (router.canGoBack()) {
        router.back();
      } else if (activeMainTab) {
        // Emergency fallback to parent tab if stack is empty
        router.navigate(activeMainTab === "index" ? "/(tabs)" : `/(tabs)/${activeMainTab}` as any);
      }
    } else {
      // ON MAIN TABS: Maintain circular navigation
      const currentIndex = TAB_ORDER.indexOf(normalizedRoute);
      if (currentIndex !== -1) {
        let nextIndex;
        if (direction === "left") {
          // Swipe Left (Finger Right to Left) -> NEXT Tab
          nextIndex = (currentIndex + 1) % TAB_ORDER.length;
        } else {
          // Swipe Right (Finger Left to Right) -> PREVIOUS Tab
          nextIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
        }
        const targetTab = TAB_ORDER[nextIndex];
        router.navigate(targetTab === "index" ? "/(tabs)" : `/(tabs)/${targetTab}` as any);
      }
    }

    // Animate back in (Faster and subtler)
    opacity.value = withTiming(1, { duration: 300 });
    translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
  };

  const leftFling = Gesture.Fling()
    .direction(Directions.LEFT)
    .onStart(() => {
      runOnJS(navigateToTab)("left");
    });

  const rightFling = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onStart(() => {
      runOnJS(navigateToTab)("right");
    });

  const combinedGesture = Gesture.Exclusive(leftFling, rightFling);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.PRIMARY_BACKGROUND }}>
      <SafeAreaProvider style={{ backgroundColor: colors.PRIMARY_BACKGROUND }}>
        <GestureDetector gesture={combinedGesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
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
          </Animated.View>
        </GestureDetector>
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
