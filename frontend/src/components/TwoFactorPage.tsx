import AuthCode, { AuthCodeRef } from "react-auth-code-input";
import { motion } from "framer-motion";
import { useCallback, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAppIsLoading } from "../redux/slices/appSlice";
import { useNavigate } from "react-router";
import { reInitSocketsContext } from "../Context/ReInitSockets";
import {
  chatSocketContext,
  mainSocketContext,
} from "../Context/socketsContexts";

export default function TwoFactorPage() {
  const mainSocket = useContext(mainSocketContext);
  const chatSocket = useContext(chatSocketContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authRef = useRef<AuthCodeRef | null>(null);
  const reInitSockets = useContext(reInitSocketsContext);

  const handleVerifie = useCallback((res: string) => {
    if (res.length === 6) {

      dispatch(setAppIsLoading(true));
      axios
        .post(`${import.meta.env.VITE_FETCHING_URL}/auth/2fa/login`, {
          token: res,
        })
        .then((res) => {
          dispatch(setAppIsLoading(false));
          if (res.data.message === "Unauthorized") {
            navigate("/");
            reInitSockets(false);
          } else if (res.data.message === "invalid token") {
            authRef.current?.clear();
          }
        })
        .catch((err) => console.log(err));
    }
  }, []);

  useEffect(() => {
    dispatch(setAppIsLoading(true));
    axios
      .get(`${import.meta.env.VITE_FETCHING_URL}/auth/2fa/isActivated`)
      .then((res) => {
        dispatch(setAppIsLoading(false));
        if (res.data.message === "Unauthorized") {
          navigate(res.data.redirectTo);
        }
      });
  }, []);

  return (
    <motion.div
      className="TwoFactorPage flex flex-col items-center justify-center h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="title flex flex-col items-center justify-center text-3xl font-semibold text-gray-800"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ bounce: 0, duration: 0.7 }}
      >
        <span>Two-Factor</span>
        <span>Authentication</span>
      </motion.div>
      <motion.div
        className="auth-box"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ delay: 0.1, bounce: 0, duration: 0.7 }}
      >
        <AuthCode
          ref={authRef}
          onChange={handleVerifie}
          containerClassName={`flex justify-center my-8 space-x-4`}
          inputClassName="w-[calc(70%/6)] max-w-32 rounded-md py-4 md:py-8 text-center text-3xl text-[--text-blue]"
        />
      </motion.div>
      <motion.span
        className="text-lg font-semibold text-[--text-blue] text-center px-2"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ delay: 0.2, bounce: 0, duration: 0.7 }}
      >
        <p>A message with a verification code has been sent to your devices.</p>
        <p>Enter the code to continue.</p>
      </motion.span>

      <motion.div
        className="logout-btn-container"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ delay: 0.3, bounce: 0, duration: 0.7 }}
        onClick={() => {
          axios
            .get(`${import.meta.env.VITE_FETCHING_URL}/auth/signout`)
            .then(() => {
              mainSocket?.disconnect();
              chatSocket?.disconnect();
              navigate("/");
            })
            .catch((err) => console.log(err));
        }}
      >
        <motion.button
          className="logout-btn bg-[--text-blue-const] text-white font-semibold py-2 px-4 rounded-md mt-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 1 }}
        >
          Logout
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
