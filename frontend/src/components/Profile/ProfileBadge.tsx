import profilePic from "../../assets/ProfileAssets/profilePic.png";
import skill from "../../assets/ProfileAssets/skill.png";
import facebook from "../../assets/ProfileAssets/Facebook.png";
import twitter from "../../assets/ProfileAssets/twitter.png";
import humanBigPic from "../../assets/ProfileAssets/Human.png";
import { Skeleton } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import useFetch from "../../Helpers/Hooks/useFetch";
import { userObj } from "../../interfaces/apiInterfaces";
import { getCode } from "country-list";
import getUniCodeFlagIcon from "country-flag-icons/unicode";

//? icons
import { TiUserAdd } from "react-icons/ti";
import { MdMessage } from "react-icons/md";
import { FaUserMinus } from "react-icons/fa";
import { FaUserCheck } from "react-icons/fa";
import { RxLinkBreak2 } from "react-icons/rx";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import axios from "axios";
import useUpdateConversation from "../../Helpers/Hooks/useUpdateConversation";
import { setAppIsLoading } from "../../redux/slices/appSlice";
import { useState } from "react";
import FriendsRequestWindow from "./Friend Requests/FriendsRequestWindow";

export type friendshipStatus =
  | "FRIEND"
  | "PENDING"
  | "REQUESTED"
  | "NOT_FRIEND"
  | "BLOCKED"
  | "BLOCKED_BY_HIM";

export default function ProfileBadge({
  username,
}: {
  username: string | undefined;
}) {
  const changeConversation = useUpdateConversation();
  const userInfoState = useSelector((state: RootState) => state.userInfoState);
  const { data: friendshipStatus, refetch: reFetchFriendshipStatus } =
    useFetch<friendshipStatus>(
      `${import.meta.env.VITE_FETCHING_URL}/user/friendship/${
        userInfoState.username
      }/${username}`
    );

  const { data, isLoading } = useFetch<userObj>(
    `${import.meta.env.VITE_FETCHING_URL}/auth/whoami?username=${username}`
  );

  const dispatch = useDispatch();
  const [friendRequestWindowStatus, setFriendRequestWindowStatus] =
    useState(false);

  return (
    <div className="profile-badge-box w-full relative mx-auto text-[var(--text-blue)] xl:row-start-1 xl:row-end-4 min-h-[600px]">
      <div
        className="head p-box relative rounded-t bg-gradient-to-r from-[--wave-start] to-[--wave-end]
											flex flex-col justify-between h-[40%]"
      >
        <div className="profile-pic z-50">
          {isLoading ? (
            <Skeleton
              animation="wave"
              variant="circular"
              width={50}
              height={50}
            />
          ) : (
            <div className="flex items-center space-x-4">
              <img
                className="rounded-md rounded-tl-2xl rounded-br-2xl w-16"
                src={data?.avatar || profilePic}
                alt=""
                referrerPolicy="no-referrer"
              />
              {userInfoState.username !== username &&
                friendshipStatus !== "BLOCKED_BY_HIM" && (
                  <div className="methodes flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 1 }}
                      className={`add-friend-btn text-white ${
                        friendshipStatus &&
                        getBtnPropertys(friendshipStatus, "classname")
                      } py-1 px-3 rounded-full
                            flex items-center`}
                      onClick={() => {
                        let fetchEndPoint: string;
                        switch (friendshipStatus) {
                          case "NOT_FRIEND":
                          case "REQUESTED":
                            fetchEndPoint = "add";
                            break;
                          case "FRIEND":
                          case "PENDING":
                            fetchEndPoint = "remove";
                            break;
                          case "BLOCKED":
                            fetchEndPoint = "unblock";
                            break;
                          default:
                            fetchEndPoint = "";
                        }
                        dispatch(setAppIsLoading(true));
                        axios
                          .get(
                            `http://${import.meta.env.VITE_BACKEND_HOST}:${
                              import.meta.env.VITE_BACKEND_PORT
                            }/user/friendships/${
                              userInfoState.username
                            }/${fetchEndPoint}/${username}?byUsername=true`
                          )
                          .then(() => {
                            reFetchFriendshipStatus();
                            dispatch(setAppIsLoading(false));
                          })
                          .catch((err) => console.log(err));
                      }}
                    >
                      {friendshipStatus === "NOT_FRIEND" ? (
                        <TiUserAdd size={23} />
                      ) : friendshipStatus === "PENDING" ||
                        friendshipStatus === "FRIEND" ? (
                        <FaUserMinus size={23} />
                      ) : friendshipStatus === "REQUESTED" ? (
                        <FaUserCheck size={23} />
                      ) : (
                        <RxLinkBreak2 size={23} />
                      )}
                      <span className="text-md ml-1">
                        {friendshipStatus &&
                          getBtnPropertys(friendshipStatus, "btn value")}
                      </span>
                    </motion.button>
                    {friendshipStatus === "FRIEND" ? (
                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 1 }}
                        className="message-friend-btn text-[--light-periwinkle]"
                        onClick={() => {
                          changeConversation(username!);
                        }}
                      >
                        <MdMessage size={23} />
                      </motion.button>
                    ) : (
                      ""
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
        <div className="username my-3 text-3xl font-semibold text-white w-[60%] text-nowrap overflow-hidden overflow-ellipsis">
          {isLoading ? (
            <Skeleton animation="wave" width={100} />
          ) : (
            data?.displayname
          )}
        </div>
        {isLoading ? (
          <Skeleton animation="wave" width={100} />
        ) : (
          <div className="country flex items-center w-[220px] md:w-full">
            <div className="flag">
              <span>
                {data?.country.toLowerCase() === "palestine" ||
                data?.country.toLowerCase() === "israel"
                  ? "🇵🇸"
                  : getUniCodeFlagIcon(getCode(data?.country || "") || "XX")}
              </span>
            </div>
            <p className="pt-[3px] pl-3 text-white font-semibold truncate">
              {data?.country}
            </p>
          </div>
        )}
        <div className="badge-wave">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </div>
      <div className="body p-box rounded-b transition bg-[--white-bg] flex flex-col justify-between h-[60%]">
        <div className="skill-badges">
          <p className="font-bold">Skill Badge:</p>
          <div className="skills mb-2">
            {isLoading ? (
              <Skeleton animation="wave" width={50} />
            ) : (
              <img
                className="w-10"
                src={data?.rankAvatar}
                alt="skill badge"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
        <div className="informations font-bold text-sm tracking-wider">
          <div className="age">
            Age:{" "}
            {isLoading ? <Skeleton animation="wave" width={50} /> : data?.age}
          </div>
          <div className="sex">
            Sex:{" "}
            {isLoading ? <Skeleton animation="wave" width={50} /> : data?.sex}
          </div>
        </div>
        {isLoading ? (
          <Skeleton animation="wave" width={50} />
        ) : (
          <div className="social-media">
            <p className="font-bold text-sm tracking-wider my-4">
              Social Media
            </p>
            <div className="links flex items-center">
              {data?.x ? (
                <a href={data?.x} target="blank">
                  {" "}
                  <img
                    src={twitter}
                    alt="twitter icon"
                    title="twitter"
                    referrerPolicy="no-referrer"
                  />{" "}
                </a>
              ) : null}
              {data?.facebook ? (
                <a href={data?.facebook} target="blank">
                  <img
                    src={facebook}
                    alt="facebook icon"
                    title="facebook"
                    referrerPolicy="no-referrer"
                  />
                </a>
              ) : null}
            </div>
          </div>
        )}
        {userInfoState.username === username ? (
          <motion.button
            className="view-request-btn text-[--blue] font-bold my-5"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 1 }}
            onClick={() => setFriendRequestWindowStatus(true)}
          >
            view Friend Requests
          </motion.button>
        ) : (
          <></>
        )}
      </div>
      <motion.div
        className="badge-big-picture absolute top-[53%] -translate-y-[50%] -right-9"
        initial={{ x: "100vw", y: "-55%" }}
        animate={{ x: 0, y: "-55%" }}
        transition={{
          duration: 0.7,
          type: "spring",
          stiffness: 50,
          delay: 0.2,
        }}
      >
        <img
          className="select-none w-60 sm:w-full xl:scale-100"
          src={humanBigPic}
          alt="tennis"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <AnimatePresence>
        {friendRequestWindowStatus ? (
          <FriendsRequestWindow setStatus={setFriendRequestWindowStatus} />
        ) : (
          ""
        )}
      </AnimatePresence>
    </div>
  );
}

//? get values depending on the actual friendship status
function getBtnPropertys(
  friendshipStatus: friendshipStatus,
  type: "btn value" | "classname"
) {
  switch (friendshipStatus) {
    case "NOT_FRIEND":
      return type === "btn value" ? "Add Friend" : "bg-blue-500";
    case "FRIEND":
      return type === "btn value" ? "Delete Friend" : "bg-red-500";
    case "REQUESTED":
      return type === "btn value" ? "Accept Request" : "bg-green-500";
    case "PENDING":
      return type === "btn value" ? "Cancel Request" : "bg-gray-500";
    case "BLOCKED":
      return type === "btn value" ? "Unblock" : "bg-red-500";
    default:
      return "";
  }
}
