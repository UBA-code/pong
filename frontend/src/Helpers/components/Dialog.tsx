import { Button, ThemeProvider, createTheme } from "@mui/material";
import { ComponentProps, useCallback } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { motion } from "framer-motion";
import {
  dialogTypes,
  reRenderConversationSelection,
  toggleDialog,
} from "../../redux/slices/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import axios from "axios";
import {
  SnackbarColor,
  changeNotificationAlertValue,
} from "../../redux/slices/notificationSlice";

enum colorTheme {
  Normal = "#3C3F88",
  Warning = "#FFC107",
  Danger = "#DC3545",
  Safe = "#28A745",
}

interface DialogProps extends ComponentProps<"div"> {
  type?: dialogTypes;
  textContent: string;
  processBtnValue?: string;
  title: string;
}

export default function Dialog({
  type = "Normal",
  textContent,
  processBtnValue = "Process",
  title,
}: DialogProps) {
  const chatStats = useSelector((state: RootState) => state.chatStates);
  const dispatch = useDispatch();

  const theme = createTheme({
    palette: {
      primary: {
        main: colorTheme[type],
      },
      secondary: {
        main: colorTheme.Safe,
      },
      info: {
        main: "#3C3F88",
      },
    },
  });

  const handleMethode = useCallback(
    (endpoint: string, alertString: string, alertColor: SnackbarColor) => {
      axios
        .get(`${import.meta.env.VITE_FETCHING_URL}${endpoint}`)
        .then(() => {
          dispatch(
            changeNotificationAlertValue({
              alertContent: alertString,
              color: alertColor,
            })
          );
          dispatch(reRenderConversationSelection());
          dispatch(toggleDialog({ ...chatStats.chatDialog, visible: false }));
        })
        .catch((err) => {
          console.log(`something goes wrong when try to fetch ${endpoint}`);
          console.log(err);
        });
    },
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ThemeProvider theme={theme}>
          <div
            className={`dialog-container absolute h-full w-full top-0 left-0 flex flex-col items-center justify-center`}
          >
            <div
              className="close-bg absolute top-0 left-0 w-full h-full bg-[var(--trans-bg)] z-40 rounded"
              onClick={() =>
                dispatch(
                  toggleDialog({ ...chatStats.chatDialog, visible: false })
                )
              }
            ></div>
            <div className="dialog-box bg-[--white-bg] z-50 w-[90%] max-w-[650px] rounded px-6 py-4">
              <div className="head flex items-center justify-between">
                <div className="title text-2xl font-bold text-[var(--text-blue)]">
                  {title}
                </div>
                <motion.div
                  className="close-btn cursor-pointer text-[var(--text-blue)]"
                  onClick={() =>
                    dispatch(
                      toggleDialog({ ...chatStats.chatDialog, visible: false })
                    )
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IoCloseSharp size={30} />
                </motion.div>
              </div>
              <div
                className={`box-content my-8 font-bold text-lg text-center`}
                style={{ color: colorTheme[type] }}
              >
                {textContent}
              </div>
              <div className="methodes-btn flex items-center justify-evenly">
                <div
                  className="cancel-btn"
                  onClick={() =>
                    dispatch(
                      toggleDialog({ ...chatStats.chatDialog, visible: false })
                    )
                  }
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Button color="info" variant="outlined">
                      Cancel
                    </Button>
                  </motion.div>
                </div>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Button
                    variant="contained"
                    onClick={() =>
                      handleMethode(
                        chatStats.chatDialog.endpoint,
                        chatStats.chatDialog.alertContent,
                        chatStats.chatDialog.alertColor
                      )
                    }
                  >
                    {processBtnValue}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </motion.div>
    </ThemeProvider>
  );
}
