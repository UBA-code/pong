import { chatState } from "../../../redux/slices/chatSlice";
import {
  chanellConversationObj,
  messageConversationObj,
  userObj,
} from "../../../interfaces/apiInterfaces";
import { channelType } from "../SelectedChat/CreateChannel";

export enum messageSender {
  me = 1,
  other = 2,
}

export enum StatusColors {
  online = "#27D003",
  playing = "#1657FF",
  offline = "#33363F",
}

export type Status = "online" | "playing" | "offline";
export type sectionType = "messages" | "channels" | "Others";

export interface chatObj {
  id: number;
  avatar: string;
  status: Status;
  username: string;
  displayname: string;
  lastMessage: string;
  lastMessageDate: string;
  messagedLast?: boolean;
  unseenNumber?: string;
}

export interface channelObj {
  id: number;
  name: string;
  avatar: string;
  type: channelType;
  password: string | null;
  createdAt: string;
  users: userObj[];
  allUsers: userObj[];
  allUsersConst: userObj[];
  admins: userObj[];
  banned: userObj[];
  muted: userObj[];
  createdBy: userObj;
  lastMessage: string;
  lastMessageTimeToNow: string;
  unseenNumber: string;
}

export interface selectedChatProp {
  currentSection: sectionType;
  chatStats: chatState;
}

export interface messageUnitProp {
  message: messageConversationObj | chanellConversationObj;
  avatar: string;
  currentSection: sectionType;
}

export interface messageInputProp {
  callback: (val: string) => void;
}

export interface State {
  infoStatus: boolean;
  currentSection: sectionType;
  selectedConversation: chatObj;
  activeConversation: boolean;
  createChannelWindow: boolean;
}

export interface Action {
  // type:
  //   | "info"
  //   | "currentSection"
  //   | "selected conversation"
  //   | "createChannelWindow";
  section?: sectionType;
  user?: chatObj;
}

export interface ConversationHeadProp {
  currentSection: sectionType;
}

export interface MessagesBoxPop {
  conversation: chatObj | channelObj;
  currentSection: sectionType;
}
