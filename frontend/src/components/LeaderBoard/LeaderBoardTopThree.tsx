import { useNavigate } from "react-router";
import { leaderBoardDataObj } from "./LeaderBoard";

//? icons
import { PiCrownFill } from "react-icons/pi";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface UserImgProp {
  img: string;
  rank: number;
  borderColor: string;
  bgColor: string;
  username: string;
}

function UserImg({ img, rank, bgColor, borderColor, username }: UserImgProp) {
  const navigate = useNavigate();

  return (
    <div
      className={`avatar ${
        rank === 1 ? "w-20 md:w-28" : "w-16 md:w-20"
      } rounded-full border-[3px] ${borderColor} absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2`}
    >
      <img
        onClick={() => navigate(`/profile/${username}`)}
        className="rounded-full size-full cursor-pointer"
        src={img}
        alt="user avatar"
        referrerPolicy="no-referrer"
      />
      <div
        className={`rank absolute -bottom-3 left-1/2 -translate-x-1/2 ${bgColor} rounded-full w-5 h-5 text-center text-sm font-bold text-white`}
      >
        {rank}
      </div>
      {rank === 1 && (
        <PiCrownFill
          className="absolute -top-[70%] md:-top-[50%] left-1/2 -translate-x-1/2 text-[#FFAA00]"
          size={60}
        />
      )}
    </div>
  );
}

export default function LeaderBoardTopThree({
  data,
}: {
  data: leaderBoardDataObj[] | undefined;
}) {
  const appState = useSelector((state: RootState) => state.appStates);
  return (
    <div className="leaderboard-top-three flex justify-center items-end transition bg-[--light-purple] h-[20rem] rounded">
      {data && data[1] && (
        <div
          className={`second-place w-[30%] max-w-40 h-32 transition ${
            appState.theme === "dark" ? `bg-[#7f6635]` : "bg-[#F7EDD2]"
          } rounded-tl-3xl relative transition`}
        >
          <UserImg
            img={
              (data && data[1].avatar) ||
              "https://cdn.intra.42.fr/users/8461c606d1e108eff042231397f84ddd/ybel-hac.JPG"
            }
            rank={2}
            borderColor="border-[#008FC6]"
            bgColor="bg-[#008FC6]"
            username={data[1].username}
          />
          <div className="player-info w-[90%] text-center absolute top-[60%] -translate-y-1/2 left-1/2 -translate-x-1/2 transition text-[--text-blue] text-lg font-bold">
            <p className="username truncate">{data && data[1].displayname}</p>
            <p className="score text-center transition text-[#008FC6] truncate">
              {data && data[1].score}
            </p>
          </div>
        </div>
      )}
      {data && data[0] && (
        <div
          className={`first-place w-[35%] max-w-52 h-52 ${
            appState.theme === "dark" ? `bg-[#8c6413]` : "bg-[#FFF5B7]"
          } rounded-t-3xl relative transition`}
        >
          <UserImg
            img={
              (data && data[0].avatar) ||
              "https://cdn.intra.42.fr/users/8461c606d1e108eff042231397f84ddd/ybel-hac.JPG"
            }
            rank={1}
            borderColor="border-[#FFAA00]"
            bgColor="bg-[#FFAA00]"
            username={data[0].username}
          />
          <div className="player-info w-[90%] text-center absolute top-[60%] -translate-y-1/2 left-1/2 -translate-x-1/2 transition text-[--text-blue] text-lg font-bold">
            <p className=" truncate">{data && data[0].displayname}</p>
            <p className="score text-center text-[#FFAA00] truncate">
              {data[0] && data[0].score}
            </p>
          </div>
        </div>
      )}
      {data && data[2] && (
        <div
          className={`third-place w-[30%] max-w-40 h-32 ${
            appState.theme === "dark" ? `bg-[#7f6635]` : "bg-[#F7EDD2]"
          } rounded-tr-3xl relative transition`}
        >
          <UserImg
            img={
              (data && data[2].avatar) ||
              "https://cdn.intra.42.fr/users/8461c606d1e108eff042231397f84ddd/ybel-hac.JPG"
            }
            rank={3}
            borderColor="border-[#00D95F]"
            bgColor="bg-[#00D95F]"
            username={data[2].username}
          />
          <div className="player-info w-[90%] text-center absolute top-[60%] -translate-y-1/2 left-1/2 -translate-x-1/2 transition text-[--text-blue] text-lg font-bold">
            <p className="username truncate">{data && data[2].displayname}</p>
            <p className="score text-center text-[#00D95F] truncate">
              {data && data[2].score}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
