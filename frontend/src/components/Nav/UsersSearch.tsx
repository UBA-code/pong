import { AnimatePresence, motion } from "framer-motion";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { v4 as uuid4 } from "uuid";

//? icons
import { HiUserAdd } from "react-icons/hi";
import { FaUserTimes } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa6";
import { MdOutlineMessage } from "react-icons/md";

import useFetch from "../../Helpers/Hooks/useFetch";
import { CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import axios from "axios";
import { changeNotificationAlertValue } from "../../redux/slices/notificationSlice";
import {
  reRenderConversationSelection,
  toggleConversationInfo,
} from "../../redux/slices/chatSlice";
import { useNavigate } from "react-router";
import useUpdateConversation from "../../Helpers/Hooks/useUpdateConversation";

interface usersObjects {
  avatar: string;
  displayname: string;
  username: string;
  isFriend: boolean;
  id: number;
  status: "FRIEND" | "PENDING" | "REQUESTED" | "NOT_FRIEND";
}

interface UsersSearchProp extends ComponentProps<"div"> {
  searchViewStatus: boolean;
  setSearchViewStatus: (params: any) => any;
}

export default function UsersSearch({
  searchViewStatus,
  setSearchViewStatus,
  ...prop
}: UsersSearchProp) {
  const navigate = useNavigate();
  const userInfoState = useSelector(
    (rootState: RootState) => rootState.userInfoState
  );
  const chatState = useSelector((rootState: RootState) => rootState.chatStates);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [finalSearchValue, setFinalSearchValue] = useState("");
  const { data, isLoading, refetch } = useFetch<usersObjects[]>(
    `http://${import.meta.env.VITE_BACKEND_HOST}:${
      import.meta.env.VITE_BACKEND_PORT
    }/user/search/${userInfoState.username}?search=${finalSearchValue}`
  );
  const [customLoading, setCustomLoading] = useState(false);
  const dispatch = useDispatch();
  const updateCurrentConversation = useUpdateConversation();

  const handleMethode = useCallback(
    (id: number, methode: string, message: string) => {
      axios
        .get(
          `${import.meta.env.VITE_FETCHING_URL}/user/friendships/${userInfoState.id}/${methode}/${id}`
        )
        .then(() => {
          dispatch(
            changeNotificationAlertValue({
              alertContent: message,
              color: "primary",
            })
          );
          refetch();
          if (chatState.conversationInfo_Status) {
            dispatch(toggleConversationInfo());
          }
          dispatch(reRenderConversationSelection());
        })
        .catch((err) => {
          console.log(`something wrong happened when ${message}`);
          console.log(err);
        });
    },
    [userInfoState]
  );

  useEffect(() => {
    setCustomLoading(true);
    const timeout = setTimeout(() => {
      setFinalSearchValue(searchInputValue);
      setCustomLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInputValue]);

  useEffect(() => {
    const searchUsersBox = document.querySelector(".search-users-box");

    function handleCLoseSearch(e: MouseEvent) {
      if (
        !searchUsersBox?.parentElement?.contains(e.target as HTMLElement) &&
        searchViewStatus
      ) {
        setSearchViewStatus(false);
      }
    }

    document.addEventListener("click", handleCLoseSearch);

    return () => {
      document.removeEventListener("click", handleCLoseSearch);
    };
  }, [searchViewStatus]);

  return (
    <AnimatePresence>
      {searchViewStatus && (
        <>
          <motion.div
            className={`search-users-box ${
              prop.className || ""
            } w-72 absolute top-12 sm:top-2 -right-[8.5rem] sm:right-10 cursor-auto z-[501]`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.input
              className="w-full text-black px-2 rounded font-semibold focus:outline-[--text-blue] focus:outline-none"
              type="text"
              onChange={(e) => setSearchInputValue(e.target.value)}
              value={searchInputValue}
              placeholder="Find User"
              autoFocus
            />
            <motion.div
              className={`search-result-box w-full min-h-16 max-h-72 overflow-y-auto bg-[--white-bg] rounded-md mt-5 relative shadow-md
              ${
                isLoading || customLoading
                  ? "flex justify-center items-center"
                  : ""
              }
              ${
                !isLoading && !customLoading && !searchInputValue.length
                  ? "hidden"
                  : "block"
              }
              `}
            >
              {isLoading || customLoading ? (
                <CircularProgress />
              ) : (
                <div className={`users space-y-2 p-2`}>
                  {!data?.length ? (
                    <div className={`text-[--text-blue] font-bold text-center`}>
                      No Users found
                    </div>
                  ) : (
                    data?.map((e) => (
                      <div
                        className="user bg-[--very-light-gray] p-2 rounded-md flex items-center text-[--text-blue] min-h-20"
                        key={uuid4()}
                      >
                        <img
                          className="user-avatar w-10 rounded-md cursor-pointer"
                          src={e.avatar}
                          alt="user avatar"
                          referrerPolicy="no-referrer"
                          onClick={() => navigate(`/profile/${e.username}`)}
                        />
                        <div
                          className="username ml-2 font-semibold text-md truncate max-w-[70%] mr-auto cursor-pointer"
                          onClick={() => navigate(`/profile/${e.username}`)}
                        >
                          {e.displayname}
                        </div>
                        {e.status === "FRIEND" ? (
                          <motion.button
                            className="icon ml-auto"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateCurrentConversation(e.username)
                            }
                          >
                            <MdOutlineMessage size={25} />
                          </motion.button>
                        ) : e.status === "PENDING" ? (
                          <motion.button
                            className="icon ml-auto"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleMethode(
                                e.id,
                                "remove",
                                "Friend Request Canceled"
                              )
                            }
                            title="Cancel Request"
                          >
                            <FaUserTimes size={25} />
                          </motion.button>
                        ) : e.status === "REQUESTED" ? (
                          <motion.button
                            className="icon ml-auto"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleMethode(
                                e.id,
                                "accept",
                                "Friend Request Accepted"
                              )
                            }
                            title="Accept Friend Request"
                          >
                            <FaUserCheck size={25} />
                          </motion.button>
                        ) : (
                          <motion.button
                            className="icon ml-auto"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleMethode(
                                e.id,
                                "add",
                                "Friend Request Sended"
                              )
                            }
                            title="Send Friend Request"
                          >
                            <HiUserAdd size={30} />
                          </motion.button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
