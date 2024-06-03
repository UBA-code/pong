import { motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { IoIosSend } from "react-icons/io";

// ? enums
import { messageInputProp } from "../enums-interfaces/chatInterfaces";
import { chatSocketContext } from "../../../Context/socketsContexts";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { typingEvent } from "../../../interfaces/socketsInterfaces";

export default function MessageInput({ callback }: messageInputProp) {
  const userInfoState = useSelector(
    (rootState: RootState) => rootState.userInfoState
  );
  const chatStates = useSelector(
    (rootState: RootState) => rootState.chatStates
  );
  const [message, setMessage] = useState("");
  const chatSocket = useContext(chatSocketContext);
  const timeOutReturn = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        message.length > 0 && message.length <= 250 ? callback(message) : "";
        setMessage("");
      }
    };
    window.addEventListener("keypress", handleEnter);
    return () => {
      window.removeEventListener("keypress", handleEnter);
    };
  });

  return (
    <div className="typing-input-box flex items-center w-full min-h-14 justify-between border border-sky-500 rounded overflow-hidden">
      <input
        className="w-full py-3 pl-4 focus:outline-none transition text-[--white-text] bg-[--white-bg]"
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => {
          if (chatStates.currentSectionValue === "messages") {
            if (timeOutReturn.current) clearTimeout(timeOutReturn.current);
            chatSocket?.emit("typing", {
              id: userInfoState.id,
              to: chatStates.currentConversation.id,
              status: true,
            } as typingEvent);
            timeOutReturn.current = setTimeout(() => {
              chatSocket?.emit("typing", {
                id: userInfoState.id,
                to: chatStates.currentConversation.id,
                status: false,
              } as typingEvent);
            }, 2000);
          }
          setMessage(e.target.value);
        }}
        maxLength={250}
      />
      <motion.button
        className=""
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          message.length ? callback(message) : "";
          setMessage("");
        }}
      >
        <div className="send-icon py-2 px-3 cursor-pointer">
          <IoIosSend className="text-[var(--blue)]" size={30} />
        </div>
      </motion.button>
    </div>
  );
}
