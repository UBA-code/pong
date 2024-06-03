import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import Login from "./components/login/Login";
import Profile from "./components/Profile/Profile";
import Chat from "./components/Chat/Chat";
import Home from "./components/Home";
import Settings from "./components/Settings/Settings";
import LeaderBoard from "./components/LeaderBoard/LeaderBoard";
import { AnimatePresence } from "framer-motion";
import Play from "./components/Play/Play";
import {
  chatSocketContext,
  mainSocketContext,
} from "./Context/socketsContexts";
import { reInitSocketsContext } from "./Context/ReInitSockets";

import { Socket } from "socket.io-client";
import { useRef, useState, useEffect } from "react";
import useInitSocket from "./Helpers/Hooks/useInitSocket";
import { CircularProgress } from "@mui/material";

//? hooks

import Game from "./components/Game/Game";
import NotFound from "./notFound";
import TwoFactorPage from "./components/TwoFactorPage";
import RootLayout from "./components/RootLayout";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.key}>
        <Route path="/" element={<Home />}>
          <Route path="/" element={<RootLayout />}>
            <Route path="/" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/leaderboard" element={<LeaderBoard />} />
            <Route path="/Play" element={<Play />} />
            <Route path="/Game" element={<Game />} />
          </Route>
          <Route path="/2fa" element={<TwoFactorPage />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const mainSocket = useRef<Socket | undefined>();
  const chatSocket = useRef<Socket | undefined>();
  const [socketsInitialized, setSocketInitialized] = useState(false);
  const initSocket = useInitSocket();

  useEffect(() => {
    if (socketsInitialized) return;
    initSocket(
      `${import.meta.env.VITE_BACKEND_HOST}:${
        import.meta.env.VITE_BACKEND_PORT
      }`,
      mainSocket
    );
    initSocket(
      `${import.meta.env.VITE_BACKEND_HOST}:${
        import.meta.env.VITE_BACKEND_PORT
      }/chat`,
      chatSocket,
      setSocketInitialized
    );
  }, [socketsInitialized]);

  if (!socketsInitialized) {
    return (
      <CircularProgress
        size={50}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    );
  }

  return (
    <reInitSocketsContext.Provider value={setSocketInitialized}>
      <mainSocketContext.Provider value={mainSocket.current}>
        <chatSocketContext.Provider value={chatSocket.current}>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </chatSocketContext.Provider>
      </mainSocketContext.Provider>
    </reInitSocketsContext.Provider>
  );
}
