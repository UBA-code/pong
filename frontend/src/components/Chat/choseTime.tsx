import { ComponentProps, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTimingPicker } from "../../redux/slices/chatSlice";
import { RootState } from "../../redux/store";
import { motion } from "framer-motion";

//? icons
import { TbInfinity } from "react-icons/tb";
import axios from "axios";
import useFetchConversation from "../../Helpers/Hooks/useFetchConversation";

interface timingPickerProb extends ComponentProps<"div"> {}

export default function TimingPicker({ ...prop }: timingPickerProb) {
  const chatState = useSelector((state: RootState) => state.chatStates);
  const userInfoState = useSelector((state: RootState) => state.userInfoState);
  const dispatch = useDispatch();
  const fetchConversation = useFetchConversation();
  const handleSubmit = useCallback(() => {
    const selectedAmountInput = document.querySelector(
      ".suggestion:checked"
    ) as HTMLInputElement;
    const amount = selectedAmountInput.getAttribute("data-amount");

    dispatch(toggleTimingPicker());
    axios
      .get(
        `http://${import.meta.env.VITE_BACKEND_HOST}:${
          import.meta.env.VITE_BACKEND_PORT
        }/chat/channels/${chatState.currentConversation.id}/mute/${
          chatState.muteTargetId
        }?adminId=${userInfoState.id}&time=${amount}`
      )
      .then(() => {
        fetchConversation();
      })
      .catch((err) => console.log(err));
  }, [
    chatState.currentChannelSelectedUser,
    chatState.currentConversation,
    chatState.muteTargetId,
  ]);

  return (
    <motion.div
      className={`timing-picker-container ${prop.className}
            absolute w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded
            flex justify-center items-center`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="black-bg absolute w-full h-full bg-[#0000003d] rounded z-[40]"
        onClick={() => dispatch(toggleTimingPicker())}
      ></div>
      <div className="timing-picker-box relative transition bg-[--white-bg] z-[45] rounded-md w-[80%] max-w-96 py-4 text-[--text-blue] font-medium">
        <div className="title text-center text-xl transition text-[--text-blue] font-semibold">
          Mute
        </div>
        <div className="input-fields flex justify-around my-6">
          <div className="input-field flex flex-col">
            <label htmlFor="suggestion1" className="cursor-pointer">
              5m
            </label>
            <input
              className="suggestion"
              data-amount="300"
              type="radio"
              id="suggestion1"
              name="suggestion"
              defaultChecked
            />
          </div>
          <div className="input-field flex flex-col">
            <label htmlFor="suggestion2" className="cursor-pointer">
              15m
            </label>
            <input
              className="suggestion"
              data-amount="900"
              type="radio"
              id="suggestion2"
              name="suggestion"
            />
          </div>
          <div className="input-field flex flex-col">
            <label htmlFor="suggestion3" className="cursor-pointer">
              1h
            </label>
            <input
              className="suggestion"
              data-amount="3600"
              type="radio"
              id="suggestion3"
              name="suggestion"
            />
          </div>
          <div className="input-field flex flex-col">
            <label htmlFor="suggestion4" className="cursor-pointer">
              1d
            </label>
            <input
              className="suggestion"
              data-amount="86400"
              type="radio"
              id="suggestion4"
              name="suggestion"
            />
          </div>
          <div className="input-field flex flex-col">
            <label htmlFor="suggestion5" className="cursor-pointer">
              <TbInfinity size={25} />
            </label>
            <input
              className="suggestion"
              data-amount="-1"
              type="radio"
              id="suggestion5"
              name="suggestion"
            />
          </div>
        </div>
        <div className="performe-btn text-center mt-4">
          <motion.button
            className="bg-red-500 text-white rounded py-2 px-4"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSubmit}
          >
            Mute
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
