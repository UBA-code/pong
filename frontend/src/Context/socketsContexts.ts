import { createContext } from "react";
import { Socket } from "socket.io-client";

export const mainSocketContext = createContext<Socket | undefined>(undefined);
export const chatSocketContext = createContext<Socket | undefined>(undefined);
