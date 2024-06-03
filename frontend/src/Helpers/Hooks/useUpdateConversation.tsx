import axios from "axios";
import {
  changeCurrentSectionValue,
  setConversationIsLoading,
  setCurrentChannelSelectedUser,
  setCurrentConversation,
  setSelectedChatFetchingId,
  toggleConversation,
  updateConversationMessages,
} from "../../redux/slices/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useCallback } from "react";
import { RootState } from "../../redux/store";
import { setAppIsLoading } from "../../redux/slices/appSlice";

export default function useUpdateConversation() {
  const chatStates = useSelector(
    (rootState: RootState) => rootState.chatStates
  );

  const appStates = useSelector((rootState: RootState) => rootState.appStates);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const action = useCallback(
    async (username: string | number) => {
      const isChannel = typeof username === "number";
      if ((!isChannel && username?.length) || (isChannel && username >= 0)) {
        dispatch(setAppIsLoading(true));
        axios
          .get(
            `${import.meta.env.VITE_FETCHING_URL}/${
              isChannel
                ? `chat/channels/${username}`
                : `auth/whoami?username=${username}`
            }`
          )
          .then((res) => res.data)
          .then((res) => {
            dispatch(setSelectedChatFetchingId(res.id));
            if (isChannel && chatStates.currentSectionValue !== "channels")
              dispatch(changeCurrentSectionValue("channels"));
            if (!isChannel && chatStates.currentSectionValue !== "messages")
              dispatch(changeCurrentSectionValue("messages"));
            if (chatStates.currentChannelSelectedUser)
              dispatch(setCurrentChannelSelectedUser(undefined));
            dispatch(setCurrentConversation(res));
            if (!chatStates.conversationDisplay_Status) {
              dispatch(toggleConversation());
            }
            if (appStates.currentPage !== "Chat") {
              navigate("/chat");
            }
            dispatch(setConversationIsLoading(false));
            dispatch(setAppIsLoading(false));
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    [
      appStates.currentPage,
      chatStates.conversationDisplay_Status,
      chatStates.currentChannelSelectedUser,
      chatStates.currentSectionValue,
      dispatch,
      navigate,
    ]
  );

  return action;
}
