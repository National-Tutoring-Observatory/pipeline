import { io } from "socket.io-client";
let SOCKETS: any = null;

export async function getSockets() {
  const promise = new Promise((resolve) => {
    const checkSockets = () => {
      if (SOCKETS) {
        resolve(SOCKETS);
      } else {
        setTimeout(() => {
          checkSockets();
        }, 100);
      }
    };
    checkSockets();
  });
  return promise;
}

export function connectSockets() {
  if (SOCKETS) return SOCKETS;
  const socket = io(window.location.origin, {
    reconnection: true,
    reconnectionDelay: 200,
    reconnectionAttempts: 20,
    randomizationFactor: 0,
    withCredentials: true,
  });
  socket.on("connect", () => {
    console.log("Sockets: connected");
  });
  socket.on(`disconnect`, (message: string) => {
    SOCKETS = null;
    console.log(`Sockets: disconnected due to ${message}`);
  });

  SOCKETS = socket;
  return SOCKETS;
}
