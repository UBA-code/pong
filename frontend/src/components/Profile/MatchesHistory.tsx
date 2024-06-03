import { v4 as uuidv4 } from "uuid";
import useFetch from "../../Helpers/Hooks/useFetch";
import { CircularProgress, IconButton, Skeleton, Tooltip } from "@mui/material";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import HistoryEntity from "./HistoryEntity";

//?icons

export interface matchesObj {
  me: number;
  opponent: number;
  myDisplayname: string;
  oppDisplayname: string;
  myAvatar: string;
  oppAvatar: string;
  winner: string;
  loser: string;
  date: string;
  result: string;
}

export default function MatchesHistory({
  username,
}: {
  username: string | undefined;
}) {
  const totalFetch = useRef<string>("?x=8");
  const { data, refetch, isLoading } = useFetch<matchesObj[]>(
    `${import.meta.env.VITE_FETCHING_URL}/user/matches/history/${username}${
      totalFetch.current
    }`
  );
  const [detailsIsOpen, setDetailsIsOpen] = useState(false);

  return (
    <div className="matches-history-box box xl:my-0 xl:col-start-1 xl:col-end-3 xl:row-start-1 xl:row-end-2 xl:-order-1">
      <div className="head flex items-center justify-between">
        <p className="box-title">Match History</p>
        {data?.length ? (
          <button
            className="view-all-btn"
            onClick={() => {
              setDetailsIsOpen(true);
              totalFetch.current = "";
              refetch();
            }}
          >
            View All
          </button>
        ) : (
          ""
        )}
      </div>
      {isLoading ? (
        <Skeleton animation="wave" height={50} />
      ) : (
        <div className="results flex items-center justify-around mt-4">
          {data?.length ? (
            data?.map((e: matchesObj, i: number) => {
              if (i > 7) return "";
              return (
                <div
                  className={`result-box ${
                    i < 4 ? "" : "hidden sm:block"
                  } transition
              ${
                e.result === "win"
                  ? "bg-[var(--light-gold)] text-[var(--lose-gold)]"
                  : "bg-[var(--lose-red)] text-[var(--lose-text-red)]"
              }
              py-2 px-3 rounded-md text-center font-semibold`}
                  key={uuidv4()}
                >
                  <div className="first-player-score">{e.me}</div>
                  <div className="second-player-score">{e.opponent}</div>
                </div>
              );
            })
          ) : (
            <span className="font-semibold transition text-[--text-blue-second-text] md:text-lg text-center">
              <span>No matches have been played by this user yet</span>
            </span>
          )}
        </div>
      )}
      <AnimatePresence>
        {detailsIsOpen ? (
          <motion.div
            className="fixed top-0 left-0 w-full h-screen z-[500]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="overlay-bg fixed top-0 left-0 w-screen h-full min-h-screen bg-[--trans-bg]"
              onClick={() => setDetailsIsOpen(false)}
            ></div>
            <div
              className="content-box absolute w-[90%] h-[90%] bg-[--white-bg] rounded
                  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 py-6 px-2 md:px-14 overflow-y-auto"
            >
              <div className="header flex items-center justify-between text-[--text-blue]">
                <div className="title text-2xl font-semibold">
                  Matches History
                </div>
                <Tooltip title="Close">
                  <IconButton onClick={() => setDetailsIsOpen(false)}>
                    <IoClose className="text-[--text-blue]" size={35} />
                  </IconButton>
                </Tooltip>
              </div>
              {isLoading || !data ? (
                <CircularProgress className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              ) : (
                <div className="body space-y-6 my-6 overflow-y-auto">
                  {data?.map((e) => (
                    <HistoryEntity data={e} key={uuidv4()} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          ""
        )}
      </AnimatePresence>
    </div>
  );
}
