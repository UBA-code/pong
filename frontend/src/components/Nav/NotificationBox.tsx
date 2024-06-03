import { v4 as uuid4 } from "uuid";
import closeBtn from "../../assets/NavAssets/close.png";
import addIcon from "../../assets/NavAssets/add.png";
import acceptIcon from "../../assets/NavAssets/accept.png";
import chatIcon from "../../assets/NavAssets/chat.png";
import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import axios from "axios";
import {
  setAppIsLoading,
  setGameInvite,
  setGameSettings,
  updateNotificationBox,
} from "../../redux/slices/appSlice";
import { useNavigate } from "react-router";

export interface notificationBoxObj {
  username: string;
  displayname: string;
  type: string;
  avatar: string;
  message: string;
  id: string;
  targetId: number | null;
  targetUsername: string | null;
}

interface Obj {
  status: boolean;
  setStatus: (param: boolean) => void;
}

export default function NotificationBox({ status, setStatus }: Obj) {
  const navigate = useNavigate();
  const appStates = useSelector((state: RootState) => state.appStates);
  const userInfoStates = useSelector((state: RootState) => state.userInfoState);
  const dispatch = useDispatch();
  const removeNotification = useCallback(
    (notify: notificationBoxObj) => {
      const newArr = appStates.notificationArr.filter(
        (e) =>
          !(
            e.type === notify.type &&
            e.displayname === notify.displayname &&
            e.message === notify.message
          )
      );

      dispatch(updateNotificationBox(newArr));
    },
    [appStates.notificationArr, dispatch]
  );

  // close notifyBox when click anywhere or with pressing at enter
  useEffect(() => {
    const notifyBox = document.querySelector(".notificationBox") as HTMLElement;
    const notificationIcon = document.querySelector(
      ".notification"
    ) as HTMLElement;

    const toggle = (e: Event) => {
      if (
        status &&
        !notifyBox?.contains(e.target as HTMLElement) &&
        !notificationIcon?.contains(e.target as HTMLElement) &&
        document.contains(e.target as HTMLElement)
      )
        setStatus(!status);
    };

    document.addEventListener("click", toggle);

    // cleanup
    return () => {
      document.removeEventListener("click", toggle);
    };
  }, [status]);

  return (
    <motion.div
      className={`notificationBox absolute top-full translate-y-5 right-full
                    translate-x-10 w-64 sm:w-80 h-52 rounded bg-[--white-bg] z-[100] py-1`}
      initial={{ scale: 0, translateX: "2.5rem", translateY: "1.25rem" }}
      animate={{ scale: 1, translateX: "2.5rem", translateY: "1.25rem" }}
      exit={{ scale: 0, transition: { type: "tween", duration: 0.1 } }}
    >
      <div className="notify-container overflow-y-auto h-full px-2 shadow-2xl">
        {appStates.notificationArr.length ? (
          appStates.notificationArr.map((e) => {
            return (
              <div
                className="notify w-full bg-[var(--very-light-gray)] my-2 px-2 py-3 rounded flex items-center"
                key={e.id}
              >
                <div
                  className="avatar w-16 aspect-square cursor-pointer"
                  onClick={() => navigate(`/profile/${e.username}`)}
                >
                  <img
                    className="w-12 min-w-10 rounded"
                    src={e.avatar}
                    alt="profile icon"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="username-type mr-auto px-3 w-full">
                  <div
                    className="username font-bold text-sm text-[var(--text-blue)] cursor-pointer"
                    onClick={() => navigate(`/profile/${e.username}`)}
                  >
                    {e.displayname}
                  </div>
                  <div className="notify-body text-xs text-[var(--light-gray)] font-semibold text-center">
                    {e.type === "message" ? e.message : e.type}
                  </div>
                </div>
                <div className={`methodes flex items-center`}>
                  <motion.div
                    className={`add-accept cursor-pointer`}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 1 }}
                    onClick={async () => {
                      if (
                        e.type === "Game invite" ||
                        e.type === "Game invite accepted"
                      ) {
                        removeNotification(e);
                        if (e.type === "Game invite") {
                          try {
                            await axios.post(
                              `${
                                import.meta.env.VITE_FETCHING_URL
                              }/game/accept`,
                              { id: e.targetId, username: e.username }
                            );
                          } catch (error) {
                            console.log(error);
                          }
                        }
                        dispatch(setGameSettings(null));
                        dispatch(
                          setGameInvite({
                            targetId: e.targetId!,
                            targetUsername: e.targetUsername!,
                            myId: userInfoStates.id,
                            myUsername: userInfoStates.username,
                          })
                        );
                        navigate(`/game`);
                        return;
                      }
                      dispatch(setAppIsLoading(true));
                      axios
                        .get(
                          `${
                            import.meta.env.VITE_FETCHING_URL
                          }/user/friendships/${userInfoStates.username}/add/${
                            e.username
                          }?byUsername=true`
                        )
                        .then(() => {
                          dispatch(setAppIsLoading(false));
                          removeNotification(e);
                        });
                    }}
                  >
                    <img
                      className="w-10 aspect-square"
                      src={
                        e.type === "message"
                          ? chatIcon
                          : e.type === "friend request"
                          ? addIcon
                          : acceptIcon
                      }
                      alt="add icon"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  <motion.div
                    className="close-notify ml-2 cursor-pointer"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 1 }}
                    onClick={() => removeNotification(e)}
                  >
                    <img
                      className="w-8 aspect-square"
                      src={closeBtn}
                      alt="close btn"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </div>
              </div>
            );
          })
        ) : (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl text-[--text-blue] text-center">
            no notifications found
          </span>
        )}
      </div>
    </motion.div>
  );
}
