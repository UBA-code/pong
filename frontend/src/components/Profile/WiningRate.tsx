import { useState } from "react";
import useFetch from "../../Helpers/Hooks/useFetch";
import { Skeleton } from "@mui/material";

function getProgressValue(raduis: number, value: number) {
  const circumference = raduis * 2 * Math.PI;

  return circumference - (value / 100) * circumference;
}

interface WiningRateObj {
  win: number;
  lose: number;
  winRate: number;
}

export default function WiningRate({
  username,
}: {
  username: string | undefined;
}) {
  const { data, isLoading } = useFetch<WiningRateObj>(
    `${import.meta.env.VITE_FETCHING_URL}/user/matches/winrate/${username}`
  );

  setTimeout(() => {
    const element = document.querySelector(
      ".progress-ring"
    ) as SVGCircleElement;

    if (element) {
      element.style.strokeDasharray = `${95 * 2 * Math.PI}`;
      element.style.strokeDashoffset = getProgressValue(
        95,
        data ? data.winRate : 0
      ).toString();
    }
  }, 0);

  return (
    <div
      className="wining-rate-box relative transition bg-[--white-bg] flex flex-col items-center justify-center rounded xl:mb-0 py-4
										xl:col-start-1 xl:col-end-2"
    >
      <div className="title text-xl font-semibold transition text-[var(--text-blue)] my-3">
        Wining Rate
      </div>
      {isLoading ? (
        <Skeleton animation="wave" width={100} height={200} />
      ) : (
        <div className="progress-ring-box">
          <svg width={250} height={250}>
            <circle
              className="fill-none transition  stroke-[--light-gray] stroke-[40]"
              r={95}
              cx={125}
              cy={125}
            ></circle>
            <circle
              className="progress-ring fill-none  stroke-[var(--purple)] stroke-[50] transition-all duration-1000"
              r={95}
              cx={125}
              cy={125}
              style={{ strokeDashoffset: 600, strokeDasharray: 600 }}
            ></circle>
            <text
              className="text-xl font-bold transition  fill-[var(--text-blue)]"
              x={"50%"}
              y={"50%"}
              textAnchor="middle"
            >
              {data && data?.win} Wins
            </text>
            <text
              className=" transition fill-gray-400"
              x={"50%"}
              y={"60%"}
              textAnchor="middle"
            >
              ({data && data?.winRate?.toFixed(0)}%)
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}
