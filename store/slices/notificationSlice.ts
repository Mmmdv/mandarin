import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
    id: string;
    title: string;
    body: string;
    date: string;
    read: boolean;
    status?: 'pending' | 'sent' | 'cancelled' | 'updated' | 'changed';
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
                status: action.payload.status || 'pending',
            });
            state.unreadCount += 1;
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => n.read = true);
            state.unreadCount = 0;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
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
        updateNotificationStatus: (state, action: PayloadAction<{ id: string, status: Notification['status'] }>) => {
            const notification = state.notifications.find(n => n.id === action.payload.id);
            if (notification) {
                notification.status = action.payload.status;
            }
        },
        cancelAllNotifications: (state) => {
            const now = new Date();
            state.notifications.forEach(n => {
                const nDate = new Date(n.date);
                if (n.status === 'pending' || nDate > now) {
                    n.status = 'cancelled';
                }
            });
        }
    },
});

export const { addNotification, markAllAsRead, clearNotifications, deleteNotification, markAsRead, cancelAllNotifications, updateNotificationStatus } = notificationSlice.actions;

export const selectNotifications = (state: { notification: NotificationState }) => state.notification.notifications;
export const selectUnreadCount = (state: { notification: NotificationState }) => state.notification.unreadCount;

export default notificationSlice.reducer;
