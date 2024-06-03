import {
  CircularProgress,
  IconButton,
  Tab,
  Tabs,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import Input from "@mui/joy/Input";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { createTheme } from "@mui/material/styles";
import { v4 as uuid4 } from "uuid";
import { AnimatePresence, motion } from "framer-motion";
import "./css/Chat.css";

//? incons
import { FaPlusCircle } from "react-icons/fa";

// ? interfaces
import {
  channelObj,
  chatObj,
  sectionType,
} from "./enums-interfaces/chatInterfaces";

// * components
import ConversationSelection from "./ConversationSelection";
import SelectedChat from "./SelectedChat/SelectedChat";
import CreateChannel from "./SelectedChat/CreateChannel";
import ChannelUsersDialog from "../../Helpers/components/channelUsersDialog";

//? hooks
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useState } from "react";
import useFetch from "../../Helpers/Hooks/useFetch";

//? redux
import { RootState } from "../../redux/store";
import {
  changeCurrentSectionValue,
  resetCurrentConversation,
  toggleChanellUsersWindow,
  toggleCreateChannelWindow,
} from "../../redux/slices/chatSlice";

import { setCurrentPage } from "../../redux/slices/appSlice";
import { animtedRoutesVariants } from "../../Helpers/motionVariants";
import TimingPicker from "./choseTime";

//! component begining
export default function Chat() {
  const [searchValue, setSearchValue] = useState("");
  const useInfoState = useSelector(
    (rootState: RootState) => rootState.userInfoState
  );
  const chatStats = useSelector((root: RootState) => root.chatStates);
  const appStats = useSelector((root: RootState) => root.appStates);
  const fetchingUrl =
    chatStats.currentSectionValue === "messages"
      ? `${import.meta.env.VITE_FETCHING_URL}/user/friendships/${
          useInfoState.id
        }` //? fetching users chat
      : chatStats.currentSectionValue === "channels"
      ? `${import.meta.env.VITE_FETCHING_URL}/user/joined-channels/${
          useInfoState.id
        }` //? fetching channels
      : `${import.meta.env.VITE_FETCHING_URL}/user/non-joined-channels/${
          useInfoState.id
        }`; //? fetching public an protected channels

  const { data, isLoading, refetch } =
    useFetch<(chatObj | channelObj)[]>(fetchingUrl);

  const filterDataWithSearch = useCallback(
    (data: (channelObj | chatObj)[] | undefined) => {
      let newArr: (channelObj | chatObj)[] | undefined;

      if (!searchValue.length || !data) {
        newArr = data ? [...data] : undefined;
      }

      newArr = data?.filter((e) => {
        if ("type" in e) {
          return (e as channelObj).name.includes(searchValue);
        } else {
          return (e as chatObj).displayname.includes(searchValue);
        }
      });
      return newArr;
    },
    [searchValue]
  );

  const visibleConversations = useMemo(
    () => filterDataWithSearch(data),
    [searchValue, data]
  );

  const dispatch = useDispatch();

  const theme = createTheme({
    palette: {
      primary: {
        main: appStats.theme === "light" ? "#3C3F88" : "#fff",
      },
    },
  });

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: sectionType
  ) => {
    //? reset the current conversation to empty for printing 'select conversation to start texting'
    setSearchValue("");
    dispatch(resetCurrentConversation());
    dispatch(changeCurrentSectionValue(newValue));
  };

  //? refetch the friendships in case of new message received
  useEffect(() => {
    refetch();
  }, [chatStats.reRenderConversationSelection]);

  useEffect(() => {
    dispatch(setCurrentPage("Chat"));
  }, [dispatch]);


  return (
    <motion.div
      className="chat-box overflow-hidden h-[calc(100vh-7rem)] min-h-[29rem] md:h-[calc(100vh-11rem)]"
      variants={animtedRoutesVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      <div className="chat-container relative h-full xl:flex">
        <div
          className={`conversations-selectors transition bg-[--light-purple] relative
            rounded xl:rounded-r-none px-4 py-3 xl:w-[25%] h-full`}
        >
          <div className="chat-chanel-switcher h-12 flex items-center justify-between">
            <ThemeProvider theme={theme}>
              <Tabs
                sx={{
                  ".MuiTab-root:not(.Mui-selected)": {
                    color: appStats.theme === "light" ? "#3C3F88" : "#fff",
                  },
                }}
                value={chatStats.currentSectionValue}
                onChange={handleChange}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab value="messages" label="Messages" />
                <Tab value="channels" label="Channels" />
                <Tab value="Others" label="Others" />
              </Tabs>
            </ThemeProvider>{" "}
            {chatStats.currentSectionValue === "channels" && (
              <div className="create-channel transition absolute bottom-5 right-5 bg-slate-200 dark:bg-slate-600 rounded-full">
                <Tooltip title="Create Channel">
                  <IconButton
                    onClick={() => {
                      dispatch(toggleCreateChannelWindow(false)); // false mean create new channel instead of update existing one
                    }}
                  >
                    <FaPlusCircle
                      className="text-[var(--text-blue)]"
                      size={35}
                    />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </div>
          <div className="search-box mt-4 relative overflow-hidden h-14">
            <Input
              className=" py-2"
              value={searchValue}
              startDecorator={<ManageSearchIcon />}
              placeholder={`Search ${chatStats.currentSectionValue}`}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>
          <div className="conversations my-4 h-[calc(100%-8rem)] overflow-y-auto">
            {isLoading ? (
              <div className="loading h-full w-full flex justify-center items-center">
                <CircularProgress />
              </div>
            ) : !visibleConversations?.length ? (
              <div className="no-conversation h-full flex items-center justify-center text-center text-xl font-semibold text-[--text-blue]">
                No conversations found
              </div>
            ) : (
              visibleConversations?.map((e) => (
                <ConversationSelection conversation={e} key={uuid4()} />
              ))
            )}
          </div>
        </div>

        <div
          className={`main-conversation h-full transition bg-[--white-bg] w-full xl:w-[75%] rounded xl:rounded-l-none
                absolute top-0 left-0 xl:left-[25%] xl:static ${
                  chatStats.conversationDisplay_Status
                    ? "translate-x-0"
                    : "translate-x-[101%] xl:translate-x-0"
                }`}
        >
          {(chatStats.currentConversation.id &&
            chatStats.currentConversation.id !== -1) ||
          chatStats.conversationIsLoading ? (
            <SelectedChat
              currentSection={chatStats.currentSectionValue}
              chatStats={chatStats}
            />
          ) : (
            <div className="empty-conversation w-full h-full flex items-center justify-center font-semibold text-xl text-[--text-blue]">
              Select Conversation to start Texting
            </div>
          )}
        </div>
        {/* //* some dialog boxes */}
        <AnimatePresence>
          {chatStats.createChannelWindow_Status && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CreateChannel userId={useInfoState.id} />
            </motion.div>
          )}
          {chatStats.channelUsersWindow &&
          (chatStats.currentConversation as channelObj).users ? (
            <ChannelUsersDialog
              onClick={() => dispatch(toggleChanellUsersWindow())}
            />
          ) : (
            ""
          )}
        </AnimatePresence>
        <AnimatePresence>
          {chatStats.timingPickerStatus && <TimingPicker />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
