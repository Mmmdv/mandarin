import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum Lang {
    EN = "en",
    RU = "ru",
    AZ = "az"
}

export enum Theme {
    DARK = "dark",
    LIGHT = "light"
}

export interface BreathingStats {
    totalSessions: number;
    totalDurationSec: number;
}

export interface AppState {
    lang: Lang
    theme: Theme
    notificationsEnabled: boolean
    todoNotifications: boolean
    birthdayNotifications: boolean
    movieNotifications: boolean
    shoppingNotifications: boolean
    eventsNotifications: boolean
    expensesNotifications: boolean
    username?: string
    biometricEnabled: boolean
    usageStats: Record<string, number>
    isBreathingActive: boolean
    breathingStats: BreathingStats
    breathingHistory: Record<string, { sessions: number; durationSec: number }>
    reducedMotionDismissed: boolean
    contactsEnabled: boolean
}

const initialState: AppState = {
    lang: Lang.EN,
    theme: Theme.DARK,
    notificationsEnabled: false,
    todoNotifications: true,
    birthdayNotifications: true,
    movieNotifications: true,
    shoppingNotifications: true,
    eventsNotifications: true,
    expensesNotifications: true,
    username: "",
    biometricEnabled: false,
    usageStats: {
        todo: 0,
        movies: 0,
        birthday: 0,
        shopping: 0,
        events: 0,
        expenses: 0
    },
    isBreathingActive: false,
    breathingStats: {
        totalSessions: 0,
        totalDurationSec: 0,
    },
    breathingHistory: {},
    reducedMotionDismissed: false,
    contactsEnabled: false
}

export interface UpdateAppSettingsPayload {
    lang?: Lang
    theme?: Theme
    notificationsEnabled?: boolean
    todoNotifications?: boolean
    birthdayNotifications?: boolean
    movieNotifications?: boolean
    shoppingNotifications?: boolean
    eventsNotifications?: boolean
    expensesNotifications?: boolean
    username?: string
    biometricEnabled?: boolean
    reducedMotionDismissed?: boolean
    contactsEnabled?: boolean
}

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        updateAppSetting: (
            state: AppState,
            action: PayloadAction<UpdateAppSettingsPayload>
        ) => {
            const { lang, theme, notificationsEnabled, username, biometricEnabled } = action.payload;
            if (lang) state.lang = lang
            if (theme) state.theme = theme
            if (notificationsEnabled !== undefined) state.notificationsEnabled = notificationsEnabled
            if (action.payload.todoNotifications !== undefined) state.todoNotifications = action.payload.todoNotifications
            if (action.payload.birthdayNotifications !== undefined) state.birthdayNotifications = action.payload.birthdayNotifications
            if (action.payload.movieNotifications !== undefined) state.movieNotifications = action.payload.movieNotifications
            if (action.payload.shoppingNotifications !== undefined) state.shoppingNotifications = action.payload.shoppingNotifications
            if (action.payload.eventsNotifications !== undefined) state.eventsNotifications = action.payload.eventsNotifications
            if (action.payload.expensesNotifications !== undefined) state.expensesNotifications = action.payload.expensesNotifications
            if (username !== undefined) state.username = username
            if (biometricEnabled !== undefined) state.biometricEnabled = biometricEnabled
            if (action.payload.reducedMotionDismissed !== undefined) state.reducedMotionDismissed = action.payload.reducedMotionDismissed
            if (action.payload.contactsEnabled !== undefined) state.contactsEnabled = action.payload.contactsEnabled
        },
        setBreathingActive: (state, action: PayloadAction<boolean>) => {
            state.isBreathingActive = action.payload;
        },
        logBreathingSession: (state, action: PayloadAction<number>) => {
            if (!state.breathingStats) {
                state.breathingStats = { totalSessions: 0, totalDurationSec: 0 };
            }
            state.breathingStats.totalSessions += 1;
            state.breathingStats.totalDurationSec += action.payload;
            // Daily history
            if (!state.breathingHistory) state.breathingHistory = {};
            const today = new Date().toISOString().split('T')[0];
            if (!state.breathingHistory[today]) {
                state.breathingHistory[today] = { sessions: 0, durationSec: 0 };
            }
            state.breathingHistory[today].sessions += 1;
            state.breathingHistory[today].durationSec += action.payload;
        },
        incrementUsage: (state, action: PayloadAction<string>) => {
            if (!state.usageStats) {
                state.usageStats = {
                    todo: 0,
                    movies: 0,
                    birthday: 0,
                    shopping: 0,
                    events: 0,
                    expenses: 0
                };
            }
            if (state.usageStats[action.payload] !== undefined) {
                state.usageStats[action.payload] += 1;
            } else {
                state.usageStats[action.payload] = 1;
            }
        }
    },
})

export const { updateAppSetting, incrementUsage, setBreathingActive, logBreathingSession } = appSlice.actions

export const selectAppSettings = (state: { app: AppState }): AppState => state.app
export const selectUsageStats = (state: { app: AppState }) => state.app.usageStats
export const selectIsBreathingActive = (state: { app: AppState }) => state.app.isBreathingActive

export default appSlice.reducer 
