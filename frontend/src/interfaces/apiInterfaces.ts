import {
  Status,
  sectionType,
} from "../components/Chat/enums-interfaces/chatInterfaces";
import { friendshipStatus } from "../components/Profile/ProfileBadge";

export interface userObj {
  id: number;
  email: string;
  username: string;
  displayname: string;
  avatar: string;
  status: Status;
  win: number;
  lose: number;
  age: number;
  birthday: string;
  sex: string;
  country: string;
  thirdParty: string;
  chatSocketId: string;
  reRefetchUserInfo: boolean;
  friendShipStatus: friendshipStatus;
  rankAvatar: string;
  isMuted?: boolean;
  isAdmin?: boolean;
  isBanned?: boolean;
  isCreator?: boolean;
  x: string;
  facebook: string;
}

export interface messageConversationObj {
  id: number;
  message: string;
  from: string;
  to: number | string;
  createdAt: string;
  avatar: string;
  seen: boolean;
}

export interface chanellConversationObj {
  messageId: number;
  from: {
    username: string;
    avatar: string;
  };
  message: string;
  createdAt: string;
}

export interface emmitingObj {
  id: number;
  avatar: string;
  content: string;
  to: number | string; //* where the user will be redirected if he clicked
  title: string; //* this is the name of the user or the channel name
  redirect: string | number; //* where the user will be redirected if he clicked
  sectionFrom: sectionType;
  sender?: string; //* in case of channel, to display the sender name
  senderUserName?: string; //* in case of channel, to display the sender name
  senderAvatar?: string;
  seen?: boolean;
}

export interface tokenObj {
  jwt: string;
}
