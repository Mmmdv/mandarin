import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NotificationStatus = 'Gözlənilir' | 'Dəyişdirilib və ləğv olunub' | 'Göndərilib' | 'Ləğv olunub';

export interface Notification {
    id: string;
    title: string;
    body: string;
    date: string;
    read: boolean;
    status?: NotificationStatus;
    categoryIcon?: string;
    todoId?: string; // Adding todoId to link back
}

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
};

export const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Omit<Notification, "read">>) => {
            state.notifications.unshift({
                ...action.payload,
                read: false,
                status: action.payload.status || 'Gözlənilir',
            });
            state.unreadCount += 1;
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => n.read = true);
            state.unreadCount = 0;
        },
        clearNotifications: (state) => {
            state.notifications = state.notifications.filter(n => n.status === 'Gözlənilir');
            state.unreadCount = state.notifications.filter(n => !n.read).length;
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        deleteNotification: (state, action: PayloadAction<string>) => {
            const index = state.notifications.findIndex(n => n.id === action.payload);
            if (index !== -1) {
                if (!state.notifications[index].read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.notifications.splice(index, 1);
            }
        },
        updateNotificationStatus: (state, action: PayloadAction<{ id: string, status: NotificationStatus }>) => {
            const notification = state.notifications.find(n => n.id === action.payload.id);
            if (notification && notification.status !== 'Göndərilib') {
                notification.status = action.payload.status;
            }
        },
        cancelAllNotifications: (state, action: PayloadAction<string | undefined>) => {
            const now = new Date();
            const categoryTitle = action.payload;
            state.notifications.forEach(n => {
                const nDate = new Date(n.date);
                // Use includes to match even if there are emojis in the title
                if (!categoryTitle || n.title.includes(categoryTitle)) {
                    if (n.status === 'Gözlənilir' || nDate > now) {
                        n.status = 'Ləğv olunub';
                    }
                }
            });
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        }
    },
});

export const { addNotification, markAllAsRead, clearNotifications, deleteNotification, markAsRead, cancelAllNotifications, updateNotificationStatus, removeNotification } = notificationSlice.actions;

export const selectNotifications = (state: { notification: NotificationState }) => state.notification.notifications;
export const selectNotificationById = (state: { notification: NotificationState }, id: string) =>
    state.notification.notifications.find(n => n.id === id);
export const selectUnreadCount = (state: { notification: NotificationState }) => state.notification.unreadCount;

export default notificationSlice.reducer;
