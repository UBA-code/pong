// ? enums
import { useDispatch, useSelector } from "react-redux";
import {
  messageSender,
  messageUnitProp,
} from "../enums-interfaces/chatInterfaces";
import { motion } from "framer-motion";
import { RootState } from "../../../redux/store";
import {
  chanellConversationObj,
  userObj,
} from "../../../interfaces/apiInterfaces";
import { useCallback } from "react";
import axios from "axios";
import {
  setConversationInfoIsLoading,
  setCurrentChannelSelectedUser,
  toggleConversationInfo,
} from "../../../redux/slices/chatSlice";
import { friendshipStatus } from "../../Profile/ProfileBadge";
import useFetchConversation from "../../../Helpers/Hooks/useFetchConversation";

//? icons
import { PiCheckBold } from "react-icons/pi";
import { PiChecksBold } from "react-icons/pi";

export default function MessageUnit({
  message,
  avatar,
  currentSection,
}: messageUnitProp) {
  const dispatch = useDispatch();
  const userInfoState = useSelector(
    (rootState: RootState) => rootState.userInfoState
  );
  const chatState = useSelector((rootState: RootState) => rootState.chatStates);
  let sender: messageSender = messageSender.me;
  const fetchConversation = useFetchConversation();

  const handleSelectUser = useCallback(() => {
    dispatch(setConversationInfoIsLoading(true));
    if (!chatState.conversationInfo_Status) {
      dispatch(toggleConversationInfo());
    }
    axios
      .get(
        `${import.meta.env.VITE_FETCHING_URL}/auth/whoami?username=${
          (message as chanellConversationObj).from.username
        }`
      )
      .then((res) => res.data)
      .then((res: userObj) => {
        axios
          .get(
            `${import.meta.env.VITE_FETCHING_URL}/user/friendship/${
              userInfoState.username
            }/${res.username}`
          )
          .then((response) => response.data)
          .then((response: friendshipStatus) => {
            const newUserObj: userObj = { ...res, friendShipStatus: response };
            dispatch(setCurrentChannelSelectedUser(newUserObj));
            fetchConversation(false);
            dispatch(setConversationInfoIsLoading(false));
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }, [message]);

  if (
    (currentSection === "messages" &&
      message.from !== userInfoState.username) ||
    (currentSection === "channels" &&
      (message as chanellConversationObj).from.username !==
        userInfoState.username)
  ) {
    sender = messageSender.other;
  }

  return (
    <motion.div
      className={`message max-w-[90%] my-1 flex items-end transition-colors ${
        sender === messageSender.me
          ? "bg-[--purple] text-white rounded rounded-br-none ml-auto mr-1"
          : ""
      }`}
      initial={{ x: sender === messageSender.me ? 100 : -100 }}
      animate={{ x: 0 }}
      transition={{ type: "tween" }}
    >
      {sender !== messageSender.me && currentSection === "channels" ? (
        <img
          className="w-10 rounded-full cursor-pointer"
          src={avatar}
          alt="user picture"
          onClick={handleSelectUser}
          referrerPolicy="no-referrer"
        />
      ) : (
        ""
      )}
      <p
        className={`relative px-5 py-3 break-all flex items-center ${
          sender === messageSender.me
            ? ""
            : "bg-slate-200 rounded rounded-bl-none mr-auto"
        }`}
      >
        {message.message}
        <span className="absolute bottom-0 right-0">
          {!("users" in chatState.currentConversation) &&
          "seen" in message &&
          sender === messageSender.me ? (
            message.seen === false ? (
              <PiCheckBold className="mr-1 mb-1" />
            ) : (
              <PiChecksBold className="transition text-blue-500 dark:text-blue-400 mr-1" />
            )
          ) : (
            ""
          )}
        </span>
      </p>
    </motion.div>
  );
}
