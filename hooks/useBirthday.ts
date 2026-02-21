import { schedulePushNotification } from "@/constants/notifications";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectAppSettings } from "@/store/slices/appSlice";
import {
    addBirthday,
    deleteBirthday,
    editBirthday,
    markGreetingSent,
    resetGreetingForNewYear,
    selectBirthdays,
} from "@/store/slices/birthdaySlice";
import { addNotification, updateNotificationStatus } from "@/store/slices/notificationSlice";
import * as Notifications from "expo-notifications";

const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const useBirthday = () => {
    const birthdays = useAppSelector(selectBirthdays);
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectAppSettings);
    const notifications = useAppSelector(state => state.notification.notifications);

    const onAddBirthday = async (
        name: string,
        date: string,
        nickname?: string,
        phone?: string,
        note?: string
    ) => {
        const id = generateId();
        let notificationId: string | undefined;

        // Schedule notification for birthday morning (09:00)
        if (settings.notificationsEnabled && settings.birthdayNotifications) {
            const birthdayDate = new Date(date);
            const now = new Date();
            const notifDate = new Date(
                now.getFullYear(),
                birthdayDate.getMonth(),
                birthdayDate.getDate(),
                9, 0, 0
            );

            // If birthday already passed this year, schedule for next year
            if (notifDate < now) {
                notifDate.setFullYear(notifDate.getFullYear() + 1);
            }

            const displayName = nickname ? `${nickname} ${name}` : name;
            notificationId = await schedulePushNotification(
                "🎂 Ad günü!",
                `Bugün ${displayName} ad günüdür!`,
                notifDate,
                "gift"
            );

            if (notificationId) {
                dispatch(addNotification({
                    id: notificationId,
                    title: "🎂 Ad günü!",
                    body: `Bugün ${displayName} ad günüdür!`,
                    date: notifDate.toISOString(),
                    categoryIcon: "gift",
                }));
            }
        }

        dispatch(addBirthday({
            id,
            name,
            date,
            nickname,
            phone,
            note,
            createdAt: new Date().toISOString(),
            notificationId,
        }));
    };

    const onDeleteBirthday = async (id: string) => {
        const birthday = birthdays.find(b => b.id === id);
        if (birthday?.notificationId) {
            const notification = notifications.find(n => n.id === birthday.notificationId);
            if (notification && notification.status === "Gözlənilir") {
                try {
                    await Notifications.cancelScheduledNotificationAsync(birthday.notificationId);
                } catch (error) {
                    // silently ignore
                }
                dispatch(updateNotificationStatus({ id: birthday.notificationId, status: "Ləğv olunub" }));
            }
        }
        dispatch(deleteBirthday(id));
    };

    const onEditBirthday = (
        id: string,
        name?: string,
        date?: string,
        nickname?: string,
        phone?: string,
        note?: string
    ) => {
        dispatch(editBirthday({ id, name, date, nickname, phone, note }));
    };

    const onMarkGreetingSent = (id: string) => {
        const year = new Date().getFullYear();
        dispatch(markGreetingSent({ id, year }));
    };

    const onResetGreetings = () => {
        dispatch(resetGreetingForNewYear());
    };

    // Helper: get days until birthday
    const getDaysUntilBirthday = (dateStr: string): number => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bDay = new Date(dateStr);
        const nextBirthday = new Date(
            today.getFullYear(),
            bDay.getMonth(),
            bDay.getDate()
        );
        if (nextBirthday < today) {
            nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }
        const diffTime = nextBirthday.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Helper: get age
    const getAge = (dateStr: string): number => {
        const today = new Date();
        const bDay = new Date(dateStr);
        let age = today.getFullYear() - bDay.getFullYear();
        const monthDiff = today.getMonth() - bDay.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bDay.getDate())) {
            age--;
        }
        return age;
    };

    // Sort birthdays: upcoming first
    const sortedBirthdays = [...birthdays].sort((a, b) => {
        return getDaysUntilBirthday(a.date) - getDaysUntilBirthday(b.date);
    });

    // Today's birthdays
    const todayBirthdays = birthdays.filter(b => getDaysUntilBirthday(b.date) === 0);

    // Upcoming (next 30 days, excluding today)
    const upcomingBirthdays = birthdays.filter(b => {
        const days = getDaysUntilBirthday(b.date);
        return days > 0 && days <= 30;
    }).sort((a, b) => getDaysUntilBirthday(a.date) - getDaysUntilBirthday(b.date));

    return {
        birthdays: sortedBirthdays,
        todayBirthdays,
        upcomingBirthdays,
        onAddBirthday,
        onDeleteBirthday,
        onEditBirthday,
        onMarkGreetingSent,
        onResetGreetings,
        getDaysUntilBirthday,
        getAge,
    };
};

export default useBirthday;
