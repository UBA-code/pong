import { useDispatch } from "react-redux";
import {
  notificationObj,
  toggleNotificationViewStatus,
} from "../../redux/slices/notificationSlice";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import useUpdateConversation from "../../Helpers/Hooks/useUpdateConversation";

interface conversationNotificationProp {
  notificationStats: notificationObj;
}

export default function ConversationNotification({
  notificationStats,
}: conversationNotificationProp) {
  const dispatch = useDispatch();
  const setCurrentConversation = useUpdateConversation();

  return (
    <>
      <div
        className="notification-info flex items-center space-x-2 truncate cursor-pointer"
        onClick={() => {
          dispatch(toggleNotificationViewStatus(false));
          setCurrentConversation(notificationStats.redirect!);
        }}
      >
        <img
          className="w-10 rounded"
          src={notificationStats.picture}
          alt="user picture"
          referrerPolicy="no-referrer"
        />
        <div className="truncate">
          <div className="text-lg font-bold text---text-blue-const] truncate">
            {notificationStats.title}
          </div>
          <div className="font-semibold truncate text-[--text-blue-const]">
            <span className="text-bold text-indigo-950">
              {notificationStats.sender ? `${notificationStats.sender} : ` : ""}
            </span>
            <span className="text-base text-sky-900">
              {notificationStats.content}
            </span>
          </div>
        </div>
      </div>
      <motion.div
        className="close-notification cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => dispatch(toggleNotificationViewStatus(false))}
      >
        <IoClose size={30} />
      </motion.div>
    </>
  );
}
