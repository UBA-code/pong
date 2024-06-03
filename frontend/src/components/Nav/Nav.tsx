import prrofileIcon from "../../assets/NavAssets/profile.png";
import NotificationBox from "./NotificationBox";
import "./css/Nav.css";
import { IconButton, Skeleton, Tooltip } from "@mui/material";
import Badge from "@mui/material/Badge";
import { AnimatePresence } from "framer-motion";
import { pagesNames, setAppTheme } from "../../redux/slices/appSlice";
import { NavLink, useNavigate } from "react-router-dom";

//? icons
import { IoMdSearch } from "react-icons/io";
import { BsSun } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { IoMdNotificationsOutline } from "react-icons/io";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsMoonStars } from "react-icons/bs";

//* hooks
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../redux/store";
import UsersSearch from "./UsersSearch";

import { motion } from "framer-motion";

interface sideBareState {
  value: boolean;
  toggleSideBar: () => void;
}

interface navProp {
  sideBarProp: sideBareState;
  currentPage: pagesNames;
}

export default function Nav({ sideBarProp, currentPage }: navProp) {
  const [notificationBoxStatus, setnotificationBoxStatus] = useState(false);
  const userInfoState = useSelector(
    (rootState: RootState) => rootState.userInfoState
  );
  const appStates = useSelector((rootState: RootState) => rootState.appStates);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchViewStatus, setSearchViewStatus] = useState(false);

  const toggleDark = useCallback(() => {
    const htmlElement = document.querySelector("html");

    if (localStorage.getItem("theme") === "dark") {
      localStorage.setItem("theme", "light");
    } else {
      localStorage.setItem("theme", "dark");
    }
    htmlElement?.classList.toggle("dark");
    dispatch(setAppTheme((localStorage.getItem("theme") as "dark" | "light")!));
  }, [dispatch]);

  return (
    <div className="nav-box py-5 sm:py-8 flex items-center justify-between">
      <div className="side-bar-toggle flex items-center w-[40%]">
        <Tooltip title="Toggle SideBar">
          <IconButton onClick={() => sideBarProp.toggleSideBar()}>
            <RxHamburgerMenu
              className="side-bar-btn transition text-[--nav-icons]"
              size={25}
            />
          </IconButton>
        </Tooltip>
        <div className="current-section text-xl sm:text-3xl sm:pl-4 font-bold transition text-[--text-blue] truncate">
          <p className="truncate">{currentPage}</p>
        </div>
      </div>
      <div className="shorts w-[60%] max-w-72 flex items-center justify-between">
        <>
          <div className="search cursor-pointer relative">
            <Tooltip title="Search">
              <IconButton
                onClick={() => setSearchViewStatus(!searchViewStatus)}
              >
                <IoMdSearch
                  className="transition text-[--nav-icons]"
                  size={25}
                />
              </IconButton>
            </Tooltip>
            <UsersSearch
              searchViewStatus={searchViewStatus}
              setSearchViewStatus={setSearchViewStatus}
            />
          </div>
          <AnimatePresence>
            {searchViewStatus && (
              <motion.div
                className="overlay-bg fixed w-screen h-full min-h-screen bg-[#00000059] z-[500] top-0 left-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              ></motion.div>
            )}
          </AnimatePresence>
        </>
        <Tooltip title="Switch Theme">
          <IconButton onClick={() => toggleDark()}>
            {appStates.theme === "light" ? (
              <AnimatePresence>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <BsMoonStars
                    className="transition text-[--nav-icons]"
                    size={22}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <BsSun className="transition text-[--nav-icons]" size={22} />
              </motion.div>
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton>
            <NavLink
              to={"/settings"}
              className="settings cursor-pointer transition hover:animate-spin "
            >
              <IoSettingsOutline
                size={22}
                className="transition text-[--nav-icons]"
              />
            </NavLink>
          </IconButton>
        </Tooltip>
        <div className="notification relative">
          <Tooltip title="Notification">
            <IconButton
              onClick={() => setnotificationBoxStatus(!notificationBoxStatus)}
            >
              <Badge
                badgeContent={appStates.notificationArr.length}
                color="primary"
              >
                <IoMdNotificationsOutline
                  className="transition text-[--nav-icons]"
                  size={23}
                />
              </Badge>
            </IconButton>
          </Tooltip>
          <AnimatePresence>
            {notificationBoxStatus && (
              <NotificationBox
                status={notificationBoxStatus}
                setStatus={setnotificationBoxStatus}
              />
            )}
          </AnimatePresence>
        </div>
        {userInfoState.id === -1 ? (
          <Skeleton animation="wave" width={30} height={50} />
        ) : (
          <Tooltip title="Profile">
            <IconButton
              className="w-8 min-w-8"
              onClick={() => navigate("/profile")}
            >
              <img
                className="rounded w-8 min-w-8"
                //* we add uuid4 here to prevent img caching in case of change avatar
                src={`${userInfoState.avatar}` || prrofileIcon}
                alt="Profile"
                title="Profile"
                referrerPolicy="no-referrer"
              />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
