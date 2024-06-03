import { motion } from "framer-motion";
import { v4 as uuid4 } from "uuid";
//? icons
import { FaArrowLeftLong } from "react-icons/fa6";

// ? enums
import { selectedChatProp } from "../enums-interfaces/chatInterfaces";

//* components
import ConversationHead from "./ConversationHead";
import MessageInput from "./MessageInput";
import MessagesBox from "./MessagesBox";
import ConversationInfo from "./selectedChatInfo/ConversationInfo";

import {
  appendMessage,
  reRenderConversationSelection,
  resetCurrentConversation,
  toggleConversation,
  updateConversationMessages,
} from "../../../redux/slices/chatSlice";

//! hooks
import { useCallback, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useFetch from "../../../Helpers/Hooks/useFetch";

import { chatSocketContext } from "../../../Context/socketsContexts";
import { RootState } from "../../../redux/store";
import {
  chanellConversationObj,
  emmitingObj,
  messageConversationObj,
} from "../../../interfaces/apiInterfaces";
import { CircularProgress } from "@mui/material";

import axios from "axios";
import SkeletonConversation from "../SkeletonConversation";
import { typingEvent } from "../../../interfaces/socketsInterfaces";

//? componenet

export default function SelectedChat({
  currentSection,
  chatStats,
}: selectedChatProp) {
  const currentConversation = useSelector(
    (state: RootState) => state.chatStates.currentConversation
  );
  const isChannel = "type" in currentConversation;

  const dispatch = useDispatch();
  const userInfo = useSelector(
    (rootState: RootState) => rootState.userInfoState
  );

  const fetchingUrl = `${import.meta.env.VITE_FETCHING_URL}/chat${
    chatStats.currentSectionValue === "channels"
      ? `/channels/${chatStats.selectedChatIdForFetching}/messages/0` //? channel messages endpoint
      : `/dm/${userInfo.id}/${chatStats.selectedChatIdForFetching}/0` //? dm messages endpoint
  }`;

  const { data: messagesData, isLoading } =
    useFetch<(messageConversationObj | chanellConversationObj)[]>(fetchingUrl);
  const chatSocket = useContext(chatSocketContext);

  const handleSend = useCallback(
    (message: string) => {
      const sendType = isChannel ? "channels" : "dm";
      if (!message.replace(/\s/g, "").length) {
        return;
      }
      axios
        .post(
          `${import.meta.env.VITE_FETCHING_URL}/chat/${sendType}/${
            userInfo.id
          }/${currentConversation.id}`,
          { message }
        )
        .then((res) => {
          if (res.data !== -1) {
            chatSocket?.emit("typing", {
              id: userInfo.id,
              to: chatStats.currentConversation.id,
              status: false,
            } as typingEvent);
            const messageObj: emmitingObj = {
              id: uuid4(),
              // id: new Date().getTime(),
              avatar: isChannel ? currentConversation.avatar : userInfo.avatar,
              content: message,
              title: isChannel
                ? currentConversation.name
                : userInfo.displayname,
              sender: isChannel ? userInfo.displayname : undefined,
              senderUserName: userInfo.username,
              senderAvatar: isChannel ? userInfo.avatar : undefined,
              sectionFrom: chatStats.currentSectionValue,
              redirect: isChannel ? currentConversation.id : userInfo.username,
              to: isChannel
                ? currentConversation.id
                : currentConversation.username,
            };

            chatSocket?.emit(
              isChannel ? "channelMessage" : "privateMessage",
              messageObj
            );

            const messageToAppend = {
              messageId: isChannel ? messageObj.id : undefined,
              id: isChannel ? undefined : messageObj.id,
              message: messageObj.content,
              avatar: isChannel ? undefined! : messageObj.avatar,
              from: isChannel
                ? {
                    avatar: userInfo.avatar,
                    username: userInfo.username,
                  }
                : userInfo.username,
              to: isChannel ? undefined : messageObj.to,
              seen: false,
            };

            dispatch(reRenderConversationSelection());
            dispatch(appendMessage(messageToAppend as any)); //! very danger move but i think it's safe cz i set to value or undefined
          }
        })
        .catch(function (error) {
          console.log("chat post request failed: ");
          console.log(error);
        });
    },
    [chatSocket, chatStats, currentConversation, userInfo, isChannel, dispatch]
  );

  useEffect(() => {
    if (messagesData) {
      //? mark messages as seen
      axios
        .get(
          `${import.meta.env.VITE_FETCHING_URL}/chat/seen/${userInfo.id}/${
            currentConversation.id
          }`
        )
        .then(() => {
          dispatch(updateConversationMessages(messagesData!));
        })
        .catch((err) => {
          console.log(Error(err));
        });
    }
  }, [messagesData]);

  return chatStats.conversationIsLoading ? (
    <SkeletonConversation />
  ) : (
    <div className="selected-chat h-full xl:flex">
      <div className="back-button px-4 xl:hidden">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            dispatch(toggleConversation());
            dispatch(resetCurrentConversation());
          }}
        >
          <div className="text-[--text-blue] translate-y-1">
            <FaArrowLeftLong size={25} />
          </div>
        </motion.button>
      </div>
      <div className="user-chat-box relative h-[calc(100%-2rem)] xl:h-full flex flex-col xl:w-[75%] px-4 pb-4 xl:py-4">
        <ConversationHead currentSection={currentSection} />
        {isLoading ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <CircularProgress />
          </div>
        ) : (
          <>
            {messagesData?.length ||
            chatStats.currentConversationMessages.length ? (
              <MessagesBox />
            ) : (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-semibold transition text-[--text-blue]">
                Say Hi 👋 To Start Conversation
              </span>
            )}
            <MessageInput callback={handleSend} />
          </>
        )}
      </div>
      <ConversationInfo active={chatStats.conversationInfo_Status} />
    </div>
  );
}
