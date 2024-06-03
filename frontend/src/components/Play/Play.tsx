import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCurrentPage, setGameSettings } from "../../redux/slices/appSlice";
import "./css/Play.css";
import GameSettings from "./PlaySections/GameSettings";
import Friends from "./PlaySections/Friends";
import MapsSelecter from "./PlaySections/MapsSelecter";
import Button from "../../Helpers/components/Button";
import { motion } from "framer-motion";

//? icons

import { IoGameControllerOutline } from "react-icons/io5";
import { animtedRoutesVariants } from "../../Helpers/motionVariants";
import { useNavigate } from "react-router";
import { BsRobot } from "react-icons/bs";

export interface customSettings {
  scoreToWin: string;
  playerServes: string;
  serveDelay: string;
  playWithBot?: boolean;
  botLevel: string;
}

function getGameSettings() {
  const gameSettingsObj: customSettings = {
    scoreToWin: "",
    playerServes: "random",
    serveDelay: "",
    botLevel: "medium",
  };
  const winingScoreElements = document.querySelectorAll(
    ".game-settings .winning-score .choices .selecter"
  );
  const playerServesElements = document.querySelectorAll(
    ".game-settings .player-serves .choices .selecter"
  );
  const serveDelayElements = document.querySelectorAll(
    ".game-settings .serve-delay .selecter"
  );

  const botLevelElements = document.querySelectorAll(
    ".game-settings .bot-level .selecter"
  );

  winingScoreElements.forEach((e) =>
    e.classList.contains("active")
      ? (gameSettingsObj.scoreToWin = e.textContent || "")
      : ""
  );

  playerServesElements.forEach(
    (e) =>
      e.classList.contains("active") &&
      (gameSettingsObj.playerServes = e.textContent || "")
  );

  serveDelayElements.forEach((e) => {
    if (e.classList.contains("active"))
      gameSettingsObj.serveDelay = e.textContent || "";
  });

  botLevelElements.forEach((e) => {
    if (e.classList.contains("active"))
      gameSettingsObj.botLevel = e.textContent || "";
  });
  return gameSettingsObj;
}

export default function Play() {
  const [hasCustomSettings, setHasCustomSettings] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChangeChoices = useCallback(
    (clickedELement: Event, currentChoices: NodeListOf<Element>) => {
      currentChoices.forEach((lopedElem) =>
        lopedElem.classList.remove("active")
      );

      (clickedELement.target as HTMLButtonElement).classList.add("active");
      if (
        (clickedELement.target as HTMLButtonElement).classList.contains(
          "customSettingsIsEnabled"
        )
      ) {
        setHasCustomSettings(true);
      } else if (
        (clickedELement.target as HTMLButtonElement).classList.contains(
          "customSettingsIsDisabled"
        )
      ) {
        setHasCustomSettings(false);
      }
    },
    []
  );

  useEffect(() => {
    const choicesArr = document.querySelectorAll(
      ".playground-container .game-settings .choices"
    );
    choicesArr.forEach((e) => {
      const currentChoices = e.querySelectorAll(".selecter");

      currentChoices.forEach((elem) => {
        elem.addEventListener("click", (clickedELement) =>
          handleChangeChoices(clickedELement, currentChoices)
        );
      });
    });
    return () => {
      choicesArr.forEach((e) => {
        const currentChoices = e.querySelectorAll(".selecter");

        currentChoices.forEach((elem) => {
          elem.removeEventListener("click", (clickedELement) =>
            handleChangeChoices(clickedELement, currentChoices)
          );
        });
      });
    };
  }, [hasCustomSettings]);

  useEffect(() => {
    dispatch(setCurrentPage("Play"));
  }, [dispatch]);

  return (
    <motion.div
      className={`playground-container transition bg-[--white-bg] rounded-lg p-2 md:p-6 space-y-6 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-[1fr,30%]
                lg:grid-rows-[2fr,2fr,0.5fr]`}
      variants={animtedRoutesVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      <GameSettings customSettings={hasCustomSettings} />
      <Friends />
      <MapsSelecter />
      <div className="start-game-btn self-end space-y-1">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 1 }}>
          <Button
            content="Start Game"
            icon={<IoGameControllerOutline size={25} />}
            onclick={() => {
              const customSettingsPropertys = getGameSettings();
              dispatch(
                setGameSettings(
                  hasCustomSettings ? customSettingsPropertys : null
                )
              );
              navigate("/game");
            }}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 1 }}>
          <Button
            content="Play with Bot"
            icon={<BsRobot size={25} />}
            onclick={() => {
              const customSettingsPropertys = getGameSettings();
              dispatch(
                setGameSettings(
                  hasCustomSettings
                    ? { ...customSettingsPropertys, playWithBot: true }
                    : { playWithBot: true }
                )
              );
              navigate("/game");
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
