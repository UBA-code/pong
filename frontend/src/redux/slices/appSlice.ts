import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getSideBarStatusFromStorage } from "../../Helpers/localStorageUtils";
import { tokenObj } from "../../interfaces/apiInterfaces";
import { customSettings } from "../../components/Play/Play";
import { notificationBoxObj } from "../../components/Nav/NotificationBox";

export type pagesNames =
  | "Play"
  | "Leaderboard"
  | "Profile"
  | "Chat"
  | "Settings";

interface appState {
  sideBarStatus: boolean;
  currentPage: pagesNames;
  token: tokenObj | undefined;
  appIsLoading: boolean;
  theme: "dark" | "light";
  gameSettings: customSettings | null;
  notificationArr: notificationBoxObj[];
  gameInvite: {
    targetId: number;
    targetUsername: string;
    myUsername: string;
    myId: number;
  } | null;
  gameMap: "Forest" | "Anime" | "Sunrise";
}

const initialState: appState = {
  sideBarStatus: getSideBarStatusFromStorage(),
  currentPage: "Profile",
  token: undefined,
  appIsLoading: false,
  theme: localStorage.getItem("theme") === "dark" ? "dark" : "light",
  gameSettings: null,
  notificationArr: [],
  gameInvite: null,
  gameMap: "Forest",
};

const appSlice = createSlice({
  name: "appSlice",
  initialState,
  reducers: {
    toggleSideBar: (state) => {
      state.sideBarStatus = !state.sideBarStatus;
      localStorage.setItem("sidebar", state.sideBarStatus ? "true" : "false");
    },
    setCurrentPage: (state, action: PayloadAction<pagesNames>) => {
      state.currentPage = action.payload;
    },
    setToken: (state, action: PayloadAction<tokenObj>) => {
      state.token = action.payload;
    },
    setAppIsLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        appIsLoading: action.payload,
      };
    },
    setAppTheme: (state, action: PayloadAction<"light" | "dark">) => {
      return {
        ...state,
        theme: action.payload,
      };
    },
    setGameSettings: (state, action: PayloadAction<customSettings | null>) => {
      return {
        ...state,
        gameSettings: action.payload,
      };
    },
    setGameInvite: (
      state,
      action: PayloadAction<{
        targetId: number;
        targetUsername: string;
        myUsername: string;
        myId: number;
      } | null>
    ) => {
      return {
        ...state,
        gameInvite: action.payload,
      };
    },
    updateNotificationBox: (
      state,
      action: PayloadAction<notificationBoxObj[]>
    ) => {
      return {
        ...state,
        notificationArr: [...action.payload],
      };
    },
    addNewNotificationToBox: (
      state,
      action: PayloadAction<notificationBoxObj>
    ) => {
      return {
        ...state,
        notificationArr: [action.payload, ...state.notificationArr],
      };
    },
    setMap: (state, action: PayloadAction<"Forest" | "Anime" | "Sunrise">) => {
      return {
        ...state,
        gameMap: action.payload,
      };
    },
  },
});

export const {
  setCurrentPage,
  toggleSideBar,
  setToken,
  setAppIsLoading,
  setAppTheme,
  setGameSettings,
  setGameInvite,
  updateNotificationBox,
  addNewNotificationToBox,
  setMap,
} = appSlice.actions;
export default appSlice.reducer;
