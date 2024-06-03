import MessageUnit from "./MessageUnit";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  chanellConversationObj,
  messageConversationObj,
} from "../../../interfaces/apiInterfaces";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { setAppIsLoading } from "../../../redux/slices/appSlice";
import axios from "axios";
import {
  setEndMessagesReached,
  updateConversationMessages,
} from "../../../redux/slices/chatSlice";

export default function MessagesBox() {
  const dispatch = useDispatch();
  const chatStates = useSelector((state: RootState) => state.chatStates);
  const userStates = useSelector((state: RootState) => state.userInfoState);
  const messages = chatStates.currentConversationMessages;
  const isChannel = "type" in chatStates.currentConversation;
  const messageBoxRef = useRef<HTMLDivElement>(null);
  const fetchingUrl = `${import.meta.env.VITE_FETCHING_URL}/chat${
    chatStates.currentSectionValue === "channels"
      ? `/channels/${chatStates.selectedChatIdForFetching}/messages/${chatStates.currentConversationMessages.length}` //? channel messages endpoint
      : `/dm/${userStates.id}/${chatStates.selectedChatIdForFetching}/${chatStates.currentConversationMessages.length}` //? dm messages endpoint
  }`;

  const lastMessageScrollPoint = useRef<HTMLElement | null>(null);

  const lastMessage =
    chatStates.currentConversationMessages[
      chatStates.currentConversationMessages.length - 1
    ];

  const handleScrollLoadMessages = useCallback(
    (e: Event) => {
      const element = e.target as HTMLElement;
      if (element.scrollTop === 0 && !chatStates.endOfMessagesIsReached) {
        const lastElement = document.querySelector(".message") as HTMLElement;

        lastMessageScrollPoint.current = lastElement;

        dispatch(setAppIsLoading(true));

        axios
          .get(fetchingUrl)
          .then((res) => res.data)
          .then((res: (messageConversationObj | chanellConversationObj)[]) => {
            if (!res.length) {
              dispatch(setEndMessagesReached(true));
              lastMessageScrollPoint.current = null;
            } else {
              const filteredMessages = res.filter((e) => {
                const id = isChannel
                  ? (e as chanellConversationObj).messageId
                  : (e as messageConversationObj).id;
                return !chatStates.currentConversationMessages.some(
                  (message) => {
                    const messageId = isChannel
                      ? (message as chanellConversationObj).messageId
                      : (message as messageConversationObj).id;
                    return messageId === id;
                  }
                );
              });
              dispatch(
                updateConversationMessages(
                  filteredMessages.concat(
                    chatStates.currentConversationMessages
                  )
                )
              );
            }

            dispatch(setAppIsLoading(false));
          })
          .catch((err) => console.log(err));
      }
    },
    [
      fetchingUrl,
      dispatch,
      chatStates.currentConversationMessages,
      chatStates.endOfMessagesIsReached,
      isChannel,
    ]
  );

  //? scroll to last message in the first load or if last message changed
  useEffect(() => {
    if (messageBoxRef.current) {
      lastMessageScrollPoint.current = null;
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [lastMessage]);

  useEffect(() => {
    if (lastMessageScrollPoint.current) {
      lastMessageScrollPoint.current.scrollIntoView();
    }
    messageBoxRef.current?.addEventListener("scroll", handleScrollLoadMessages);
    return () =>
      messageBoxRef.current?.removeEventListener(
        "scroll",
        handleScrollLoadMessages
      );
  });

  return (
    <AnimatePresence>
      <motion.div
        className={`messages-box w-[100%] h-auto my-2 flex flex-col overflow-y-auto overflow-x-hidden`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={messageBoxRef}
      >
        {messages?.map((e) => (
          <MessageUnit
            key={
              "messageId" in e && e.messageId
                ? e.messageId
                : (e as messageConversationObj).id
            }
            message={e}
            avatar={
              isChannel
                ? (e as chanellConversationObj).from.avatar
                : (e as messageConversationObj).avatar
            }
            currentSection={chatStates.currentSectionValue}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
