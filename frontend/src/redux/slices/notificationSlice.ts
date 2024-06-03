import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";

export type SnackbarColor =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

type notificationType = "conversation" | "alert";

export interface notificationObj {
  type?: notificationType;
  picture: string;
  title: string;
  content: string;
  redirect: string | number | undefined;
  sender?: string;

  status?: boolean;
  color?: SnackbarColor;
  //? alert properties
  alertContent?: string;
}

export interface alertProp {
  alertContent: string;
  color: SnackbarColor;
}

const initialState: notificationObj = {
  type: "conversation",
  alertContent: "",
  picture: "",
  title: "",
  content: "",
  redirect: undefined,
  status: false,
  color: "success",
};

const notificationSlice = createSlice({
  name: "notification Slice",
  initialState,
  reducers: {
    changeNotificationDmValue: (
      state,
      action: PayloadAction<notificationObj>
    ) => {
      return {
        ...state,
        ...action.payload,
        type: "conversation",
        status: true,
      };
    },
    changeNotificationAlertValue: (state, action: PayloadAction<alertProp>) => {
      return {
        ...state,
        ...action.payload,
        type: "alert",
        status: true,
      };
    },
    toggleNotificationViewStatus: (state, action: PayloadAction<boolean>) => {
      state.status = action.payload;
    },
  },
});

export const {
  changeNotificationDmValue,
  changeNotificationAlertValue,
  toggleNotificationViewStatus,
} = notificationSlice.actions;
export default notificationSlice.reducer;
