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
}

const initialState: AppState = {
    lang: Lang.EN,
    theme: Theme.DARK,
    notificationsEnabled: false
}

export interface UpdateAppSettingsPayload {
    lang?: Lang
    theme?: Theme
    notificationsEnabled?: boolean
}

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        updateAppSetting: (
            state: AppState,
            action: PayloadAction<UpdateAppSettingsPayload>
        ) => {
            const { lang, theme, notificationsEnabled } = action.payload;
            if (lang) state.lang = lang
            if (theme) state.theme = theme
            if (notificationsEnabled !== undefined) state.notificationsEnabled = notificationsEnabled
        },
    },
})

export const { updateAppSetting } = appSlice.actions

export const selectAppSettings = (state: { app: AppState }): AppState => state.app

export default appSlice.reducer 