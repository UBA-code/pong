//? icons
import { IoCloseSharp } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";

import { Button, CircularProgress, Radio } from "@mui/material";
import { v4 as uuid4 } from "uuid";
import {
  reRenderConversationSelection,
  toggleCreateChannelWindow,
} from "../../../redux/slices/chatSlice";
import { ComponentProps, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../../../redux/store";
import { channelObj } from "../enums-interfaces/chatInterfaces";

export type channelType = "public" | "private" | "protected";

interface inputObj extends ComponentProps<"input"> {
  setValue: (value: string) => void;
  label: string;
  requiredType?: boolean | "none";
}

function InputField({
  label,
  requiredType = false,
  setValue,
  ...prop
}: inputObj) {
  const uniqueId = uuid4();

  return (
    <div className="inputFieldBox my-2 transition">
      <label htmlFor={uniqueId} className="title">
        {label}{" "}
        <span className="text-[--text-blue]">
          {requiredType === true
            ? "*"
            : requiredType === "none"
            ? ""
            : "(optional)"}
        </span>
      </label>
      <input
        className={`input-field block w-full border rounded-md transition border-[#3F3F3F] py-3 px-2 focus:outline-[--text-blue]`}
        id={uniqueId}
        type={prop.type}
        value={prop.value}
        accept={prop.accept}
        onChange={(e) => setValue(e.target.value)}
        required={requiredType === true ? true : false}
        maxLength={10}
      />
    </div>
  );
}

interface SwitcherProp {
  type: channelType;
  channelType: channelType;
  setChannelType: (type: channelType) => void;
  defaultChecked?: boolean;
}

function Switcher({ type, channelType, setChannelType }: SwitcherProp) {
  const uniqueId = uuid4();
  return (
    <div className="switcher flex items-center justify-between py-2">
      <label htmlFor={uniqueId} className="title select-none">
        {type}
      </label>
      <Radio
        className="scale-125"
        id={uniqueId}
        inputProps={{ "aria-label": "controlled" }}
        name="type"
        checked={type === channelType}
        onClick={() => setChannelType(type)}
      />
    </div>
  );
}

export default function CreateChannel({ userId }: { userId: number }) {
  const chatStats = useSelector((state: RootState) => state.chatStates);
  const [channelName, setChannelName] = useState(
    chatStats.createChannelWindowUpdate
      ? (chatStats.currentConversation as channelObj).name
      : ""
  );
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [channelType, setChannelType] = useState<channelType>(
    chatStats.createChannelWindowUpdate
      ? (chatStats.currentConversation as channelObj).type
      : "public"
  );
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  async function postNewChannelToApi() {
    const imageInput = document.querySelector(
      ".channel-avatar input[type='file']"
    ) as HTMLInputElement;
    const formData = new FormData();
    if (imageInput?.files && imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    formData.append("createdBy", `${userId}`);
    formData.append("name", channelName);
    formData.append("password", password);
    formData.append("type", channelType);
    formData.append(
      "id",
      `${
        chatStats.createChannelWindowUpdate
          ? chatStats.currentConversation.id
          : -1
      }`
    );

    if (
      (chatStats.createChannelWindowUpdate &&
        ((password.length && password === confirmedPassword) || !password)) ||
      (channelName.length &&
        (channelType !== "protected" ||
          (password?.length && password === confirmedPassword)) &&
        imageInput?.files![0])
    ) {
      setIsLoading(true);
      await axios
        .post(
          `${import.meta.env.VITE_FETCHING_URL}/chat/channels/create`,
          formData
        )
        .then(() => {
          dispatch(reRenderConversationSelection());
          dispatch(toggleCreateChannelWindow(false));
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (!chatStats.createChannelWindowUpdate && !channelName.length) {
      document
        .querySelector(".input-field:first-of-type")
        ?.classList.add("border-red-600");
    } else if (!chatStats.createChannelWindowUpdate && !imageInput?.files![0]) {
      document
        .querySelector(".channel-avatar input[type='file']")
        ?.classList.add("border-red-600");
    } else if (!password?.length || password !== confirmedPassword) {
      document
        .querySelectorAll(".input-field[type='password']")
        .forEach((e) => e.classList.add("border-red-600"));
    }
    setIsLoading(false);
  }

  return (
    <div className="create-channel-container absolute w-full h-full top-0 left-0 flex justify-center items-center rounded">
      <div
        className="box-bg absolute top-0 left-0 z-20 bg-[--trans-bg] w-full h-full rounded"
        onClick={() => dispatch(toggleCreateChannelWindow(false))}
      ></div>
      <div className="create-channel-box max-h-full overflow-y-auto transition bg-[--white-bg] py-4 px-3 md:py-6 md:px-5 rounded w-[90%] max-w-[700px] z-40">
        <div className="head transition text-[var(--text-blue)] flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Create Channel</h1>
          <motion.button
            className="close-window"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch(toggleCreateChannelWindow(false))}
          >
            <IoCloseSharp size={30} />
          </motion.button>
        </div>
        <div className="input-fields">
          <div className="channel-name">
            <InputField
              label="Channel name"
              type="text"
              value={channelName}
              setValue={setChannelName}
              requiredType
            />
          </div>
          <div className="channel-avatar">
            <InputField
              label="Channel avatar"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              setValue={() => {}}
              requiredType
            />
          </div>

          <Switcher
            type="public"
            channelType={channelType}
            setChannelType={setChannelType}
          />
          <Switcher
            type="protected"
            channelType={channelType}
            setChannelType={setChannelType}
          />
          <Switcher
            type="private"
            channelType={channelType}
            setChannelType={setChannelType}
          />
          <AnimatePresence>
            {channelType === "protected" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="password">
                  <InputField
                    label="Password"
                    type="password"
                    value={password}
                    setValue={setPassword}
                    requiredType={channelType === "protected" ? true : false}
                  />
                </div>
                <div className="confirmed-password">
                  <InputField
                    label="Confirm password"
                    type="password"
                    requiredType={password.length ? true : "none"}
                    value={confirmedPassword}
                    setValue={setConfirmedPassword}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="apply-cancel-buttons flex items-center justify-evenly my-10">
          <motion.div
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => dispatch(toggleCreateChannelWindow(false))}
          >
            <Button variant="outlined">Cancel</Button>
          </motion.div>
          <motion.div
            className="create-channel-btn"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={postNewChannelToApi}
          >
            {isLoading ? (
              <CircularProgress />
            ) : (
              <Button variant="contained">Create</Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
