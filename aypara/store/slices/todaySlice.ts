import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

export interface DayData {
    mood?: number;
    weight?: number;
    rating?: number;
}

export interface TodayState {
    daily: Record<string, DayData>;
}

const initialState: TodayState = {
    daily: {}
};

export const todaySlice = createSlice({
    name: "today",
    initialState,
    reducers: {
        setMood: (state, action: PayloadAction<{ date: string, mood: number }>) => {
            const { date, mood } = action.payload;
            if (!state.daily[date]) state.daily[date] = {};
            state.daily[date].mood = mood;
        },
        setWeight: (state, action: PayloadAction<{ date: string, weight: number }>) => {
            const { date, weight } = action.payload;
            if (!state.daily[date]) state.daily[date] = {};
            state.daily[date].weight = weight;
        },
        setRating: (state, action: PayloadAction<{ date: string, rating: number }>) => {
            const { date, rating } = action.payload;
            if (!state.daily[date]) state.daily[date] = {};
            state.daily[date].rating = rating;
        },
        resetMood: (state, action: PayloadAction<{ date: string }>) => {
            const { date } = action.payload;
            if (state.daily[date]) {
                delete state.daily[date].mood;
            }
        },
        resetWeight: (state, action: PayloadAction<{ date: string }>) => {
            const { date } = action.payload;
            if (state.daily[date]) {
                delete state.daily[date].weight;
            }
        },
        resetRating: (state, action: PayloadAction<{ date: string }>) => {
            const { date } = action.payload;
            if (state.daily[date]) {
                delete state.daily[date].rating;
            }
        }
    }
});

export const { setMood, setWeight, setRating, resetMood, resetWeight, resetRating } = todaySlice.actions;

export const selectTodayData = (state: RootState) => state.today;
export const selectDayData = (date: string) => (state: RootState) => state.today.daily[date];
export const selectLastWeight = (state: RootState) => {
    const daily = state.today.daily;
    const dates = Object.keys(daily).sort((a, b) => b.localeCompare(a));
    for (const date of dates) {
        if (daily[date].weight) return daily[date].weight;
    }
    return null;
};

export const selectPreviousWeight = (currentDate: string) => (state: RootState) => {
    const daily = state.today.daily;
    const dates = Object.keys(daily)
        .filter(date => date < currentDate)
        .sort((a, b) => b.localeCompare(a));

    for (const date of dates) {
        if (daily[date].weight) return daily[date].weight;
    }
    return null;
};

export default todaySlice.reducer;
