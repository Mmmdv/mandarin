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

export interface AppState {
    lang: Lang
    theme: Theme
    notificationsEnabled: boolean
    todoNotifications: boolean
    birthdayNotifications: boolean
    movieNotifications: boolean
    username?: string
    usageStats: Record<string, number>
}

const initialState: AppState = {
    lang: Lang.EN,
    theme: Theme.DARK,
    notificationsEnabled: false,
    todoNotifications: true,
    birthdayNotifications: true,
    movieNotifications: true,
    username: "",
    usageStats: {
        todo: 0,
        movies: 0,
        birthday: 0,
        shopping: 0,
        events: 0,
        expenses: 0
    }
}

export interface UpdateAppSettingsPayload {
    lang?: Lang
    theme?: Theme
    notificationsEnabled?: boolean
    todoNotifications?: boolean
    birthdayNotifications?: boolean
    movieNotifications?: boolean
    username?: string
}

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        updateAppSetting: (
            state: AppState,
            action: PayloadAction<UpdateAppSettingsPayload>
        ) => {
            const { lang, theme, notificationsEnabled, username } = action.payload;
            if (lang) state.lang = lang
            if (theme) state.theme = theme
            if (notificationsEnabled !== undefined) state.notificationsEnabled = notificationsEnabled
            if (action.payload.todoNotifications !== undefined) state.todoNotifications = action.payload.todoNotifications
            if (action.payload.birthdayNotifications !== undefined) state.birthdayNotifications = action.payload.birthdayNotifications
            if (action.payload.movieNotifications !== undefined) state.movieNotifications = action.payload.movieNotifications
            if (username !== undefined) state.username = username
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

export const { updateAppSetting, incrementUsage } = appSlice.actions

export const selectAppSettings = (state: { app: AppState }): AppState => state.app
export const selectUsageStats = (state: { app: AppState }) => state.app.usageStats

export default appSlice.reducer 