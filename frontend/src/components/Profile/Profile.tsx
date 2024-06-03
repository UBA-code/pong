import { useEffect } from "react";
import { setCurrentPage } from "../../redux/slices/appSlice";
import LatestMatch from "./LatestMatch";
import LeaderBoard from "./LeaderBoardSection";
import LongestStreak from "./LongestStreak";
import MatchesHistory from "./MatchesHistory";
import ProfileBadge from "./ProfileBadge";
import WiningRate from "./WiningRate";
import "./css/Profile.css";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { animtedRoutesVariants } from "../../Helpers/motionVariants";
import { useParams } from "react-router";
import { RootState } from "../../redux/store";
import useFetch from "../../Helpers/Hooks/useFetch";
import { CircularProgress } from "@mui/material";

export default function Profile() {
  const params = useParams();
  const dispatch = useDispatch();
  const userInfoState = useSelector(
    (rootState: RootState) => rootState.userInfoState
  );
  const username = params.username || userInfoState.username;
  const { data: userExist, isLoading } = useFetch(
    `${import.meta.env.VITE_FETCHING_URL}/user/exist?username=${username}`
  );

  useEffect(() => {
    dispatch(setCurrentPage("Profile"));
  }, []);

  return (
    <motion.div
      className={`profile-container mt-8 xl:mt-0 grid gap-4 xl:grid-cols-5 relative w-full min-h-[calc(100vh-10rem)]`}
      variants={animtedRoutesVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      {isLoading ? (
        <CircularProgress />
      ) : userExist ? (
        <>
          <div className="left-cotnainer xl:col-start-1 xl:col-end-4">
            <div className="grid xl:grid-cols-2 gap-4 h-full">
              <MatchesHistory username={username} />
              <WiningRate username={username} />
              <LongestStreak username={username} />
              <LeaderBoard username={username} />
            </div>
          </div>
          <div className="right-container -order-1 xl:order-none xl:col-start-4 xl:col-end-6 grid gap-4 xl:grid-cols-1 xl:grid-rows-4">
            <ProfileBadge username={username} />
            <LatestMatch username={username} />
          </div>
        </>
      ) : (
        <div
          className="user-not-found transition text-xl text-[--text-blue]
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        >
          User Not Found
        </div>
      )}
    </motion.div>
  );
}
