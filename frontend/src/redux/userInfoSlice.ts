import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { userObj } from "../interfaces/apiInterfaces";

const initialState: userObj = {
  id: -1,
  email: "",
  username: "",
  avatar: "",
  status: "offline",
  win: 0,
  lose: 0,
  age: 0,
  birthday: '',
  sex: "",
  country: "",
  thirdParty: "",
  chatSocketId: "",
  reRefetchUserInfo: false,
  displayname: "",
  friendShipStatus: "NOT_FRIEND",
  isAdmin: false,
  isBanned: false,
  isCreator: false,
  isMuted: false,
};

const userInfoSlice = createSlice({
  name: "userInfoSlice",
  initialState,
  reducers: {
    updateInfo: (state, action: PayloadAction<userObj>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateAvatar: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        avatar: action.payload,
      };
    },
    reFetchUserInfo: (state) => {
      return {
        ...state,
        reRefetchUserInfo: !state.reRefetchUserInfo,
      };
    },
  },
});

export const { updateInfo, updateAvatar, reFetchUserInfo } =
  userInfoSlice.actions;
export default userInfoSlice.reducer;
