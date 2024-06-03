import { configureStore } from "@reduxjs/toolkit";
import chatSlice from "./slices/chatSlice";
import appSlice from "./slices/appSlice";
import userInfoSlice from "./userInfoSlice";
import notificationSlice from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    chatStates: chatSlice,
    appStates: appSlice,
    userInfoState: userInfoSlice,
    notification: notificationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
