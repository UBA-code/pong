import { MutableRefObject, useCallback } from "react";
import { Socket, io } from "socket.io-client";
import getToken from "../getToken";

export default function useInitSocket() {
  const handler = useCallback(
    (
      url: string,
      socket: MutableRefObject<Socket | undefined>,
      setState?: (e: boolean) => void
    ) => {
      getToken().then((token) => {
        socket.current = io(url, {
          auth: {
            token,
          },
        });
        socket.current.on("connect", () => {
          if (setState) {
            setState(true);
          }
        });
      });
    },
    []
  );
  return handler;
}
