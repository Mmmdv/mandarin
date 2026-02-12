import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForLocalNotificationsAsync() {
    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

    } catch (error) {
        // failed silently
    }
}

export async function schedulePushNotification(title: string, body: string, triggerDate: Date) {
    const trigger = triggerDate.getTime() - Date.now();
    if (trigger <= 0) return; // Don't schedule past dates

    return await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
        },
    });
}

export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
