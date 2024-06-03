import { useNavigate } from "react-router";
import { matchesObj } from "./MatchesHistory";

export default function HistoryEntity({ data }: { data: matchesObj }) {
  const jeSuisGagne = data.result === "win";
  const textColor = jeSuisGagne
    ? "text-yellow-500 dark:text-yellow-200"
    : "text-red-500 dark:text-red-200";
  const bgColor = jeSuisGagne ? "bg-yellow-400 dark:bg-yellow-600" : "bg-red-500 dark:bg-red-400";
  const navigate = useNavigate();

  return (
    <div
      className={`history-entity flex items-center justify-between ${
        jeSuisGagne ? "bg-[--light-gold]" : "bg-[--lose-red]"
      } text-2xl xl:text-3xl font-black rounded-md px-2 xl:px-8 py-10 relative`}
    >
      <div className={`date hidden xl:block ${textColor}`}>{data.date}</div>
      <div
        className="center-box flex items-center justify-evenly
            absolute w-full xl:w-auto h-full xl:h-auto  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="player-one-avatar w-12 md:w-16 min-w-10">
          <img
            className="rounded-md"
            src={data.myAvatar}
            alt="avatar"
            referrerPolicy="no-referrer"
          />
        </div>
        <div
          className={`score ${bgColor} mx-4 py-3 px-6 tracking-widest rounded-md text-white`}
        >
          <span>{data.me}</span>:<span>{data.opponent}</span>
        </div>
        <div className="player-two-avatar w-12 md:w-16 min-w-10">
          <img
            className="rounded-md"
            src={data.oppAvatar}
            alt="avatar"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
      <div className={`result hidden xl:block ${textColor}`}>{data.result}</div>
    </div>
  );
}
