import { v4 as uuid4 } from "uuid";
import { IoCloseSharp } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";

//? icons
import { FaUserShield } from "react-icons/fa";
import { FaBan } from "react-icons/fa";
import { RiVolumeMuteLine } from "react-icons/ri";
import { FaUserAltSlash } from "react-icons/fa";
import { LuUndo2 } from "react-icons/lu";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { FiUserPlus } from "react-icons/fi";
import { MdOutlinePersonSearch } from "react-icons/md";

import { ComponentProps, useCallback, useEffect, useState } from "react";
import { channelObj } from "../../components/Chat/enums-interfaces/chatInterfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { IconButton, Tooltip } from "@mui/material";
import axios from "axios";
import useFetchConversation from "../Hooks/useFetchConversation";
import { useNavigate } from "react-router";
import {
  setCurrentConversation,
  setMuteTarget,
  toggleTimingPicker,
} from "../../redux/slices/chatSlice";
import Input from "@mui/joy/Input";
import { userObj } from "../../interfaces/apiInterfaces";
import { setAppIsLoading } from "../../redux/slices/appSlice";
import { changeNotificationAlertValue } from "../../redux/slices/notificationSlice";

interface ChannelUsersDialogProp extends ComponentProps<"div"> {}

export default function ChannelUsersDialog({
  ...prop
}: ChannelUsersDialogProp) {
  
  const chatState = useSelector((rootState: RootState) => rootState.chatStates);
  const userInfoState = useSelector(
    (rootState: RootState) => rootState.userInfoState
  );
  
  const [usersSearch, setUsersSearch] = useState("");

  const allUsers =
    (chatState.currentConversation as channelObj).allUsersConst ||
    (chatState.currentConversation as channelObj).allUsers || [];

  const filtredUsers = (chatState.currentConversation as channelObj).allUsers || [];

  const dispatch = useDispatch();

  const hasPermission = allUsers.find(
    (e) => e.id === userInfoState.id
  )?.isAdmin;

  const fetchConversation = useFetchConversation();
  const navigate = useNavigate();

  const handleFilterUsers = useCallback(
    async (searchOutside = false) => {
      let tempUsers: userObj[] = [];
      if (usersSearch.replace(/\s/gi, "").length) {
        if (hasPermission && searchOutside) {
          dispatch(setAppIsLoading(true));
          await axios
            .get(
              `${import.meta.env.VITE_FETCHING_URL}/user/search/${
                userInfoState.username
              }?search=${usersSearch}`
            )
            .then((res) => res.data)
            .then((res: userObj[]) => {
              if (!res.length) {
                dispatch(
                  changeNotificationAlertValue({
                    alertContent: "No users found",
                    color: "warning",
                  })
                );
              }
              tempUsers = res.filter(
                (e) => !allUsers.find((user) => user.username === e.username)
              );
              dispatch(setAppIsLoading(false));
            })
            .catch((err) => console.log(err));
          tempUsers = [
            ...tempUsers,
            ...allUsers.filter((e) => e.displayname.includes(usersSearch)),
          ];
        } else {
          tempUsers = allUsers.filter((e) =>
            e.displayname.includes(usersSearch)
          );
        }
      } else {
        tempUsers = allUsers;
      }
      dispatch(
        setCurrentConversation({
          ...chatState.currentConversation,
          allUsers: tempUsers,
          allUsersConst: allUsers,
        })
      );
    },
    [usersSearch, hasPermission, chatState.currentConversation, allUsers]
  );

  useEffect(() => {
    handleFilterUsers();
  }, [usersSearch]);

  return (
    <motion.div
      className="channelUsersDialog-container absolute w-full h-full top-0 left-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="close-bg absolute w-full h-full top-0 left-0 bg-[var(--trans-bg)] rounded z-30"
        onClick={prop.onClick}
      ></div>
      <div className="channelUsersDialog-box transition bg-[--white-bg] z-40 w-[90%] max-w-[650px] rounded px-6 py-4 h-[80%] max-h-[700px] overflow-hidden">
        <div className="head flex items-center justify-between h-[5%]">
          <div className="title transition text-2xl font-bold text-[var(--text-blue)]">
            Users{" "}
            {`(${(chatState.currentConversation as channelObj).users?.length})`}
          </div>
          <Tooltip
            className="close-btn"
            title="close menu"
            placement="top"
            onClick={prop.onClick}
          >
            <IconButton>
              <IoCloseSharp
                className="transition text-[var(--text-blue)]"
                size={30}
              />
            </IconButton>
          </Tooltip>
        </div>
        <div className={`dialog-content mt-4 h-[93%] overflow-y-auto relative`}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Input
                value={usersSearch}
                onChange={(event) => setUsersSearch(event.target.value)}
                type="text"
                placeholder="username"
                endDecorator={
                  hasPermission && (
                    <Tooltip title="Show users outside channel">
                      <IconButton onClick={() => handleFilterUsers(true)}>
                        <MdOutlinePersonSearch size={25} />
                      </IconButton>
                    </Tooltip>
                  )
                }
              />
            </motion.div>
          </AnimatePresence>
          {filtredUsers.map((e) =>
            // ? If a user is banned, show it only to admins
            e.isBanned && !hasPermission ? (
              ""
            ) : (
              <div
                className="user-box my-2 py-3 px-2 rounded flex items-center justify-between transition bg-[var(--light-purple)]"
                key={uuid4()}
              >
                <div
                  className="user-info flex items-center overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/profile/${e.username}`)}
                >
                  <div className="avatar min-w-12">
                    <img
                      className="w-12 rounded"
                      src={e.avatar}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div
                    className={`username text-lg font-bold transition ${
                      e.isAdmin ? "text-[#e09f3e]" : "text-[var(--text-blue)]"
                    } ml-2 max-w-[80%] text-nowrap overflow-hidden text-ellipsis`}
                  >
                    {e.displayname}
                  </div>
                </div>
                {userInfoState.id !== e.id && (
                  <div className="actions flex items-center text-[var(--lose-text-red)]">
                    {hasPermission && !e.isBanned && (
                      <>
                        {allUsers.find(
                          (user) => user.username === e.username
                        ) ? (
                          <>
                            <div
                              className={`give-permission-btn`}
                              onClick={() => {
                                dispatch(setAppIsLoading(true));

                                axios
                                  .get(
                                    `http://${
                                      import.meta.env.VITE_BACKEND_HOST
                                    }:${
                                      import.meta.env.VITE_BACKEND_PORT
                                    }/chat/channels/${
                                      chatState.currentConversation.id
                                    }/add-admin/${e.id}?adminId=${
                                      userInfoState.id
                                    }`
                                  )
                                  .then(() => {
                                    fetchConversation();
                                    dispatch(setAppIsLoading(false));
                                  })
                                  .catch((err) => {
                                    console.log(
                                      `something goes wrong when try to give permission to ${e.displayname}`
                                    );
                                    console.log(err.response);
                                  });
                              }}
                            >
                              {e.isAdmin ? (
                                <Tooltip title="remove permession">
                                  <IconButton>
                                    <FaUserAltSlash
                                      className="text-amber-600"
                                      size={25}
                                    />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="give permession">
                                  <IconButton>
                                    <FaUserShield
                                      className="text-amber-500"
                                      size={25}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </div>
                            {e.isMuted ? (
                              <Tooltip
                                className="unmute-btn"
                                title="Unmute user"
                              >
                                <IconButton
                                  onClick={() => {
                                    dispatch(setAppIsLoading(true));

                                    axios
                                      .get(
                                        `${
                                          import.meta.env.VITE_FETCHING_URL
                                        }/chat/channels/${
                                          chatState.currentConversation.id
                                        }/unmute/${e.id}?adminId=${
                                          userInfoState.id
                                        }`
                                      )
                                      .then(() => {
                                        fetchConversation();
                                        dispatch(setAppIsLoading(false));
                                      })
                                      .catch((err) => console.log(err));
                                  }}
                                >
                                  <HiOutlineSpeakerWave
                                    className="text-red-500"
                                    size={25}
                                  />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip className="mute-btn" title="Mute user">
                                <IconButton
                                  onClick={() => {
                                    dispatch(setMuteTarget(e.id));
                                    dispatch(toggleTimingPicker());
                                  }}
                                >
                                  <RiVolumeMuteLine
                                    className="text-red-500"
                                    size={25}
                                  />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip className="ban-btn" title="Ban user">
                              <IconButton
                                onClick={() => {
                                  dispatch(setAppIsLoading(true));

                                  axios
                                    .get(
                                      `http://${
                                        import.meta.env.VITE_BACKEND_HOST
                                      }:${
                                        import.meta.env.VITE_BACKEND_PORT
                                      }/chat/channels/${
                                        chatState.currentConversation.id
                                      }/ban/${e.id}?adminId=${userInfoState.id}`
                                    )
                                    .then(() => {
                                      fetchConversation();
                                      dispatch(setAppIsLoading(false));
                                    })
                                    .catch((err) => console.log(err));
                                }}
                              >
                                <FaBan className="text-red-500" size={25} />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Add user to channel">
                            <IconButton
                              onClick={() => {
                                dispatch(setAppIsLoading(true));

                                axios
                                  .post(
                                    `${
                                      import.meta.env.VITE_FETCHING_URL
                                    }/chat/channels/${
                                      chatState.currentConversation.id
                                    }/add/${e.id}`
                                  )
                                  .then(() => {
                                    dispatch(setAppIsLoading(true));
                                    fetchConversation();
                                    dispatch(setAppIsLoading(false));
                                  })
                                  .catch((err) => console.log(err));
                              }}
                            >
                              <FiUserPlus
                                className="transition text-[--text-blue]"
                                size={25}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                    {/* //? show unban user btn to banned users*/}
                    {hasPermission && e.isBanned && (
                      <Tooltip title="Unban user">
                        <IconButton
                          color="error"
                          className="space-x-1"
                          onClick={() => {
                            dispatch(setAppIsLoading(true));

                            axios
                              .get(
                                `${
                                  import.meta.env.VITE_FETCHING_URL
                                }/chat/channels/${
                                  chatState.currentConversation.id
                                }/unban/${e.id}?adminId=${userInfoState.id}`
                              )
                              .then(() => {
                                fetchConversation();
                                dispatch(setAppIsLoading(false));
                              })
                              .catch((err) => console.log(err));
                          }}
                        >
                          <LuUndo2 size={25} />
                          <span className="text-base font-semibold truncate">
                            Unban User
                          </span>
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
