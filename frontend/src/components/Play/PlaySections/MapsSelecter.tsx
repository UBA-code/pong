import { useEffect } from "react";
import forest from "../../../assets/GameAssets/forest-preview.jpg";
import anime from "../../../assets/GameAssets/anime-preview.jpg";
import sunRise from "../../../assets/GameAssets/sunrise-preview.jpg";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setMap } from "../../../redux/slices/appSlice";

interface mapImgBoxProp {
  img: string;
  mapName: "Forest" | "Anime" | "Sunrise";
  active?: boolean;
}

function MapImgBox({ img, mapName, active }: mapImgBoxProp) {
  const dispatch = useDispatch();
  return (
    <motion.div
      className={`mapImgBox rounded transition cursor-pointer overflow-hidden hover:brightness-75 ${
        active ? "active" : ""
      }`}
      onClick={() => dispatch(setMap(mapName))}
    >
      <div className="map-img max-w-[300px] ">
        <img
          className="rounded-t w-full"
          src={img}
          alt=" map picture"
          referrerPolicy="no-referrer"
        />
      </div>
      <motion.div
        className={`map-name transition text-center bg-[--light-periwinkle]
          py-4 rounded-b text-[--text-blue] font-bold text-2xl tracking-wide`}
      >
        {mapName}
      </motion.div>
    </motion.div>
  );
}

export default function MapsSelecter() {
  useEffect(() => {
    const maps = document.querySelectorAll(
      ".maps-selecter-container .box-content .mapImgBox"
    );

    maps.forEach((e) => {
      e.addEventListener("click", () => {
        maps.forEach((e) => e.classList.remove("active"));
        e.classList.add("active");
      });
    });
  }, []);
  return (
    <div className="maps-selecter-container section-box row-start-2 row-end-4">
      <div className="section-box-title box-title">Maps</div>
      <div className="box-content h-[calc(100%-5rem)] flex justify-evenly items-center flex-wrap gap-2 py-2">
        <MapImgBox img={forest} mapName="Forest" active />
        <MapImgBox img={anime} mapName="Anime" />
        <MapImgBox img={sunRise} mapName="Sunrise" />
      </div>
    </div>
  );
}
