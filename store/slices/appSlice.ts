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
}

const initialState: AppState = {
    lang: Lang.AZ,
    theme: Theme.DARK
}

export interface UpdateAppSettingsPayload {
    lang?: Lang
    theme?: Theme
}

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        updateAppSetting: (
            state: AppState,
            action: PayloadAction<UpdateAppSettingsPayload>
        ) => {
            const { lang, theme } = action.payload;
            if (lang) state.lang = lang
            if (theme) state.theme = theme
        },
    },
})

export const { updateAppSetting } = appSlice.actions

export const selectAppSettings = (state: { app: AppState }): AppState => state.app

export default appSlice.reducer 