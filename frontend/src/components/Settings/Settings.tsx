import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAppIsLoading, setCurrentPage } from "../../redux/slices/appSlice";
import {
  CircularProgress,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import AuthCode from "react-auth-code-input";

//? icons
import { FaFacebook } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { VscCloudUpload } from "react-icons/vsc";
import profileIcon from "../../assets/NavAssets/profile.png";
import { animtedRoutesVariants } from "../../Helpers/motionVariants";
import { RootState } from "../../redux/store";
import axios from "axios";
import { reFetchUserInfo } from "../../redux/userInfoSlice";
import { changeNotificationAlertValue } from "../../redux/slices/notificationSlice";
import { TbWorld } from "react-icons/tb";
import { FaBirthdayCake } from "react-icons/fa";

import "./css/settings.css";

export default function Settings() {
  const userInfoState = useSelector((state: RootState) => state.userInfoState);
  const dispatch = useDispatch();
  const [is2AuthEnabled, set2AuthStatus] = useState(false);
  const [switchStatus, setSwitchStatus] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [country, setCountry] = useState(userInfoState.country);
  const [sex, setSex] = useState(userInfoState.sex);
  const [birth, setBirth] = useState(userInfoState.birthday);
  const [facebook, setFacebook] = useState(userInfoState.facebook || "");
  const [twitter, setTwitter] = useState(userInfoState.x || "");

  const handleUpdateInfo = useCallback(() => {
    const obj = {
      country: country.trim(),
      birthday: new Date(birth),
      sex: sex,
      socialMedia: {
        facebook: facebook,
        x: twitter,
      },
    };
    if (country.length > 56) {
      dispatch(
        changeNotificationAlertValue({
          alertContent: "country name is too long",
          color: "warning",
        })
      );
      return;
    }
    dispatch(setAppIsLoading(true));
    axios
      .post(`${import.meta.env.VITE_FETCHING_URL}/user/update/infos`, {
        data: obj,
      })
      .then(() => {
        dispatch(setAppIsLoading(false));
        reFetchUserInfo();
      })
      .catch((err) => console.log(err));
  }, [birth, sex, country, dispatch, twitter, facebook]);

  const handleUploadAvatar = useCallback(() => {
    const formData = new FormData();
    const imgInput = document.querySelector(
      "#avatar-upload"
    ) as HTMLInputElement;
    if (imgInput.files && imgInput.files[0]) {
      formData.append("image", imgInput.files[0]);
      dispatch(setAppIsLoading(true));
      axios
        .post(
          `${import.meta.env.VITE_FETCHING_URL}/user/${
            userInfoState.username
          }/upload/avatar`,
          formData
        )
        .then((data) => data.data)
        .then((data) => {
          dispatch(reFetchUserInfo());
          dispatch(
            changeNotificationAlertValue({
              alertContent: data.message,
              color: data.color,
            })
          );
          dispatch(setAppIsLoading(false));
        })
        .catch((err) => console.log(err));
    }
  }, [userInfoState, dispatch]);

  const handleChangeUsername = useCallback(() => {
    const newUsernameInput = document.querySelector(
      ".Settings-container .new-username-input"
    ) as HTMLInputElement;
    if (!newUsernameInput.value.replace(/\s/g, "").length) {
      return;
    }
    if (newUsernameInput.value.length <= 10) {
      dispatch(setAppIsLoading(true));
      axios
        .post(
          `${import.meta.env.VITE_FETCHING_URL}/user/${
            userInfoState.username
          }/update/username`,
          { username: newUsernameInput.value }
        )
        .then((res) => res.data)
        .then((res: { message: string }) => {
          if (res.message === "Success") {
            dispatch(reFetchUserInfo());
            // dispatch(
            //   changeNotificationAlertValue({
            //     alertContent: `username changed successfuly to ${newUsernameInput.value}`,
            //     color: "success",
            //   })
            // );
            newUsernameInput.value = "";
            dispatch(setAppIsLoading(false));
          } else {
            dispatch(setAppIsLoading(false));
            // dispatch(
            //   changeNotificationAlertValue({
            //     alertContent: "name already taken",
            //     color: "warning",
            //   })
            // );
          }
        })
        .catch((err) => console.log(err));
    }
  }, [userInfoState, dispatch]);

  const handle2AuthChange = useCallback((res: string) => {
    if (res.length === 6) {
      axios
        .post(`${import.meta.env.VITE_FETCHING_URL}/auth/2fa/verify`, {
          token: res,
        })
        .then((res) => res.data)
        .then((res) => {
          if (res.message === "success") {
            set2AuthStatus(true);
          }
          dispatch(
            changeNotificationAlertValue({
              alertContent:
                res.message === "success"
                  ? "2 factor authentication activated successfuly"
                  : "The verify code is wrong",
              color: res.message === "success" ? "success" : "danger",
            })
          );
        })
        .catch((err) => console.log(err));
    }
  }, []);

  useEffect(() => {
    //? get the status of 2auth if enabled or not
    axios
      .get(`${import.meta.env.VITE_FETCHING_URL}/auth/2fa/status`, {
        withCredentials: true,
      })
      .then((res) => res.data)
      .then((res) => {
        setSwitchStatus(res.status);
        set2AuthStatus(res.status);
      })
      .catch((err) => console.log(err));
    //? update preview avatar
    const imgInput = document.querySelector(
      "#avatar-upload"
    ) as HTMLInputElement;
    imgInput.addEventListener("change", () => {
      (
        document.querySelector(
          ".Settings-container .avatar-preview"
        ) as HTMLImageElement
      ).src = URL.createObjectURL(imgInput.files![0]);
    });
    dispatch(setCurrentPage("Settings"));
  }, [dispatch]);

  return (
    <motion.div
      className="Settings-container w-full h-full transition"
      variants={animtedRoutesVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      <div className="settings-box transition bg-[--light-blue] rounded">
        <div className="head text-center transition bg-[--light-purple] font-bold text-xl text-[--text-blue] py-4 rounded-t">
          Game Settings
        </div>
        <div className="setting-content py-8">
          <div className="inputs max-w-[600px] mx-auto">
            <div className="username-input mx-auto flex flex-col md:flex-row items-center justify-between">
              <h1 className="transition text-[--text-blue] font-semibold text-xl">
                Change Username
              </h1>
              <div className="input-box w-[80%] max-w-80 my-4 flex items-center h-12">
                <input
                  className="new-username-input w-full py-2 rounded-l focus:outline-none px-2 border border-[--text-blue] text-[--text-blue] transition bg-[--light-blue] h-full"
                  type="text"
                  placeholder="New Username"
                  maxLength={10}
                />
                <motion.div
                  className="update-btn px-4 flex items-center transition bg-[--text-blue] dark:bg-[--blue-cyan] rounded-r
                         text-white dark:text-[--blue-light-bg] font-semibold cursor-pointer h-full"
                  whileHover={{ filter: "brightness(.8)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleChangeUsername}
                >
                  Update
                </motion.div>
              </div>
            </div>
            <div className="avatar-input my-4 mx-auto flex flex-col md:flex-row items-center justify-between">
              <h1 className="transition text-[--text-blue] font-semibold text-xl">
                Change Avatar
              </h1>
              <div className="input-box w-[80%] max-w-80 my-4 flex items-center h-12">
                <div className="upload-area py-1 border border-[--text-blue] w-full flex justify-center items-center rounded-l h-full">
                  <label htmlFor="avatar-upload" className="uploaded-img mr-3">
                    <img
                      className="avatar-preview w-8 rounded-lg"
                      src={userInfoState.avatar || profileIcon}
                      alt="profile pic"
                      referrerPolicy="no-referrer"
                    />
                  </label>
                  <label
                    htmlFor="avatar-upload"
                    className="w-[60%] max-w-32 transition bg-[--blue] text-white py-1 rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <span className="pr-1">upload</span>
                    <VscCloudUpload size={20} />
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    id="avatar-upload"
                    hidden
                  />
                </div>
                <motion.div
                  className="update-btn px-4 flex items-center transition bg-[--text-blue] dark:bg-[--blue-cyan] rounded-r
                         text-white dark:text-[--blue-light-bg] font-semibold cursor-pointer ml-auto h-full"
                  whileHover={{ filter: "brightness(.8)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleUploadAvatar}
                >
                  Update
                </motion.div>
              </div>
            </div>
            <Divider className="text-[--text-blue] bg-[--text-blue] rounded-full" />
            <div className="other-info space-y-4">
              <div className="title transition text-xl text-[--text-blue] font-bold text-center my-4">
                Personal info
              </div>
              <div className="country flex flex-col space-y-4 sm:space-y-0 sm:flex-row items-center justify-center">
                <TbWorld className="transition text-[--text-blue]" size={30} />
                <input
                  className="w-[80%] rounded-md text-center p-2 mx-auto block"
                  placeholder="Country name"
                  type="text"
                  maxLength={56}
                  value={country}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCountry(e.target.value)
                  }
                />
              </div>
              <div className="birth flex flex-col space-y-4 sm:space-y-0 sm:flex-row items-center justify-center">
                <FaBirthdayCake
                  size={30}
                  className=" transition text-[--text-blue]"
                />
                <input
                  className="w-[80%] rounded-md text-center p-2 mx-auto block"
                  type="date"
                  value={birth === "0" || !birth.length ? "" : birth}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setBirth(e.target.value)
                  }
                />
              </div>
              <div className="sex transition text-[--nav-icons] font-semibold my-4 flex flex-col justify-center items-center">
                <RadioGroup
                  row
                  defaultValue={userInfoState.sex}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSex(e.target.value)
                  }
                >
                  <FormControlLabel
                    value="Male"
                    control={<Radio />}
                    label="Male"
                    labelPlacement="top"
                  />
                  <FormControlLabel
                    value="Female"
                    control={<Radio />}
                    label="Female"
                    labelPlacement="top"
                  />
                </RadioGroup>
              </div>
              <div className="social-media space-y-4">
                <div className="facebook flex flex-col space-y-4 sm:space-y-0 sm:flex-row items-center justify-center">
                  <FaFacebook
                    size={30}
                    className="text-[--text-blue] transition"
                  />
                  <input
                    className="w-[80%] rounded-md text-center p-2 mx-auto block"
                    placeholder="Facebook"
                    type="text"
                    value={facebook}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFacebook(e.target.value)
                    }
                  />
                </div>
                <div className="twitter flex flex-col space-y-4 sm:space-y-0 sm:flex-row items-center justify-center">
                  <FaTwitter
                    size={30}
                    className="text-[--text-blue] transition"
                  />
                  <input
                    className="w-[80%] rounded-md text-center p-2 mx-auto block"
                    placeholder="Twitter"
                    type="text"
                    value={twitter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTwitter(e.target.value)
                    }
                  />
                </div>
              </div>
              <button
                className="update-other-info-btn transition bg-[--nav-icons] w-56 block
                text-center text-lg font-semibold rounded-md text-white dark:text-black py-3 px-2 mx-auto hover:opacity-70"
                onClick={handleUpdateInfo}
              >
                Update personal info
              </button>
            </div>
            <div className="auth-toggle flex md:flex-row flex-col items-center justify-evenly mt-4">
              <label
                htmlFor="auth-switcher"
                className="transition text-[--text-blue] font-semibold text-xl"
              >
                2 factor authentication
              </label>
              <Switch
                checked={switchStatus}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  axios
                    .get(
                      `${import.meta.env.VITE_FETCHING_URL}/auth/2fa/${
                        e.target.checked ? "enable" : "disable"
                      }`
                    )
                    .then((res) => {
                      if (!e.target.checked) {
                        set2AuthStatus(false);
                      }
                      setQrImage(res.data.qrCodeImage);
                    })
                    .catch((err) => console.log(err));
                  setSwitchStatus(e.target.checked);
                }}
                id="auth-switcher"
              />
            </div>
            <AnimatePresence>
              {!is2AuthEnabled && switchStatus && (
                <>
                  <motion.div
                    className="auth-qr-code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {!qrImage ? (
                      <div className="text-center my-5">
                        <CircularProgress />
                      </div>
                    ) : (
                      qrImage && (
                        <img
                          className="w-[70%] max-w-72 mx-auto my-5 rounded"
                          src={qrImage}
                          alt="qr code"
                        />
                      )
                    )}
                    <AuthCode
                      onChange={handle2AuthChange}
                      containerClassName={"flex justify-around space-x-2"}
                      inputClassName="w-[calc(80%/6)] h-16 rounded-md text-4xl text-center  focus:outline-blue-500"
                    />
                    <p className="transition text-[--white-text] text-lg text-center my-4">
                      Please enter the verification code
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
