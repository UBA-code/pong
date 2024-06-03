import { motion } from "framer-motion";
import playBtn from "../../../assets/ChatAssets/play.png";

//? icons

import { HiOutlineUsers } from "react-icons/hi2";
import { TbPencilCog } from "react-icons/tb";
import { RxExit } from "react-icons/rx";

// ? enums
import {
  StatusColors,
  ConversationHeadProp,
  channelObj,
  chatObj,
} from "../enums-interfaces/chatInterfaces";
import {
  reRenderConversationSelection,
  resetCurrentConversation,
  toggleChanellUsersWindow,
  toggleConversationInfo,
  toggleCreateChannelWindow,
} from "../../../redux/slices/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import DoubleCheckBtn from "../../../Helpers/components/DoubleCheckBtn";
import axios from "axios";
import { changeNotificationAlertValue } from "../../../redux/slices/notificationSlice";
import { IconButton, Tooltip } from "@mui/material";
import useFetchConversation from "../../../Helpers/Hooks/useFetchConversation";
import { setAppIsLoading } from "../../../redux/slices/appSlice";

interface AnimationType {
  rotateZ: number[];
  scale: number;
  transition: {
    duration: number;
    repeat: number;
    repeatType: "reverse" | "mirror" | "loop" | undefined;
  };
}

const buttonHoverVariant = {
  hover: {
    rotateZ: 0,
    scale: 1,
  },
  animation: {
    rotateZ: [0, -2, 2],
    scale: 1.09,
    transition: {
      duration: 0.3,
      repeat: Infinity,
      repeatType: "reverse",
    },
  } as AnimationType,
};

const quickSettingButtonsVariants = {
  hover: {
    scale: 1.1,
  },
  tap: {
    scale: 1,
  },
};

export default function ConversationHead({
  currentSection,
}: ConversationHeadProp) {
  const chatStates = useSelector(
    (rootState: RootState) => rootState.chatStates
  );
  const userInfoState = useSelector(
    (rootState: RootState) => rootState.userInfoState
  );
  const conversation = chatStates.currentConversation;
  const isChannel = "type" in conversation;
  const dispatch = useDispatch();
  const fetchConversation = useFetchConversation();
  const hasPermession =
    isChannel &&
    conversation.admins?.some((e) => e.username === userInfoState.username);

  // ? head box */
  return (
    <div className="head flex items-center justify-between h-16 mb-auto">
      <div
        className="user-name-avatar-status flex items-center w-[55%] cursor-pointer"
        onClick={() => dispatch(toggleConversationInfo())}
      >
        <div className="avatar">
          <img
            className="min-w-10 w-14 rounded"
            src={conversation.avatar}
            alt="profile picture"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="username-status ml-3 overflow-hidden">
          <div className="title font-bold text-xl transition text-[var(--text-blue)] text-nowrap overflow-hidden text-ellipsis">
            {isChannel ? conversation.name : conversation.displayname}
          </div>
          {!isChannel && (
            <div className="status relative ml-4 font-bold text-gray-500 text-sm">
              <span
                className="status-color w-2 h-2 absolute rounded-full -left-4 top-1/2 -translate-y-1/2"
                style={{ backgroundColor: StatusColors[conversation.status] }}
              ></span>
              {chatStates.isTyping ? 'Typing...' : conversation.status}
            </div>
          )}
        </div>
      </div>
      {currentSection === "messages" ? (
        <motion.button
          className="w-[45%] max-w-28"
          variants={buttonHoverVariant}
          whileHover="hover"
          whileTap={{ scale: 0.9 }}
          animate="animation"
          onClick={() => {
            axios
              .post(`${import.meta.env.VITE_FETCHING_URL}/game/invite`, {
                id: (chatStates.currentConversation as chatObj).id,
                username: (chatStates.currentConversation as chatObj).username,
              })
              .then(() => {
                dispatch(
                  changeNotificationAlertValue({
                    alertContent: `Game request sent to ${
                      (conversation as chatObj).displayname
                    }`,
                    color: "success",
                  })
                );
              })
              .catch((err) => console.log(err));
          }}
        >
          <div className="play-btn flex items-center justify-evenly bg-slate-100 py-2 px-3 rounded">
            <img src={playBtn} alt="start icon" referrerPolicy="no-referrer" />
            <p className="font-bold text-lg text-[var(--purple)]">Play</p>
          </div>
        </motion.button>
      ) : (
        <div className="channel-quick-setting flex items-center justify-evenly w-[45%] max-w-36">
          <motion.div
            className="total-members flex items-center transition border border-[--white-text] text-[--white-text] rounded-lg p-1 cursor-pointer"
            onClick={() => {
              fetchConversation();
              dispatch(toggleChanellUsersWindow());
            }}
            variants={quickSettingButtonsVariants}
            whileHover={"hover"}
            whileTap={"tap"}
          >
            <HiOutlineUsers size={25} />
            <div className="total-users text-xl font-semibold ml-1">
              {(chatStates.currentConversation as channelObj).users?.length}
            </div>
          </motion.div>
          {hasPermession && (
            <Tooltip title="EdittoggleCreateChannelWindow channel info">
              <IconButton
                onClick={() => {
                  dispatch(toggleCreateChannelWindow(true)); // true mean update existing channel
                }}
              >
                <TbPencilCog
                  className="transition text-[--white-text]"
                  size={25}
                />
              </IconButton>
            </Tooltip>
          )}
          <DoubleCheckBtn
            childComponent={
              <Tooltip title="Exit channel">
                <IconButton>
                  <RxExit
                    className="transition text-[--white-text]"
                    size={25}
                  />
                </IconButton>
              </Tooltip>
            }
            hasChoice={false}
            hasConfirm={true}
            color="danger"
            confirmCallback={() => {
              dispatch(setAppIsLoading(true));
              axios
                .get(
                  `${import.meta.env.VITE_FETCHING_URL}/chat/channels/${
                    chatStates.currentConversation.id
                  }/remove/${userInfoState.id}`
                )
                .then((data) => {
                  dispatch(changeNotificationAlertValue(data.data));
                  dispatch(reRenderConversationSelection());
                  dispatch(resetCurrentConversation());
                  dispatch(setAppIsLoading(false));
                })
                .catch((err) => console.log(err));
            }}
          />
        </div>
      )}
    </div>
  );
}
