import { baseApi } from "@/store/api/baseApi"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { createTransform, FLUSH, PAUSE, PERSIST, PersistConfig, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist"
import appReducer from "./slices/appSlice"
import birthdayReducer from "./slices/birthdaySlice"
import notificationReducer from "./slices/notificationSlice"
import todayReducer from "./slices/todaySlice"
import todoReducer from "./slices/todoSlice"

const reducers = combineReducers({
    app: appReducer,
    birthday: birthdayReducer,
    todo: todoReducer,
    notification: notificationReducer,
    today: todayReducer,
    [baseApi.reducerPath]: baseApi.reducer,
})

const rootReducer = (state: any, action: any) => {
    if (action.type === 'RESET_APP') {
        state = undefined;
    }
    return reducers(state, action);
};

export type RootState = ReturnType<typeof reducers>;

const rtkQueryTransform = createTransform(
    (inboundState: any) => {
        return undefined;
    },
    (outboundState: any) => {
        return undefined;
    },
    {
        whitelist: [baseApi.reducerPath],
    }
)

const persistConfig: PersistConfig<RootState> = {
    key: "root",
    storage: AsyncStorage,
    // blacklist: ["app"],
    transforms: [rtkQueryTransform]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(baseApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
})

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
