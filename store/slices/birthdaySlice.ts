import { Birthday } from "@/types/birthday";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BirthdayState {
    birthdays: Birthday[];
}

const initialState: BirthdayState = {
    birthdays: [],
};

export const birthdaySlice = createSlice({
    name: "birthday",
    initialState,
    reducers: {
        addBirthday: (state, action: PayloadAction<Birthday>) => {
            state.birthdays.push(action.payload);
        },
        deleteBirthday: (state, action: PayloadAction<string>) => {
            state.birthdays = state.birthdays.filter(b => b.id !== action.payload);
        },
        editBirthday: (
            state,
            action: PayloadAction<{
                id: string;
                name?: string;
                date?: string;
                phone?: string;
                notificationId?: string | null;
            }>
        ) => {
            const { id, notificationId, ...updates } = action.payload;
            state.birthdays = state.birthdays.map(b =>
                b.id === id
                    ? {
                        ...b,
                        ...Object.fromEntries(
                            Object.entries(updates).filter(([_, v]) => v !== undefined)
                        ),
                        notificationId: notificationId === null ? undefined : (notificationId ?? b.notificationId),
                        updatedAt: new Date().toISOString(),
                    }
                    : b
            );
        },
        markGreetingSent: (
            state,
            action: PayloadAction<{ id: string; year: number }>
        ) => {
            state.birthdays = state.birthdays.map(b =>
                b.id === action.payload.id
                    ? {
                        ...b,
                        greetingSent: true,
                        greetingYear: action.payload.year,
                    }
                    : b
            );
        },
        resetGreetingForNewYear: (state) => {
            const currentYear = new Date().getFullYear();
            state.birthdays = state.birthdays.map(b =>
                b.greetingYear && b.greetingYear < currentYear
                    ? { ...b, greetingSent: false }
                    : b
            );
        },
        markHistoryRead: (state, action: PayloadAction<{ id: string; year: number }>) => {
            const b = state.birthdays.find(b => b.id === action.payload.id);
            if (b) {
                if (!b.readHistory) b.readHistory = [];
                if (!b.readHistory.includes(action.payload.year)) {
                    b.readHistory.push(action.payload.year);
                }
            }
        },
        markAllHistoryRead: (state, action: PayloadAction<{ id: string; year: number }[]>) => {
            action.payload.forEach(({ id, year }) => {
                const b = state.birthdays.find(b => b.id === id);
                if (b) {
                    if (!b.readHistory) b.readHistory = [];
                    if (!b.readHistory.includes(year)) {
                        b.readHistory.push(year);
                    }
                }
            });
        },
    },
});

export const {
    addBirthday,
    deleteBirthday,
    editBirthday,
    markGreetingSent,
    resetGreetingForNewYear,
    markHistoryRead,
    markAllHistoryRead,
} = birthdaySlice.actions;

export const selectBirthdays = (state: { birthday: BirthdayState }): Birthday[] =>
    state.birthday.birthdays;

export default birthdaySlice.reducer;
