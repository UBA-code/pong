import useFetch from "../../Helpers/Hooks/useFetch";
import { Skeleton } from "@mui/material";

interface LongestStreakObj {
  longestWinStreak: number;
  longestLoseStreak: number;
}

export default function LongestStreak({
  username,
}: {
  username: string | undefined;
}) {
  const { data, isLoading } = useFetch<LongestStreakObj>(
    `${
      import.meta.env.VITE_FETCHING_URL
    }/user/matches/longeststreak/${username}`
  );

  return (
    <div className="longestStreak-box box xl:mb-0 text-center xl:col-start-2 xl:col-end-3">
      <div className="box-title my-4">Longest Streak</div>
      <div className="scores flex items-center justify-around my-8 h-48">
        <div className="score first transition bg-[var(--light-gold)] text-[var(--gold)]">
          {isLoading ? (
            <Skeleton animation="wave" width={20} />
          ) : (
            data?.longestWinStreak
          )}
        </div>
        <div className="score second transition bg-[var(--lose-red)] text-[var(--lose-text-red)]">
          {isLoading ? (
            <Skeleton animation="wave" width={20} />
          ) : (
            data?.longestLoseStreak
          )}
        </div>
      </div>
    </div>
  );
}
