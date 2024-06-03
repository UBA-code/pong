import { IconButton, Tooltip } from "@mui/material";
import { v4 as uuid4 } from "uuid";
import { useNavigate } from "react-router";
import { FriendsRequestObj } from "./FriendsRequestWindow";
import { motion } from "framer-motion";
//? icons
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

import { useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { setAppIsLoading } from "../../../redux/slices/appSlice";

export default function UserRequest({
  user,
  currentSection,
  refetch,
}: {
  user: FriendsRequestObj;
  currentSection: "Requests" | "Pending" | "Blocked";
  refetch: () => void;
}) {
  const userInfo = useSelector((state: RootState) => state.userInfoState);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleAction = useCallback(
    (username: string, type: "accept" | "remove" | "unblock") => {
      dispatch(setAppIsLoading(false));
      axios
        .get(
          `${import.meta.env.VITE_FETCHING_URL}/user/friendships/${
            userInfo.username
          }/${type}/${username}?byUsername=true`
        )
        .then(() => {
          dispatch(setAppIsLoading(false));
          refetch();
        })
        .catch((err) => console.log(err));
    },
    []
  );

  return (
    <motion.div
      className="user transition bg-blue-100 dark:bg-slate-700 rounded p-2 flex items-center justify-between"
      key={uuid4()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Tooltip title="Show Profile" arrow placement="right">
        <div
          className="user-info flex items-center space-x-2 md:space-x-4 cursor-pointer truncate"
          onClick={() => navigate(`/profile/${user.username}`)}
        >
          <div className="avatar min-w-14 size-14 md:size-20">
            <img className="rounded-md" src={user.avatar} alt="user avatar" />
          </div>
          <div className="user-name font-semibold transition text-xl truncate">
            {user.displayname}
          </div>
        </div>
      </Tooltip>
      <div className="actions-icons flex items-center md:space-x-4">
        {currentSection === "Requests" ? (
          <Tooltip title="Accept request">
            <IconButton onClick={() => handleAction(user.username, "accept")}>
              <FaCheck
                className="accept-btn transition text-teal-400"
                size={25}
              />
            </IconButton>
          </Tooltip>
        ) : (
          ""
        )}
        <Tooltip
          title={currentSection === "Blocked" ? "Unblock" : "Cancel request"}
        >
          <IconButton
            onClick={() =>
              handleAction(
                user.username,
                currentSection === "Blocked" ? "unblock" : "remove"
              )
            }
          >
            <FaXmark className="cancel-btn transition text-red-400" size={30} />
          </IconButton>
        </Tooltip>
      </div>
    </motion.div>
  );
}
