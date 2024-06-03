import { useEffect, useRef, useState } from "react";
import Forest from "../../assets/GameAssets/forest.jpg";
import Anime from "../../assets/GameAssets/anime.jpg";
import Sunrise from "../../assets/GameAssets/sunrise.jpg";

import watingImg from "../../assets/GameAssets/pong-waiting.gif";

import "./Game.css";

import { FaVolleyballBall } from "react-icons/fa";

import Ball from "./Ball";
import Paddle from "./Paddle";
import { Socket, io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { changeNotificationAlertValue } from "../../redux/slices/notificationSlice";
import getToken from "../../Helpers/getToken";
import { RootState } from "../../redux/store";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Skeleton } from "@mui/material";

interface frameDataObj {
  ballX: number;
  ballY: number;
  Player1Paddle: number;
  Player2Paddle: number;
}

export default function Game() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appState = useSelector((state: RootState) => state.appStates);
  const gameSocket = useRef<Socket | null>(null);
  const [gameResult, setGameResult] = useState<string>("");
  const timeOutReturn = useRef<any | null>(null);

  useEffect(() => {
    getToken().then((token) => {
      let mySide: "player1" | "player2";
      gameSocket.current = io(
        `http://${import.meta.env.VITE_BACKEND_HOST}:${
          import.meta.env.VITE_BACKEND_PORT
        }/game`,
        {
          auth: {
            token,
            info: appState.gameSettings,
            invite: appState.gameInvite,
          },
        }
      );

      const gameContainer = document.querySelector(
        ".game-container"
      ) as HTMLDivElement;

      const ball = new Ball(
        document.querySelector(".game-container .ball") as HTMLDivElement,
        gameContainer.getBoundingClientRect()
      );

      const playerOnePaddle = new Paddle(
        document.querySelector(
          ".game-container .left-paddle"
        ) as HTMLDivElement,
        "left",
        "HUMANE"
      );
      const playerTwoPaddle = new Paddle(
        document.querySelector(
          ".game-container .right-paddle"
        ) as HTMLDivElement,
        "right",
        "AI"
      );
      let wPressed = false;
      let sPressed = false;

      document.addEventListener("mousemove", (e: MouseEvent) => {
        const mouseYPosInContainer =
          e.clientY - gameContainer.getBoundingClientRect().top;
        let positionInPercent = Math.round(
          (mouseYPosInContainer /
            gameContainer.getBoundingClientRect().height) *
            100
        );

        positionInPercent =
          positionInPercent > 100
            ? 100
            : positionInPercent < 0
            ? 0
            : positionInPercent;

        gameSocket.current?.emit("mouseMove", positionInPercent);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "w" || e.key === "ArrowUp") {
          if (wPressed) return;
          gameSocket.current?.emit("keydown", "w");
          wPressed = true;
        }
        if (e.key === "s" || e.key === "ArrowDown") {
          if (sPressed) return;
          gameSocket.current?.emit("keydown", "s");
          sPressed = true;
        }
      });
      document.addEventListener("keyup", (e) => {
        if (e.key === "w" || e.key === "ArrowUp") {
          if (!wPressed) return;
          gameSocket.current?.emit("keyup", "w");
          wPressed = false;
        }
        if (e.key === "s" || e.key === "ArrowDown") {
          if (!sPressed) return;
          gameSocket.current?.emit("keyup", "s");
          sPressed = false;
        }
      });

      // release all keys on window focus out
      window.addEventListener("blur", () => {
        gameSocket.current?.emit("keyup", "w");
        gameSocket.current?.emit("keyup", "s");
      });

      // }
      // gameSocket.current?.on("connect", () =>
      //   console.log("connected to game server")
      // );
      // gameSocket.current?.on("disconnect", () =>
      //   console.log("disconnected from game server")
      // );
      gameSocket.current?.on("liveScore", (data) => {
        const score = document.querySelector(".score") as HTMLDivElement;
        score.textContent = `${data.player1Score}-${data.player2Score}`;
      });
      gameSocket.current?.on("decidePlayer", (data) => (mySide = data));
      gameSocket.current?.on("gameOver", async (data) => {
        if (data === "you won") {
          setGameResult("You Won");
        } else {
          setGameResult("You Lost");
        }
        timeOutReturn.current = setTimeout(() => {
          navigate("/profile");
          dispatch(
            changeNotificationAlertValue({
              alertContent: data,
              color: data === "you lost" ? "danger" : "success",
            })
          );
        }, 4000);
      });
      gameSocket.current?.on("matched", (game) => {
        const playerOneElement = document.querySelector(".player-one")!;
        const playerTwoElement = document.querySelector(".player-two")!;
        const score = document.querySelector(".score") as HTMLDivElement;

        score.textContent = "0-0";
        (
          playerOneElement.querySelector(".avatar") as HTMLImageElement
        ).innerHTML = `<img class="size-12 rounded-full" src="${game.playersInfo.player1Avatar}" alt="avatar" />`;
        (
          playerTwoElement.querySelector(".avatar") as HTMLImageElement
        ).innerHTML = `<img class="size-12 rounded-full" src="${game.playersInfo.player2Avatar}" alt="avatar" />`;

        (
          playerOneElement.querySelector(".username") as HTMLDivElement
        ).textContent = game.playersInfo.player1Displayname;
        (
          playerTwoElement.querySelector(".username") as HTMLDivElement
        ).textContent = game.playersInfo.player2Displayname;
        dispatch(
          changeNotificationAlertValue({
            alertContent: "Got Matched with another player",
            color: "success",
          })
        );
        const loading = document.querySelector(
          ".game-box .game-container .waiting-box"
        );

        loading?.classList.add("invisible");
      });

      function renderFrame(frameData: frameDataObj) {
        ball.x = `${frameData.ballX}`;
        ball.y = `${frameData.ballY}`;
        playerOnePaddle.position = frameData.Player1Paddle;
        playerTwoPaddle.position = frameData.Player2Paddle;
      }
      gameSocket.current?.on("frame", renderFrame);
    });
    return () => {
      gameSocket.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (gameResult.length) {
        clearTimeout(timeOutReturn.current);
      }
    };
  });

  return (
    <motion.div
      className="game-box"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="header h-[5vh] min-h-14 flex items-center justify-between">
        <div className="player-one flex items-center space-x-1">
          <div className="avatar">
            <Skeleton variant="circular" width={40} height={40} />
          </div>
          <div className="username text-lg font-bold text-[--text-blue] truncate w-14 md:w-52">
            <Skeleton width={100} />
          </div>
        </div>
        <div className="score text-xl transition text-[--text-blue] md:text-4xl font-bold">
          <Skeleton width={50} />
        </div>
        <div className="player-two flex-row-reverse flex items-center">
          <div className="avatar">
            <Skeleton variant="circular" width={40} height={40} />
          </div>
          <div className="username text-lg font-bold text-[--text-blue] mr-1 truncate w-14 md:w-52 text-right">
            <Skeleton width={100} className="ml-auto" />
          </div>
        </div>
      </div>
      <motion.div
        className={`game-container h-[80vh] rounded relative z-10 overflow-hidden border-8 border-[--blue]`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="game-map"
          style={{
            backgroundImage: `url(${
              appState.gameMap === "Forest"
                ? Forest
                : appState.gameMap === "Anime"
                ? Anime
                : Sunrise
            })`,
          }}
        ></div>
        <div className="center-line w-1 h-full bg-[--blue] absolute left-1/2 -translate-x-1/2"></div>
        <div
          className="center-circle w-36 md:w-52 xl:w-96 h-36 md:h-52 xl:h-96 border-[5px] border-[--blue] rounded-full
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        ></div>
        <div className={`paddle left-paddle`}></div>
        <div className={`paddle right-paddle`}></div>
        <div className={`ball text-[--blue]`}>
          <FaVolleyballBall className="ball-svg w-8 md:w-10 h-8 md:h-10 animate-spin z-50 bg-indigo-400 rounded-full" />
        </div>
        <div className="waiting-box">
          <div className="black-bg absolute top-0 left-0 w-full h-full bg-black bg-opacity-80"></div>
          <div className="waiting-opponent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <img src={watingImg} alt="waiting gif" />
            <div className="text-[--text-blue] text-xl font-bold text-center animate-pulse">
              waiting to get matched with another player
            </div>
          </div>
        </div>
        {gameResult.length ? (
          <motion.div
            className={`result-text absolute top-1/2 left-1/2 ${
              gameResult === "You Won" ? "text-green-400" : "text-red-400"
            } text-4xl font-bold text-center`}
            initial={{
              opacity: 1,
              scale: 1,
              originX: 0.5,
              originY: 0.5,
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{ opacity: 0, scale: 3 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            {gameResult}
          </motion.div>
        ) : (
          ""
        )}
      </motion.div>
    </motion.div>
  );
}
