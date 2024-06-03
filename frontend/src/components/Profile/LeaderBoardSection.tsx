import { v4 as uuid4 } from "uuid";
import useFetch from "../../Helpers/Hooks/useFetch";
import { Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

interface leaderBoardObj {
  id: number;
  losses: number;
  playerId: number;
  score: number;
  displayname: string;
  wins: number;
}

export default function LeaderBoard({
  username,
}: {
  username: string | undefined;
}) {
  const navigate = useNavigate();
  const { data, isLoading } = useFetch<leaderBoardObj[]>(
    `${import.meta.env.VITE_FETCHING_URL}/user/leaderboard/top/${username}?x=4`
  );

  return (
    <div className="leaderBoard-box box xl:col-start-1 xl:col-end-3">
      <div className="head flex items-center justify-between">
        <div className="box-title">LeaderBoard</div>
        <div className="view-all-btn" onClick={() => navigate("/leaderboard")}>
          View All
        </div>
      </div>
      <div className="body">
        {data &&
          data?.map((e: leaderBoardObj, i: number) => {
            if (i > 3) return "";
            const bg = i === 0 ? "var(--gold-bg)" : "var(--blue-light-bg)";
            const textColor = i === 0 ? "#FFBD3D" : "#1C5BFE";

            return isLoading ? (
              <Skeleton key={uuid4()} animation="wave" height={50} />
            ) : (
              <motion.div
                className={`user-rank flex items-center font-bold py-4 px-4 rounded border-2 my-2 shadow-xl transition-colors`}
                style={{
                  backgroundColor: bg,
                  color: textColor,
                  borderColor: textColor,
                }}
                key={uuid4()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="rank">{i + 1}</div>
                <div className="username mr-auto pl-2">{e.displayname}</div>
                <div className="score relative">{e.score}</div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
