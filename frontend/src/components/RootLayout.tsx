import { Outlet } from "react-router-dom";
import { RootState } from "../redux/store";
import { useSelector, useDispatch } from "react-redux";
import {
  addNewNotificationToBox,
  toggleSideBar,
} from "../redux/slices/appSlice";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useContext, useEffect } from "react";
import {
  chatSocketContext,
  mainSocketContext,
} from "../Context/socketsContexts";
import useFetch from "../Helpers/Hooks/useFetch";
import { updateInfo } from "../redux/userInfoSlice";
import {
  emmitingObj,
  messageConversationObj,
  userObj,
} from "../interfaces/apiInterfaces";
import { v4 as uuid4 } from "uuid";

//* components
import Nav from "./Nav/Nav";
import SideBar from "./Sidebar/SideBar";
import NotificationSnackBar from "./notificationSnackBar/NotificationSnackBar";
import {
  changeNotificationAlertValue,
  changeNotificationDmValue,
} from "../redux/slices/notificationSlice";
import {
  appendMessage,
  reRenderConversationSelection,
  setIsTyping,
} from "../redux/slices/chatSlice";
import { CircularProgress } from "@mui/material";
import { channelObj, chatObj } from "./Chat/enums-interfaces/chatInterfaces";
import useFetchConversation from "../Helpers/Hooks/useFetchConversation";
import setColorVariables from "../Helpers/setColorVariables";
import { notificationBoxObj } from "./Nav/NotificationBox";
import { typingEvent } from "../interfaces/socketsInterfaces";

export default function RootLayout() {
  const { data: userInfoData, refetch } = useFetch<userObj>(
    `${import.meta.env.VITE_FETCHING_URL}/auth/whoami`
  );

  //* redux stats
  const appStats = useSelector((root: RootState) => root.appStates);
  const chatStats = useSelector((root: RootState) => root.chatStates);
  const userInfoState = useSelector((state: RootState) => state.userInfoState);
  const dispatch = useDispatch();

  const chatSocket = useContext(chatSocketContext);
  const mainSocket = useContext(mainSocketContext);

  const fetchConversation = useFetchConversation();

  const handleReceiveMessage = useCallback(
    (message: emmitingObj) => {
      const isChannel = "type" in chatStats.currentConversation;

      const messageToAppend = {
        message: message.content,
        avatar: message.avatar,
        from:
          message.sectionFrom === "channels"
            ? { avatar: message.senderAvatar, username: message.senderUserName }
            : message.redirect,
        to: message.sectionFrom === "channels" ? undefined : message.to,
        createdAt: "",
        messageId: isChannel ? message.id : undefined,
        id: isChannel ? undefined : message.id,
      };

      if (message.sectionFrom === chatStats.currentSectionValue) {
        dispatch(reRenderConversationSelection());
      }

      if (
        (isChannel &&
          (chatStats.currentConversation as channelObj).id ===
            message.redirect) ||
        (!isChannel &&
          (chatStats.currentConversation as chatObj).username ===
            message.redirect &&
          appStats.currentPage === "Chat")
      ) {
        dispatch(appendMessage(messageToAppend as messageConversationObj)); //! very danger move but i think it's safe cz i set to value or undefined
      } else {
        dispatch(
          changeNotificationDmValue({
            picture: message.avatar,
            title: message.title,
            content: message.content,
            redirect: message.redirect,
            sender: message.sender,
            color: "primary",
          })
        );
      }
    },
    [
      appStats.currentPage,
      chatStats.currentConversation,
      chatStats.currentSectionValue,
      dispatch,
    ]
  );

  const handleNotification = useCallback(
    (notifyContent: any) => {
      if (notifyContent) {
        if (
          appStats.currentPage === "Chat" &&
          chatStats.currentSectionValue === "channels" &&
          chatStats.currentConversation.id !== -1
        ) {
          fetchConversation();
        }
        dispatch(changeNotificationAlertValue(notifyContent));
      }
    },
    [
      appStats.currentPage,
      chatStats.currentConversation.id,
      chatStats.currentSectionValue,
    ]
  );

  const handleFriendRequest = useCallback(
    (e: notificationBoxObj) => {
      dispatch(addNewNotificationToBox({ ...e, id: uuid4() }));
    },
    [dispatch]
  );

  const handleRemoveCookie = useCallback((data) => {
    document.cookie =
      data.cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }, []);

  const handleTyping = useCallback(
    (data: typingEvent) => {
      if (
        chatStats.currentConversation.id === data.id &&
        appStats.currentPage === "Chat"
      ) {
        dispatch(setIsTyping(data.status));
      }
    },
    [dispatch, chatStats.currentConversation.id, appStats.currentPage]
  );

  document.title = appStats.currentPage;

  //? sockets events listenrs

  {
    //* messages
    chatSocket?.on("privateMessage", handleReceiveMessage);
    chatSocket?.on("channelMessage", handleReceiveMessage);
    chatSocket?.on("typing", handleTyping);
    mainSocket?.on("notification", handleNotification);
    mainSocket?.on("ljaras", handleFriendRequest);
    mainSocket?.on("deleteCookie", handleRemoveCookie);

    useEffect(() => {
      const htmlElement = document.querySelector("html");

      if (localStorage.getItem("theme") === "dark") {
        htmlElement?.classList.add("dark");
      } else {
        localStorage.setItem("theme", "light");
      }
      setColorVariables();
      return () => {
        chatSocket?.off("privateMessage", handleReceiveMessage);
        chatSocket?.off("channelMessage", handleReceiveMessage);
        chatSocket?.off("typing", handleTyping);
        mainSocket?.off("notification", handleNotification);
        mainSocket?.off("ljaras", handleFriendRequest);
        mainSocket?.off("deleteCookie", handleRemoveCookie);
      };
    });
  }

  useEffect(() => {
    userInfoData ? dispatch(updateInfo(userInfoData)) : "";
  }, [userInfoData, dispatch]);

  useEffect(() => {
    refetch().then((res) => {
      dispatch(updateInfo(res.data as userObj));
    });
  }, [userInfoState.reRefetchUserInfo]);

  return !userInfoData ? (
    <div className="w-screen h-screen flex items-center justify-center">
      <CircularProgress size={70} />
    </div>
  ) : (
    <motion.div className="root-layout overflow-hidden min-h-screen relative">
      <AnimatePresence>
        {appStats.appIsLoading && (
          <motion.div
            className="loading absolute w-full h-full z-[99999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="overlay-bg w-full h-full bg-[#00000023]"></div>
            <CircularProgress
              size={50}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <SideBar
        state={appStats.sideBarStatus}
        changeSideBarStatus={() => dispatch(toggleSideBar())}
      />
      <div
        className={`main-container transition-all px-2 sm:px-8 relative
        ${
          appStats.sideBarStatus
            ? "translate-x-[75%]\
          sm:translate-x-64 xl:w-[calc(100%-16rem)]"
            : "w-full"
        }`}
      >
        <Nav
          sideBarProp={{
            value: appStats.sideBarStatus,
            toggleSideBar: () => dispatch(toggleSideBar()),
          }}
          currentPage={appStats.currentPage}
        />
        <main className="mb-5">
          <Outlet />
        </main>
      </div>
      <NotificationSnackBar />
    </motion.div>
  );
}
