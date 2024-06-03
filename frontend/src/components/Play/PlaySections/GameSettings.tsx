import { AnimatePresence, motion } from "framer-motion";

export default function GameSettings({
  customSettings,
}: {
  customSettings: boolean;
}) {
  return (
    <div className="game-settings section-box col-start-1 col-end-2">
      <div className="section-box-title box-title">Game Settings</div>
      <div className="box-content max-w-[500px] mx-auto space-y-2 py-4">
        <div className="map-customization">
          <div className="title">Custom Settings</div>
          <div className="choices space-x-2 justify-evenly">
            <button className="selecter customSettingsIsDisabled w-[calc(100%/2)] text-sm">
              OFF
            </button>
            <button className="selecter customSettingsIsEnabled w-[calc(100%/2)] text-sm active">
              ON
            </button>
          </div>
        </div>
        <AnimatePresence>
          {customSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ originY: 0 }}
            >
              <div className="winning-score">
                <div className="title">Score to win</div>
                <div className="choices space-x-5 justify-between">
                  <button className="selecter w-[calc(100%/5)]" data->
                    3
                  </button>
                  <button className="selecter w-[calc(100%/5)]">5</button>
                  <button className="selecter w-[calc(100%/5)]">10</button>
                  <button className="selecter w-[calc(100%/5)] active">
                    15
                  </button>
                  <button className="selecter w-[calc(100%/5)]">20</button>
                </div>
              </div>
              <div className="player-serves">
                <div className="title">Who serves after score</div>{" "}
                <div className="choices space-x-2 justify-between">
                  <button className="selecter w-[calc(100%/3)] text-sm">
                    Last scored
                  </button>
                  <button className="selecter w-[calc(100%/3)] text-sm">
                    defeated
                  </button>
                  <button className="selecter w-[calc(100%/3)] text-sm active">
                    Random
                  </button>
                </div>
              </div>
              <div className="serve-delay">
                <div className="title">Serve delay</div>
                <div className="choices space-x-2 justify-between">
                  <button className="selecter w-[calc(100%/3)] text-sm">
                    immediately
                  </button>
                  <button className="selecter w-[calc(100%/3)] text-sm active">
                    1s
                  </button>
                  <button className="selecter w-[calc(100%/3)] text-sm">
                    2s
                  </button>
                </div>
              </div>
              <div className="bot-level">
                <div className="title">Bot level (for bot game)</div>
                <div className="choices space-x-2 justify-between">
                  <button className="selecter w-[calc(100%/3)] text-sm">
                    easy
                  </button>
                  <button className="selecter w-[calc(100%/3)] text-sm active">
                    medium
                  </button>
                  <button className="selecter w-[calc(100%/3)] text-sm">
                    win == 500dh
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
