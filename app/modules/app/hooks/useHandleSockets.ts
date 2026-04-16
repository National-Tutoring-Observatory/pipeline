import each from "lodash/each";
import isMatch from "lodash/isMatch";
import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { getSockets } from "~/modules/sockets/sockets";

export default function useHandleSockets({
  event,
  matches,
  callback,
}: {
  event: string;
  matches: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (payload: any) => void;
}) {
  const matchesRef = useRef(matches);
  const callbackRef = useRef(callback);

  useEffect(() => {
    matchesRef.current = matches;
    callbackRef.current = callback;
  });

  useEffect(() => {
    let sockets: Socket | null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSocketsCallback = (payload: any) => {
      each(matchesRef.current, (match) => {
        if (isMatch(payload, match)) {
          callbackRef.current(payload);
        }
      });
    };

    const connectSockets = async () => {
      sockets = await getSockets();
      if (sockets) {
        sockets.on(event, handleSocketsCallback);
      }
    };

    connectSockets();

    return () => {
      if (sockets) {
        sockets.off(event, handleSocketsCallback);
      }
    };
  }, [event]);
}
