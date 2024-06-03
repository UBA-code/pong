import { StatusColors } from "../../Chat/enums-interfaces/chatInterfaces";
import { v4 as uuid4 } from "uuid";
import { motion } from "framer-motion";
//? icons
import { IoGameControllerOutline } from "react-icons/io5";
import { TbMessageDots } from "react-icons/tb";
import useFetch from "../../../Helpers/Hooks/useFetch";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { userObj } from "../../../interfaces/apiInterfaces";
import useUpdateConversation from "../../../Helpers/Hooks/useUpdateConversation";
import axios from "axios";
import { changeNotificationAlertValue } from "../../../redux/slices/notificationSlice";

function UserBox({
  data,
  switchConversationCallback,
}: {
  data: userObj;
  switchConversationCallback: () => void;
}) {
  const dispatch = useDispatch();
  return (
    <div className="user-box transition bg-[--light-periwinkle] px-2 py-3 rounded flex items-center">
      <div className="avatar">
        <img
          className="w-11 min-w-11 rounded-md"
          src={data.avatar}
          alt="user avatar"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="username-and-status ml-2 truncate">
        <div className="username transition text-[--text-blue] font-bold truncate">
          {data.displayname}
        </div>
        <div className="status flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-[2px]"
            style={{ backgroundColor: StatusColors[data.status] }}
          ></div>
          <div className="text-xs font-semibold text-slate-600">
            {data.status}
          </div>
        </div>
      </div>
      <div className="actions ml-auto flex items-center space-x-2 transition text-[--text-blue]">
        {data.status === "online" && (
          <motion.button
            className="play-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              axios
                .post(`${import.meta.env.VITE_FETCHING_URL}/game/invite`, {
                  username: data.username,
                  id: data.id,
                })
                .then(() => {
                  dispatch(
                    changeNotificationAlertValue({
                      alertContent: `Invitation sent to ${data.displayname}`,
                      color: "success",
                    })
                  );
                })
                .catch((err) => console.error(err));
            }}
          >
            <IoGameControllerOutline size={30} />
          </motion.button>
        )}
        <motion.button
          className="message-icon"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={switchConversationCallback}
        >
          <TbMessageDots size={30} />
        </motion.button>
      </div>
    </div>
  );
}

export default function Friends() {
  const setCurrentConversation = useUpdateConversation();

  const userInfoState = useSelector((state: RootState) => state.userInfoState);
  const { data } = useFetch<userObj[]>(
    `${import.meta.env.VITE_FETCHING_URL}/user/friendships/${userInfoState.id}`
  );
  return (
    <div className="friends-section section-box col-start-2 col-end-3 row-start-1 row-end-3">
      <div className="section-box-title box-title">Friends</div>
      <div className="box-content px-2 py-4 my-2 space-y-2 h-[calc(100%-7rem)] max-h-[800px] overflow-y-auto">
        {data?.length ? (
          data?.map((e) => (
            <UserBox
              key={uuid4()}
              data={e}
              switchConversationCallback={() =>
                setCurrentConversation(e.username)
              }
            />
          ))
        ) : (
          <span className="transition block text-[--text-blue] font-semibold text-center">
            You haven't add any friends yet
          </span>
        )}
      </div>
    </div>
  );
}
