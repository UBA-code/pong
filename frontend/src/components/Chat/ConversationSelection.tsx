// ? enums
import { useDispatch, useSelector } from "react-redux";
import {
  StatusColors,
  channelObj,
  chatObj,
} from "./enums-interfaces/chatInterfaces";
import { RootState } from "../../redux/store";
import { useCallback, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import useUpdateConversation from "../../Helpers/Hooks/useUpdateConversation";
import {
  reRenderConversationSelection,
  setConversationIsLoading,
  setSelectedChatFetchingId,
  updateConversationMessages,
} from "../../redux/slices/chatSlice";
import { setAppIsLoading } from "../../redux/slices/appSlice";
import { changeNotificationAlertValue } from "../../redux/slices/notificationSlice";

interface ConversationSelectionObj {
  avatar: string;
  conversationName: string;
  lastMessage: string;
  lastMessageDate: string;
  messagedLast: boolean | undefined;
  unseenNumber: string | undefined;
  type: "public" | "private" | "protected" | undefined;
}

export default function ConversationSelection({
  conversation,
}: {
  conversation: chatObj | channelObj;
}) {
  const [joinChannelWindow, setJoinChannelWindow] = useState(false);
  let conversationObj: ConversationSelectionObj;
  const isChannel = "type" in conversation;
  const chatStats = useSelector((rootState: RootState) => rootState.chatStates);
  const userInfoStats = useSelector(
    (rootState: RootState) => rootState.userInfoState
  );
  const dispatch = useDispatch();
  const updateCurrentConversation = useUpdateConversation();
  const handleJoinChannel = useCallback(() => {
    if (isChannel) {
      const passwordInput = document.querySelector(
        ".password-input"
      ) as HTMLInputElement;
      dispatch(setAppIsLoading(true));
      axios
        .post(
          `${import.meta.env.VITE_FETCHING_URL}/chat/channels/${
            conversation.id
          }/add/${userInfoStats.id}`,
          {
            password:
              conversation.type === "protected"
                ? passwordInput.value
                : "secret",
          }
        )
        .then((data) => data.data)
        .then((data) => {
          dispatch(setAppIsLoading(false));
          if ((data.alertContent as string).includes("Successfully")) {
            updateCurrentConversation(conversation.id);
          }
        })
        .catch((err) => {
          console.log(
            `something goes wrong when try to join ${conversation.name} channel`
          );
          console.log(err);
        });
    }
  }, [
    conversation,
    userInfoStats,
    dispatch,
    updateCurrentConversation,
    isChannel,
  ]);

  if (isChannel) {
    conversationObj = {
      avatar: conversation.avatar,
      conversationName: conversation.name,
      lastMessage: conversation.lastMessage,
      lastMessageDate: conversation.lastMessageTimeToNow,
      messagedLast: true,
      unseenNumber: conversation.unseenNumber,
      type: conversation.type,
    };
  } else {
    conversationObj = {
      avatar: conversation.avatar,
      conversationName: conversation.displayname,
      lastMessage: conversation.lastMessage,
      lastMessageDate: conversation.lastMessageDate,
      messagedLast: conversation.messagedLast,
      unseenNumber: conversation.unseenNumber || "",
      type: undefined,
    };
  }

  return (
    <>
      <div
        className="conversation-box my-4 flex items-center justify-between cursor-pointer"
        onClick={() => {
          if (chatStats.currentSectionValue === "Others") {
            setJoinChannelWindow(true);
          } else {
            axios
              .get(
                `${import.meta.env.VITE_FETCHING_URL}/chat/seen/${
                  userInfoStats.id
                }/${chatStats.currentConversation.id}`
              )
              .then(() => {
                dispatch(reRenderConversationSelection());
                if (chatStats.currentConversation.id === undefined) {
                  dispatch(
                    changeNotificationAlertValue({
                      alertContent: "Channel not found",
                      color: "danger",
                    })
                  );
                } else if (
                  chatStats.currentConversation.id !== conversation.id
                ) {
                  const id = isChannel
                    ? conversation.id
                    : conversation.username;
                  dispatch(setConversationIsLoading(true));
                  updateCurrentConversation(id);
                  dispatch(setSelectedChatFetchingId(conversation.id));
                }
              })
              .catch((err) => {
                console.log(Error(err));
              });
          }
        }}
      >
        <div className="avatar-status relative mr-2 w-14">
          <img
            className="w-14 aspect-square rounded "
            src={conversationObj.avatar}
            referrerPolicy="no-referrer"
            alt="profile picture"
          />
          {!isChannel && (
            <span
              className={`status`}
              style={{ backgroundColor: StatusColors[conversation.status] }}
            ></span>
          )}
        </div>
        <div className="conversation-info w-[80%] mr-auto text-nowrap overflow-hidden">
          <div className="username transition text-[var(--text-blue)] font-bold overflow-ellipsis overflow-hidden">
            {conversationObj.conversationName}
          </div>
          {chatStats.currentSectionValue !== "Others" && (
            <div className="last-message text-sm font-bold text-gray-500 overflow-ellipsis overflow-hidden">
              {conversationObj.messagedLast ? (
                conversationObj.lastMessage
              ) : (
                <>
                  <span className="text-[--text-blue]">Me: </span>
                  <span>{conversationObj.lastMessage}</span>
                </>
              )}
            </div>
          )}
        </div>
        {chatStats.currentSectionValue !== "Others" && (
          <div className="timing flex flex-col items-center justify-center">
            <div className="time font-bold text-gray-500">
              {conversationObj.lastMessageDate}
            </div>
            {conversationObj.messagedLast ? (
              <div className="total-last-messages rounded-full bg-red-500 text-[#fff] font-bold text-sm w-5 text-center">
                {conversationObj.unseenNumber
                  ? parseInt(conversationObj.unseenNumber) > 9
                    ? "+9"
                    : conversationObj.unseenNumber
                  : ""}
              </div>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
      <AnimatePresence>
        {joinChannelWindow && (
          <motion.div
            className={`joinChannelWindow absolute w-full h-full top-0 left-0 bg-[--light-purple] rounded xl:rounded-r-none
        flex flex-col items-center justify-center z-40
        `}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="avatar">
              <img
                className="w-[60%] md:max-w-[200px] rounded-full mx-auto"
                src={conversationObj.avatar}
                alt="avatar"
              />
            </div>
            <div className="name text-xl font-bold text-[--text-blue] my-5">
              {conversationObj.conversationName}
            </div>
            {conversationObj.type === "protected" ? (
              <input
                className="password-input bg-white rounded w-[80%] py-3 px-2 my-4"
                type="text"
                placeholder="Channel password"
              />
            ) : (
              ""
            )}
            <motion.button
              className="join-btn bg-emerald-500 text-white font-medium text-center w-[80%] max-w-sm py-3 rounded-md mt-10"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 1 }}
              onClick={handleJoinChannel}
            >
              Join the {conversationObj.conversationName} Channel
            </motion.button>
            <motion.button
              className="cancel-btn my-4 text-[--text-blue] font-medium"
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 1 }}
              onClick={() => setJoinChannelWindow(false)}
            >
              No thanks
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
