import { motion } from "framer-motion";
import { v4 as uuid4 } from "uuid";

//? icons
import { IconButton, Tab, Tabs, Tooltip } from "@mui/material";
import { IoClose } from "react-icons/io5";

import useFetch from "../../../Helpers/Hooks/useFetch";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import UserRequest from "./UserRequest";

interface FriendsRequestWindowProps {
  setStatus: (arg: any) => void;
}

export interface FriendsRequestObj {
  displayname: string;
  username: string;
  avatar: string;
}

export default function FriendsRequestWindow({
  setStatus,
}: FriendsRequestWindowProps) {
  const appStats = useSelector((state: RootState) => state.appStates);
  const [currentSection, setCurrentSection] = useState<
    "Requests" | "Pending" | "Blocked"
  >("Requests");
  const { data, refetch } = useFetch<FriendsRequestObj[]>(
    `${import.meta.env.VITE_FETCHING_URL}/user/${
      currentSection === "Pending"
        ? "sent/requests"
        : currentSection === "Requests"
        ? "waiting/approuval"
        : "blocked"
    }`
  );
  const handleChange = useCallback(
    (
      event: React.SyntheticEvent,
      newValue: "Requests" | "Pending" | "Blocked"
    ) => {
      setCurrentSection(newValue);
      refetch();
    },
    []
  );

  return (
    <motion.div
      className="friend-request-window fixed top-0 left-0 w-full h-screen z-[500]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="bg-overlay fixed top-0 left-0 w-full min-h-screen h-full bg-[--trans-bg]"
        onClick={() => setStatus(false)}
      ></div>
      <div
        className="content-box overflow-y-auto absolute w-[90%] h-[90%]
        top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition bg-[--white-bg] rounded
        py-4 px-2 md:px-6
        "
      >
        <div className="head flex items-center justify-between">
          <div className="title text-2xl font-semibold">
            {currentSection === "Requests"
              ? "Friend Requests"
              : currentSection === "Pending"
              ? "Pending Requests"
              : currentSection === "Blocked"
              ? "Blocked Users"
              : ""}
          </div>
          <Tooltip title="Close">
            <IconButton onClick={() => setStatus(false)}>
              <IoClose className="transition text-[--text-blue]" size={35} />
            </IconButton>
          </Tooltip>
        </div>
        <div className="tabs mb-3">
          <Tabs
            sx={{
              ".MuiTab-root:not(.Mui-selected)": {
                color: appStats.theme === "light" ? "#3C3F88" : "#fff",
              },
            }}
            value={currentSection}
            onChange={handleChange}
          >
            <Tab value={"Requests"} label="Requests" />
            <Tab value={"Pending"} label="Pending" />
            <Tab value={"Blocked"} label="Blocked" />
          </Tabs>
        </div>
        <div className="body space-y-4">
          {data?.length ? (
            data?.map((e) => (
              <UserRequest
                refetch={refetch}
                currentSection={currentSection}
                key={uuid4()}
                user={e}
              />
            ))
          ) : (
            <div className=" text-xl text-center font-semibold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {currentSection === "Requests"
                ? "No friend requests"
                : currentSection === "Pending"
                ? "No pending requests"
                : "No blocked users"}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
