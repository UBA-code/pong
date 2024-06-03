import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  channelObj,
  chatObj,
  sectionType,
} from "../../components/Chat/enums-interfaces/chatInterfaces";
import {
  chanellConversationObj,
  messageConversationObj,
  userObj,
} from "../../interfaces/apiInterfaces";
import { SnackbarColor } from "./notificationSlice";

const currentConversationInitial: chatObj = {
  id: -1,
  avatar: "https://dummyimage.com/100x100/000000/ffffff.png&text=no+Picture",
  status: "offline",
  username: "",
  displayname: "",
  lastMessage: "",
  lastMessageDate: "",
  messagedLast: false,
};

const currentConversationMessagesInitial: messageConversationObj[] = [];

//? chat dialog
export type dialogTypes = "Normal" | "Warning" | "Danger" | "Safe";

export interface dialog {
  type: dialogTypes;
  textContent: string;
  visible: boolean;
  processBtnContent: string;
  title: string;
  endpoint: string;
  alertContent: string;
  alertColor: SnackbarColor;
}

//? channel total users dialog

export interface chatState {
  currentSectionValue: sectionType;
  currentConversation: chatObj | channelObj;
  currentConversationMessages: (
    | messageConversationObj
    | chanellConversationObj
  )[];
  endOfMessagesIsReached: boolean;
  currentChannelSelectedUser: userObj | undefined;
  selectedChatIdForFetching: number | string | undefined;
  conversationDisplay_Status: boolean;
  conversationInfo_Status: boolean;
  createChannelWindow_Status: boolean;
  createChannelWindowUpdate: boolean;
  chatDialog: dialog;
  channelUsersWindow: boolean;
  reRenderConversationSelection: boolean;
  reRenderMessages: boolean;
  timingPickerStatus: boolean;
  muteTargetId: number | undefined;
  conversationIsLoading: boolean;
  conversationInfoIsLoading: boolean;
  isTyping: boolean;
}

const initialState: chatState = {
  currentSectionValue: "messages",
  currentConversation: currentConversationInitial,
  currentChannelSelectedUser: undefined,
  selectedChatIdForFetching: undefined,
  currentConversationMessages: currentConversationMessagesInitial,
  endOfMessagesIsReached: false,
  conversationDisplay_Status: false,
  conversationInfo_Status: false,
  createChannelWindow_Status: false,
  createChannelWindowUpdate: false,
  chatDialog: {
    textContent: "",
    type: "Normal",
    visible: false,
    processBtnContent: "OK",
    title: "Dialog",
    endpoint: "",
    alertContent: "",
    alertColor: "neutral",
  },
  channelUsersWindow: false,
  timingPickerStatus: false,
  reRenderConversationSelection: false,
  reRenderMessages: false,
  muteTargetId: undefined,
  conversationIsLoading: false,
  conversationInfoIsLoading: false,
  isTyping: false,
};

const chatSlice = createSlice({
  name: "chatSlice",
  initialState,
  reducers: {
    changeCurrentSectionValue: (state, action: PayloadAction<sectionType>) => {
      state.currentSectionValue = action.payload;
    },
    resetCurrentConversation: (state) => {
      return {
        ...state,
        currentConversation: {
          ...currentConversationInitial,
        },
        currentConversationMessages: [],
        endOfMessagesIsReached: false,
        conversationDisplay_Status: false,
      };
    },
    setConversationIsLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        conversationIsLoading: action.payload,
      };
    },
    setConversationInfoIsLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        conversationInfoIsLoading: action.payload,
      };
    },
    setSelectedChatFetchingId: (
      state,
      action: PayloadAction<number | string | undefined>
    ) => {
      return {
        ...state,
        selectedChatIdForFetching: action.payload,
      };
    },
    setCurrentConversation: (
      state,
      action: PayloadAction<chatObj | channelObj>
    ) => {
      return {
        ...state,
        currentConversation: {
          ...action.payload,
        },
        endOfMessagesIsReached: false,
        conversationDisplay_Status:
          action.payload.id === undefined
            ? false
            : state.conversationDisplay_Status,
      };
    },
    setCurrentChannelSelectedUser: (
      state,
      action: PayloadAction<userObj | undefined>
    ) => {
      return {
        ...state,
        currentChannelSelectedUser: action.payload
          ? {
              ...action.payload,
            }
          : undefined,
        muteTargetId: action.payload?.id,
      };
    },
    appendMessage: (
      state,
      action: PayloadAction<messageConversationObj | chanellConversationObj>
    ) => {
      return {
        ...state,
        currentConversationMessages: [
          ...state.currentConversationMessages,
          action.payload,
        ],
      };
    },
    updateConversationMessages: (
      state,
      action: PayloadAction<(messageConversationObj | chanellConversationObj)[]>
    ) => {
      return {
        ...state,
        currentConversationMessages: action.payload,
      };
    },
    setEndMessagesReached: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        endOfMessagesIsReached: action.payload,
      };
    },
    setMuteTarget: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        muteTargetId: action.payload,
      };
    },
    toggleConversation: (state) => {
      state.conversationDisplay_Status = !state.conversationDisplay_Status;
    },
    toggleConversationInfo: (state) => {
      state.conversationInfo_Status = !state.conversationInfo_Status;
    },
    toggleCreateChannelWindow: (state, action: PayloadAction<boolean>) => {
      state.createChannelWindow_Status = !state.createChannelWindow_Status;
      state.createChannelWindowUpdate = action.payload;
    },
    toggleDialog: (state, action: PayloadAction<dialog>) => {
      return {
        ...state,
        chatDialog: {
          ...action.payload,
        },
      };
    },
    toggleChanellUsersWindow: (state) => {
      state.channelUsersWindow = !state.channelUsersWindow;
    },
    toggleTimingPicker: (state) => {
      return {
        ...state,
        timingPickerStatus: !state.timingPickerStatus,
      };
    },
    reRenderConversationSelection: (state) => {
      return {
        ...state,
        reRenderConversationSelection: !state.reRenderConversationSelection,
      };
    },
    reRenderMessages: (state) => {
      return {
        ...state,
        reRenderMessages: !state.reRenderMessages,
      };
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isTyping: action.payload,
      };
    },
  },
});

export const {
  changeCurrentSectionValue,
  resetCurrentConversation,
  setCurrentConversation,
  setCurrentChannelSelectedUser,
  toggleConversation,
  toggleConversationInfo,
  toggleCreateChannelWindow,
  toggleDialog,
  toggleChanellUsersWindow,
  updateConversationMessages,
  setEndMessagesReached,
  reRenderConversationSelection,
  reRenderMessages,
  toggleTimingPicker,
  setMuteTarget,
  appendMessage,
  setConversationIsLoading,
  setSelectedChatFetchingId,
  setConversationInfoIsLoading,
  setIsTyping,
} = chatSlice.actions;
export default chatSlice.reducer;
