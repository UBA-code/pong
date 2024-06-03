import { useEffect } from "react";
import useFetch from "../../Helpers/Hooks/useFetch";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPage } from "../../redux/slices/appSlice";
import LeaderBoardTopThree from "./LeaderBoardTopThree";
import { v4 as uuid4 } from "uuid";
import { motion } from "framer-motion";
//? icons
import { PiStarFill } from "react-icons/pi";
import { animtedRoutesVariants } from "../../Helpers/motionVariants";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import { RootState } from "../../redux/store";

export interface leaderBoardDataObj {
  avatar: string;
  displayname: string;
  id: number;
  losses: number;
  score: number;
  username: string;
  wins: number;
}

function UserRank({
  user,
  rank,
  tmp = false,
}: {
  user?: leaderBoardDataObj;
  rank?: number;
  tmp?: boolean;
}) {
  const navigate = useNavigate();
  const appStates = useSelector((state: RootState) => state.appStates);

  return (
    <div
      className={`user-rank flex items-center transition ${
        !tmp ? "bg-[--light-gray]" : ""
      } p-2 rounded overflow-x-auto`}
    >
      <div
        className={`user-info flex items-center space-x-2 transition text-[--text-blue] font-bold text-lg w-[60%] sm:w-[30%] cursor-pointer`}
        onClick={() => navigate(`/profile/${user?.username}`)}
      >
        <span className="rank">{rank}</span>
        {!tmp && (
          <div className="user-avatar w-12 min-w-12">
            <img
              className="rounded-xl"
              src={user?.avatar}
              alt=""
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className="username truncate">{user?.displayname}</div>
      </div>
      <div
        className={`user-statistic w-[45%] sm:w-[70%] text-center flex justify-between md:grid grid-cols-3 font-bold space-x-2`}
      >
        <div className="loses text-[#FF16A2] ">
          {tmp ? "lose" : user?.losses}
        </div>
        <div className="wins text-[#F99539] ">{tmp ? "win" : user?.wins}</div>
        <div
          className={`score transition ${
            appStates.theme === "light" ? "text-[--blue]" : "text-[--blue-cyan]"
          } flex items-center justify-center`}
        >
          <span>{tmp ? "score" : user?.score}</span>
          <span>{!tmp && <PiStarFill className="ml-[2px]" size={12} />}</span>
        </div>
      </div>
    </div>
  );
}

export default function LeaderBoard() {
  const userInfoState = useSelector((state: RootState) => state.userInfoState);
  const { data, isLoading } = useFetch<leaderBoardDataObj[]>(
    `${import.meta.env.VITE_FETCHING_URL}/user/leaderboard/top/${
      userInfoState.username
    }?x=-1`
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCurrentPage("Leaderboard"));
  }, [dispatch]);

  return (
    <motion.div
      className={`leaderBoard-container transition bg-[--white-bg] rounded ${
        isLoading ? "flex items-center justify-center" : ""
      }`}
      variants={animtedRoutesVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      {isLoading ? (
        <CircularProgress className="my-10" />
      ) : (
        <>
          <LeaderBoardTopThree data={data?.slice(0, 3)} />
          {data && data.length > 3 ? (
            <div className="remaining-users space-y-4 px-2 py-4">
              <UserRank tmp />
              {data &&
                data.map((e, i) =>
                  i < 3 ? "" : <UserRank user={e} rank={i} key={uuid4()} />
                )}
            </div>
          ) : (
            ""
          )}
        </>
      )}
    </motion.div>
  );
}
