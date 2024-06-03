//? icons
import { FiMail } from "react-icons/fi";
import { FaBan } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { FiUserPlus } from "react-icons/fi";
import { FiUserX } from "react-icons/fi";
import { FiUserCheck } from "react-icons/fi";
import { RiUserForbidLine } from "react-icons/ri";
import { TbUserDown } from "react-icons/tb";
import { TbUserUp } from "react-icons/tb";
import { IoGameControllerOutline } from "react-icons/io5";
import { FaArrowLeftLong } from "react-icons/fa6";
import { MdExitToApp } from "react-icons/md";
import { RiVolumeMuteLine } from "react-icons/ri";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { TbMessageCircleOff } from "react-icons/tb";
import { RxLinkBreak2 } from "react-icons/rx";

import { ComponentProps, ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  toggleConversationInfo,
  toggleTimingPicker,
  resetCurrentConversation,
  reRenderConversationSelection,
} from "../../../../redux/slices/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { Divider } from "@mui/material";
import { changeNotificationAlertValue } from "../../../../redux/slices/notificationSlice";
import { useNavigate } from "react-router";
import axios from "axios";
import useUpdateConversation from "../../../../Helpers/Hooks/useUpdateConversation";
import DoubleCheckBtn, {
  confirmColor,
} from "../../../../Helpers/components/DoubleCheckBtn";
import useFetchConversation from "../../../../Helpers/Hooks/useFetchConversation";
import { chatObj } from "../../enums-interfaces/chatInterfaces";
import ConversationInfoSkeleton from "./ConversationInfoSkeleton";

interface menuMethodeProp extends ComponentProps<"div"> {
  iconComponent: ReactElement;
  textContent: string;
  hasConfirm?: boolean;
  confirmColor?: confirmColor;
  confirmCallback?: () => void;
}

function MenuMethode({
  iconComponent,
  textContent,
  hasConfirm = false,
  confirmColor,
  confirmCallback,
  ...prop
}: menuMethodeProp) {
  const component = (
    <motion.button className={`block ${prop.className}`}>
      <div className="flex my-4 transition text-[var(--text-blue)]">
        {iconComponent}
        <span className={`pl-2 text-lg font-medium`}>{textContent}</span>
      </div>
    </motion.button>
  );
  return (
    <DoubleCheckBtn
      childComponent={component}
      color={confirmColor}
      hasConfirm={hasConfirm}
      confirmCallback={confirmCallback}
      onClick={prop.onClick}
    />
  );
}

interface ConversationInfoProp {
  active: boolean;
}

export default function ConversationInfo({ active }: ConversationInfoProp) {
  const fetchConversation = useFetchConversation();
  const dispatch = useDispatch();
  const chatstats = useSelector((state: RootState) => state.chatStates);
  const userInfo = useSelector((state: RootState) => state.userInfoState);
  const navigate = useNavigate();
  const currentConversation = chatstats.currentConversation;
  const isChannel = "type" in currentConversation;
  const hasPermession =
    isChannel &&
    currentConversation.admins?.some((e) => e.username === userInfo.username);
  const updateCurrentConversation = useUpdateConversation();

  const selectedUser = chatstats.currentChannelSelectedUser;

  const isFriend = selectedUser?.friendShipStatus === "FRIEND";

  const selectedUserIsAdmin =
    isChannel &&
    selectedUser &&
    currentConversation.admins?.some(
      (e) => e.username === selectedUser?.username
    );

  return (
    <div
      className={`info-box h-full absolute top-0 left-0 xl:left-auto xl:right-0
      w-full xl:w-[25%] xl:ml-3 rounded xl:rounded-l-none bg-[var(--light-purple)] px-4 py-8 transition overflow-y-auto ${
        active ? "translate-x-0" : "translate-x-[101%] xl:translate-x-0"
      }`}
    >
      {chatstats.conversationInfoIsLoading ? (
        <ConversationInfoSkeleton />
      ) : (
        <>
          <motion.button
            className="w-[45%] max-w-28 xl:hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch(toggleConversationInfo())}
          >
            <div className="hide-info transition text-[var(--text-blue)] mb-5">
              <FaArrowLeftLong size={25} />
            </div>
          </motion.button>
          <AnimatePresence>
            {chatstats.currentSectionValue === "channels" && !selectedUser ? (
              <div className="select-user-to-show-info">
                <h1 className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-xl text-center transition text-[--text-blue] font-semibold">
                  Select user to show
                </h1>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="username-avatar flex items-center h-[15%]">
                  <img
                    className="w-[40%] min-w-16 max-w-24 rounded"
                    src={
                      isChannel
                        ? selectedUser?.avatar
                        : currentConversation.avatar
                    }
                    referrerPolicy="no-referrer"
                    alt="user picture"
                  />
                  <div className="username text-2xl font-bold transition text-[var(--text-blue)] ml-4 truncate">
                    {isChannel
                      ? selectedUser?.displayname
                      : currentConversation.displayname}
                  </div>
                </div>
                <div className="menu mt-10 ">
                  <MenuMethode
                    className="view-profile -ml-1"
                    iconComponent={<FiUser size={30} />}
                    textContent="View profile"
                    onClick={() =>
                      navigate(
                        `/profile/${
                          isChannel
                            ? selectedUser?.username
                            : currentConversation.username
                        }`
                      )
                    }
                  />
                  {(isFriend ||
                    chatstats.currentSectionValue === "messages") && (
                    <>
                      <MenuMethode
                        className="invite-to-game"
                        iconComponent={<IoGameControllerOutline size={30} />}
                        textContent="Invite to a game"
                        hasConfirm
                        confirmCallback={() => {
                          const targetId =
                            chatstats.currentSectionValue === "channels"
                              ? selectedUser?.id
                              : (currentConversation as chatObj).id;
                          const targetUsername =
                            chatstats.currentSectionValue === "channels"
                              ? selectedUser?.username
                              : (currentConversation as chatObj).username;
                          axios
                            .post(
                              `${
                                import.meta.env.VITE_FETCHING_URL
                              }/game/invite`,
                              {
                                username: targetUsername,
                                id: targetId,
                              }
                            )
                            .then(() => {
                              dispatch(
                                changeNotificationAlertValue({
                                  alertContent: `Invitation sent to ${targetUsername}`,
                                  color: "success",
                                })
                              );
                            })
                            .catch((err) => console.error(err));
                        }}
                      />
                      {chatstats.currentSectionValue === "channels" && (
                        <MenuMethode
                          className="message-user"
                          iconComponent={<FiMail size={30} />}
                          textContent="Message"
                          onClick={() => {
                            if (chatstats.conversationInfo_Status)
                              dispatch(toggleConversationInfo());
                            updateCurrentConversation(
                              selectedUser?.username as string
                            );
                          }}
                        />
                      )}
                      <MenuMethode
                        iconComponent={
                          <RiUserForbidLine
                            size={30}
                            className="text-red-500"
                          />
                        }
                        className="unfriend-user"
                        textContent="Unfriend"
                        hasConfirm
                        confirmColor="danger"
                        confirmCallback={() => {
                          axios
                            .get(
                              `${
                                import.meta.env.VITE_FETCHING_URL
                              }/user/friendships/${userInfo.id}/remove/${
                                isChannel
                                  ? selectedUser?.id
                                  : currentConversation.id
                              }`
                            )
                            .then(() => {
                              if (
                                chatstats.currentSectionValue === "channels"
                              ) {
                                fetchConversation();
                              } else {
                                dispatch(resetCurrentConversation());
                                dispatch(reRenderConversationSelection());
                              }
                              dispatch(
                                changeNotificationAlertValue({
                                  alertContent: `you and ${
                                    selectedUser?.displayname ||
                                    (currentConversation as chatObj).displayname
                                  } are no longer friends`,
                                  color: "warning",
                                })
                              );
                            })
                            .catch((err) => console.log(err));
                        }}
                      />
                    </>
                  )}
                  {
                    <MenuMethode
                      iconComponent={
                        selectedUser?.friendShipStatus === "BLOCKED" ? (
                          <RxLinkBreak2
                            className="transition text-red-500"
                            size={30}
                          />
                        ) : (
                          <TbMessageCircleOff
                            className="transition text-red-500"
                            size={30}
                          />
                        )
                      }
                      textContent={
                        selectedUser?.friendShipStatus === "BLOCKED"
                          ? "Unblock user"
                          : "Block user"
                      }
                      hasConfirm
                      confirmCallback={() => {
                        const fetchUrl = `${
                          import.meta.env.VITE_FETCHING_URL
                        }/user/friendships/${userInfo.username}/${
                          selectedUser?.friendShipStatus === "BLOCKED"
                            ? "unblock"
                            : "block"
                        }/${
                          isChannel
                            ? chatstats.currentChannelSelectedUser?.username
                            : (chatstats.currentConversation as chatObj)
                                .username
                        }?byUsername=true`;

                        axios
                          .get(fetchUrl)
                          .then(() => {
                            if (chatstats.currentSectionValue === "channels") {
                              fetchConversation();
                            } else {
                              dispatch(reRenderConversationSelection());
                              dispatch(resetCurrentConversation());
                            }
                          })
                          .catch((err) => console.log(err));
                      }}
                      confirmColor="danger"
                    />
                  }
                  {chatstats.currentSectionValue === "channels" &&
                    isChannel && (
                      <>
                        {!isFriend &&
                        selectedUser?.friendShipStatus !== "BLOCKED" ? (
                          <MenuMethode
                            className="friendship-action"
                            iconComponent={
                              selectedUser?.friendShipStatus ===
                              "NOT_FRIEND" ? (
                                <FiUserPlus
                                  className="transition text-[var(--text-blue)]"
                                  size={30}
                                />
                              ) : selectedUser?.friendShipStatus ===
                                "PENDING" ? (
                                <FiUserX
                                  className="transition text-[var(--text-blue)]"
                                  size={30}
                                />
                              ) : selectedUser?.friendShipStatus ===
                                "REQUESTED" ? (
                                <FiUserCheck
                                  className="transition text-[var(--text-blue)]"
                                  size={30}
                                />
                              ) : (
                                <></>
                              )
                            }
                            textContent={`${
                              selectedUser?.friendShipStatus === "NOT_FRIEND"
                                ? "Add Friend"
                                : selectedUser?.friendShipStatus === "PENDING"
                                ? "Cancel Request"
                                : selectedUser?.friendShipStatus === "REQUESTED"
                                ? "Accept Request"
                                : ""
                            }`}
                            hasConfirm
                            confirmCallback={() => {
                              let action: string = "";
                              switch (selectedUser?.friendShipStatus) {
                                case "NOT_FRIEND":
                                case "REQUESTED":
                                  action = "add";
                                  break;
                                case "PENDING":
                                  action = "remove";
                                  break;
                                default:
                                  action = "add";
                              }
                              axios
                                .get(
                                  `${
                                    import.meta.env.VITE_FETCHING_URL
                                  }/user/friendships/${userInfo.id}/${action}/${
                                    selectedUser?.id
                                  }`
                                )
                                .then(() => {
                                  fetchConversation();
                                })
                                .catch((err) => console.log(err));
                            }}
                          />
                        ) : (
                          ""
                        )}
                        {hasPermession &&
                        //! check if user still member of the channel
                        currentConversation.users.some(
                          (e) => e.username === selectedUser?.username
                        ) ? (
                          <div className="admin-pannel">
                            <Divider variant="middle">
                              <span className="transition text-[--text-blue] font-semibold xl:text-sm">
                                Channel Options
                              </span>
                            </Divider>
                            <MenuMethode
                              iconComponent={
                                selectedUserIsAdmin ? (
                                  <TbUserDown
                                    size={30}
                                    className="text-red-500"
                                  />
                                ) : (
                                  <TbUserUp
                                    size={30}
                                    className="text-red-500"
                                  />
                                )
                              }
                              textContent={`${
                                selectedUserIsAdmin ? "Remove" : "Add"
                              } admin`}
                              hasConfirm
                              confirmColor="warning"
                              confirmCallback={() => {
                                axios
                                  .get(
                                    `${
                                      import.meta.env.VITE_FETCHING_URL
                                    }/chat/channels/${
                                      currentConversation.id
                                    }/add-admin/${selectedUser?.id}?adminId=${
                                      userInfo.id
                                    }`
                                  )
                                  .then(() => {
                                    fetchConversation();
                                  })
                                  .catch((err) => console.log(err));
                              }}
                            />

                            <MenuMethode
                              iconComponent={
                                <FaBan className="text-red-500" size={30} />
                              }
                              textContent="Ban"
                              hasConfirm
                              confirmColor="danger"
                              confirmCallback={() => {
                                axios
                                  .get(
                                    `${
                                      import.meta.env.VITE_FETCHING_URL
                                    }/chat/channels/${
                                      currentConversation.id
                                    }/ban/${selectedUser?.id}?adminId=${
                                      userInfo.id
                                    }`
                                  )
                                  .then(() => {
                                    fetchConversation();
                                  })
                                  .catch((err) => console.log(err));
                              }}
                            />
                            <MenuMethode
                              iconComponent={
                                <MdExitToApp
                                  className="text-red-500"
                                  size={30}
                                />
                              }
                              textContent="Kick"
                              hasConfirm
                              confirmColor="danger"
                              confirmCallback={() => {
                                axios
                                  .get(
                                    `${
                                      import.meta.env.VITE_FETCHING_URL
                                    }/chat/channels/${
                                      chatstats.currentConversation.id
                                    }/kick/${selectedUser?.id}?adminId=${
                                      userInfo.id
                                    }`
                                  )
                                  .then(() => {
                                    fetchConversation();
                                    dispatch(
                                      changeNotificationAlertValue({
                                        alertContent: `${selectedUser?.displayname} has been kicked`,
                                        color: "warning",
                                      })
                                    );
                                  })
                                  .catch((err) => console.log(err));
                              }}
                            />
                            {selectedUser?.isMuted ? (
                              <MenuMethode
                                iconComponent={
                                  <HiOutlineSpeakerWave
                                    className="text-green-400"
                                    size={30}
                                  />
                                }
                                textContent="Unmute"
                                hasConfirm
                                confirmColor="danger"
                                confirmCallback={() => {
                                  axios
                                    .get(
                                      `${
                                        import.meta.env.VITE_FETCHING_URL
                                      }/chat/channels/${
                                        currentConversation.id
                                      }/unmute/${selectedUser?.id}?adminId=${
                                        userInfo.id
                                      }`
                                    )
                                    .then(() => fetchConversation())
                                    .catch((err) => console.log(err));
                                }}
                              />
                            ) : (
                              <MenuMethode
                                iconComponent={
                                  <RiVolumeMuteLine
                                    className="text-red-500"
                                    size={30}
                                  />
                                }
                                textContent="Mute"
                                onClick={() => {
                                  dispatch(toggleTimingPicker());
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          hasPermession && (
                            <div className="text-center my-10 text-xl transition text-[--text-blue] font-semibold">
                              User not joined
                            </div>
                          )
                        )}
                      </>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
