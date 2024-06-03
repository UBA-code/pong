//? icons
import { IoLogOut } from "react-icons/io5";
import Logo from "./Logo";
import SesctionLink from "./SectionLink";
import playIcon from "../../assets/sidebarAssets/play.png";
import leaderboardIcon from "../../assets/sidebarAssets/leaderboard.png";
import profileIcon from "../../assets/sidebarAssets/profile.png";
import chatIcon from "../../assets/sidebarAssets/chat.png";
import settingIcon from "../../assets/sidebarAssets/settings.png";
import view from "../../assets/sidebarAssets/View.png";
import hide from "../../assets/sidebarAssets/hide.png";

import "./styles/SideBar.css";
import Button from "../../Helpers/components/Button";
import { useCallback, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import axios from "axios";
import {
  chatSocketContext,
  mainSocketContext,
} from "../../Context/socketsContexts";

export type callbackType = () => void;

interface statusProp {
  state: boolean;
  changeSideBarStatus: callbackType;
}

export default function SideBar({ state, changeSideBarStatus }: statusProp) {
  const userInfoState = useSelector((state: RootState) => state.userInfoState);
  const navigate = useNavigate();
  const mainSocket = useContext(mainSocketContext);
  const chatSocket = useContext(chatSocketContext);

  useEffect(() => {
    const sideBar = document.querySelector(".sideBar-container") as HTMLElement;
    const sideBarBtnToggle = document.querySelector(
      ".side-bar-btn"
    ) as HTMLElement;

    const toggleSideBar = (e: Event) => {
      if (
        !sideBar.contains(e.target as HTMLElement) &&
        state &&
        !sideBarBtnToggle.contains(e.target as HTMLElement) &&
        checkScreenSize()
      )
        changeSideBarStatus();
    };
    const toggleSideBarWithEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state && checkScreenSize()) {
        changeSideBarStatus();
      }
    };

    // toggle sidebar only in mobile
    const checkScreenSize = () => {
      const media = window.matchMedia("(max-width: 768px)");

      if (media.matches) {
        return true;
      }
      return false;
    };

    document.addEventListener("click", toggleSideBar);
    document.addEventListener("keydown", toggleSideBarWithEscape);
    return () => {
      document.removeEventListener("click", toggleSideBar);
      document.removeEventListener("keydown", toggleSideBarWithEscape);
    };
  }, [state]);

  const logoutClick = useCallback(() => {
    axios
      .get(`${import.meta.env.VITE_FETCHING_URL}/auth/signout`)
      .then(() => {
        mainSocket?.disconnect();
        chatSocket?.disconnect();
        navigate("/login");
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div
      className={`fixed sideBar-container transition  bg-[var(--light-blue)]
						w-[75%] sm:max-w-64 h-screen z-50
						${state ? "-translate-x-0" : "-translate-x-[101%]"}
						`}
    >
      <div className="child-box overflow-y-auto h-full">
        <div className="box relative h-screen min-h-[680px] p-12">
          <Logo />
          <div className="sections mt-8 md:mt-12">
            <SesctionLink title="Play" Icon={playIcon} to="/play" />
            <SesctionLink
              title="Leaderboard"
              Icon={leaderboardIcon}
              to="/leaderboard"
            />
            <SesctionLink
              title="Profile"
              Icon={profileIcon}
              to={`/profile/${userInfoState.username}`}
            />
            <SesctionLink title="Chat" Icon={chatIcon} to="/chat" />
            <SesctionLink title="Settings" Icon={settingIcon} to="/settings" />
          </div>{" "}
          <motion.button
            className="btn absolute bottom-10 w-[calc(100%-6rem)]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              content="Logout"
              icon={<IoLogOut size={25} />}
              onclick={logoutClick}
            />
          </motion.button>
        </div>
      </div>
      <div
        className="toggle-sidebar-btn absolute -right-12 md:-right-16 bottom-5 bg-[var(--purple)]
							w-12 md:w-16 h-12 rounded-r-full flex items-center justify-center
							cursor-pointer hover:brightness-90 transition"
        onClick={() => changeSideBarStatus()}
      >
        <img
          className="w-6"
          src={state ? hide : view}
          alt="toggle sidebar"
          title={`${state ? "hide" : "show"} sideBar`}
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
