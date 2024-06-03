import { motion } from "framer-motion";
import { animtedRoutesVariants } from "../../Helpers/motionVariants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import profilePic from "../../assets/login/profile.png";
import Logo42 from "../../assets/login/42_logo.svg";

//? icons
import { FcGoogle } from "react-icons/fc";
import { Tooltip } from "@mui/material";

export default function Login() {
  const navigate = useNavigate();

  const { data: isLoggedIn } = useQuery({
    queryKey: ["login"],
    queryFn: async () => {
      const res = await axios
        .get(`${import.meta.env.VITE_FETCHING_URL}/auth/whoami`, {
          withCredentials: true,
        })
        .then((res) => res.data)
        .then((res) => {
          if (res.id!) {
            return true;
          }
          return false;
        });
      return res as boolean;
    },
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  });

  return (
    typeof isLoggedIn !== "undefined" &&
    !isLoggedIn && (
      <motion.div
        className="login flex items-center h-screen min-h-[600px]"
        variants={animtedRoutesVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
      >
        <div className="auth-side h-full bg-[#12141A] flex flex-col items-center justify-center space-y-14 w-full md:w-[30%]">
          <motion.div
            className="title text-white text-4xl text-center"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to PONG
          </motion.div>
          <motion.a
            className="auth-btn"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            href={`${import.meta.env.VITE_FETCHING_URL}/auth/intra`}
          >
            <motion.div
              className="hover-animation-box flex items-center space-x-4 bg-[#1D2028] w-fit py-2 px-4 rounded mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={Logo42} alt="42" className="size-10" />
              <span className="text-lg text-white font-medium">
                Continue with Intra
              </span>
            </motion.div>
          </motion.a>
          <Tooltip
            title={
              import.meta.env.VITE_GOOGLE_ENABLED === "false"
                ? "You must be logged in with intra"
                : ""
            }
          >
            <motion.a
              className={`auth-btn ${
                import.meta.env.VITE_GOOGLE_ENABLED === "false"
                  ? "blur-[1px] cursor-not-allowed"
                  : ""
              }`}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={(e) => {
                if (import.meta.env.VITE_GOOGLE_ENABLED === "false") {
                  e.preventDefault();
                }
              }}
              href={`${import.meta.env.VITE_FETCHING_URL}/auth/google`}
            >
              <motion.div
                className="hover-animation-box flex items-center space-x-4 bg-[#1D2028] w-fit py-2 px-4 rounded mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FcGoogle size={30} />
                <span className="text-lg text-white font-medium">
                  Continue with Google
                </span>
              </motion.div>
            </motion.a>
          </Tooltip>
        </div>
        <div className="discover-side h-full relative w-[70%] overflow-hidden hidden md:block">
          <div className="title z-50 text-white ml-8 mt-8 space-y-4">
            <motion.p
              className="font-bold text-4xl "
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              Enjoy the pong world
            </motion.p>
            <motion.p
              className="font-semibold w-[90%]"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Welcome to Pong! Play Pong online with real-time chat and connect
              with players around the world.
            </motion.p>
          </div>
          <div className="bg absolute top-0 left-0 w-full h-full -z-30">
            <div className="bg-box w-full h-full flex items-center">
              <div
                className="rect-one absolute w-[50%] h-[calc(100vh+100vw)] bg-[#1F2537] rotate-[35deg]
                  translate-x-[-172%]"
              ></div>
              <div
                className="rect-two absolute w-[50%] h-[calc(100vh+100vw)] bg-[#242A3C] rotate-[35deg]
              translate-x-[-54%]"
              ></div>
              <div
                className="rect-three absolute w-[50%] h-[calc(100vh+100vw)] bg-[#2A2E41] rotate-[35deg]
              translate-x-[61%]"
              ></div>
              <div
                className="rect-four absolute w-[50%] h-[calc(100vh+100vw)] bg-[#3A3E4F] rotate-[35deg]
              translate-x-[180%]"
              ></div>
            </div>
            <motion.div
              className="profile-pic xl:w-[80%] absolute bottom-0 right-0"
              initial={{
                y: -100,
                opacity: 0,
                translateX: "8%",
                translateY: "15%",
              }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                className="-rotate-[10deg] brightness-75"
                src={profilePic}
                alt="profile"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
  );
}
