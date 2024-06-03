import useFetch from "../../Helpers/Hooks/useFetch";
import { Skeleton } from "@mui/material";

interface LatestMatchObj {
  me: string;
  secondPlayerdisplayname: string;
  myScore: number;
  secondPlayerScore: number;
  winnerUsername: string;
  timesDefeatedByOpponent: number;
  timesWonAgainstOpponent: number;
}

export default function LatestMatch({
  username,
}: {
  username: string | undefined;
}) {
  const { data, isLoading } = useFetch<LatestMatchObj>(
    `${import.meta.env.VITE_FETCHING_URL}/user/matches/lastmatch/${username}`
  );
  const winner = data && data.myScore >= data.secondPlayerScore ? true : false;

  return (
    <div className="latest-match-box box">
      <div className="head flex items-center justify-between">
        <div className="box-title">Latest Match</div>
      </div>
      {isLoading ? (
        <Skeleton animation="wave" height={100} />
      ) : (
        <div className="body my-4 md:flex justify-evenly items-center transition text-[--text-blue-second-text] text-center">
          {!data ? (
            <span className="font-semibold">
              No matches have been played by this user yet
            </span>
          ) : (
            <>
              <div className="left-side w-full md:max-w-40">
                <div
                  className={`player-one flex items-center justify-between font-bold ${
                    winner ? "transition text-[var(--gold)]" : ""
                  } mb-4`}
                >
                  <div className="username truncate w-24 mr-1">{data?.me}</div>
                  <div className="score">{data?.myScore}</div>
                  <div
                    className={`status ml-2 py-1 px-2 transition bg-[var(--light-gold)] rounded-[0.3rem]
                ${winner ? "visible" : "invisible"}`}
                  >
                    WIN
                  </div>
                </div>
                <div
                  className={`player-one flex items-center justify-between ${
                    !winner ? "transition text-[var(--gold)]" : ""
                  } font-bold`}
                >
                  <div className="username truncate w-24">
                    {data?.secondPlayerdisplayname}
                  </div>
                  <div className="score">{data?.secondPlayerScore}</div>
                  <div
                    className={`status ml-2 py-1 px-2 transition bg-[var(--light-gold)] rounded-[0.3rem]
                ${winner ? "invisible" : "visible"}`}
                  >
                    WIN
                  </div>
                </div>
              </div>
              <div className="w-full h-[.1px] md:w-[.1px] md:h-full bg-black my-4"></div>
              <div className="right-side text-center flex flex-col justify-center items-center font-semibold w-full md:max-w-40">
                <div className="title mb-3 max-w-full">
                  Matches Played with{" "}
                  <span className="truncate block">
                    {data?.secondPlayerdisplayname}
                  </span>
                </div>
                <div
                  className={`total-matches py-4 px-16 rounded-[0.3rem] font-bold flex items-center
              ${
                (data?.timesWonAgainstOpponent || 0) >
                (data?.timesDefeatedByOpponent || 0)
                  ? " bg-[var(--light-gold)] transition text-[--gold]"
                  : (data?.timesWonAgainstOpponent || 0) <
                    (data?.timesDefeatedByOpponent || 0)
                  ? " bg-[var(--lose-red)] transition text-[var(--lose-text-red)]"
                  : " bg-[var(--sky-blue)] transition text-[var(--text-blue)]"
              }`}
                >
                  {data?.timesWonAgainstOpponent}
                  <span className="px-4">:</span>
                  {data?.timesDefeatedByOpponent}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
