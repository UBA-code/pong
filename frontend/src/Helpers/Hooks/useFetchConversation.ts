import axios from "axios";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  setConversationIsLoading,
  setCurrentChannelSelectedUser,
  setCurrentConversation,
} from "../../redux/slices/chatSlice";
import { friendshipStatus } from "../../components/Profile/ProfileBadge";
import { userObj } from "../../interfaces/apiInterfaces";
import { channelObj } from "../../components/Chat/enums-interfaces/chatInterfaces";
import { setAppIsLoading } from "../../redux/slices/appSlice";

export default function useFetchConversation() {
  const dispatch = useDispatch();
  const chatStates = useSelector((state: RootState) => state.chatStates);
  const userInfoStates = useSelector((state: RootState) => state.userInfoState);
  const fetchConversationChanges = useCallback(
    async (updateCurrentChannelSelectedUser = true) => {
      if (chatStates.currentConversation.id === -1) {
        return;
      }
      let fetchingEndpoint: string = "";
      if ("type" in chatStates.currentConversation) {
        fetchingEndpoint = `/chat/channels/${chatStates.currentConversation.id}`;
      } else {
        fetchingEndpoint = `/auth/whoami?username=${chatStates.currentConversation.username}`;
      }
      dispatch(setAppIsLoading(true));
      await axios
        .get(`${import.meta.env.VITE_FETCHING_URL}${fetchingEndpoint}`)
        .then((res) => res.data)
        .then(async (res) => {
          if (
            chatStates.currentChannelSelectedUser &&
            updateCurrentChannelSelectedUser
          ) {
            await axios
              .get(
                `${import.meta.env.VITE_FETCHING_URL}/user/friendship/${
                  userInfoStates.username
                }/${chatStates.currentChannelSelectedUser.username}`
              )
              .then((response) => response.data)
              .then((response: friendshipStatus) => {
                const newUserObj: userObj = {
                  ...chatStates.currentChannelSelectedUser!,
                  ...(res as channelObj).users.find(
                    (e) => e.id === chatStates.currentChannelSelectedUser?.id
                  ),
                  friendShipStatus: response,
                };
                dispatch(setCurrentChannelSelectedUser(newUserObj));
              })
              .catch((err) => console.log(err));
          }
          dispatch(setConversationIsLoading(false));
          dispatch(setAppIsLoading(false));

          dispatch(setCurrentConversation(res));
        })
        .catch((err) => console.log(err));
    },
    [
      chatStates.currentConversation,
      chatStates.currentChannelSelectedUser,
      userInfoStates,
      dispatch,
    ]
  );

  return fetchConversationChanges;
}
