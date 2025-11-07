import each from 'lodash/each';
import isMatch from 'lodash/isMatch';
import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import { getSockets } from "~/modules/sockets/sockets";

export default function useHandleSockets({ event, matches, callback }: { event: string, matches: any[], callback: (payload: any) => any }) {
  useEffect(() => {

    let sockets: Socket | null;

    const handleSocketsCallback = (payload: any) => {
      each(matches, (match) => {
        if (isMatch(payload, match)) {
          callback(payload);
        }
      })
    }

    const connectSockets = async () => {
      sockets = await getSockets() as any;
      if (sockets) {
        sockets.on(event, handleSocketsCallback)
      }
    }

    connectSockets();

    return () => {
      if (sockets) {
        sockets.off(event, handleSocketsCallback);
      }
    }
  }, []);
}
