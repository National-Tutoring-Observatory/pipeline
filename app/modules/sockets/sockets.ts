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

export function connectSockets(isAppRunningLocally: boolean) {

  if (isAppRunningLocally) {

    let socket: any = {
      on: (event: string, callback: (data: any) => void) => {
        socket.listeners[event] = socket.listeners[event] || []
        socket.listeners[event].push(callback);
      },
      listeners: {}
    };
    const eventSource = new EventSource("/api/sockets");

    eventSource.onopen = () => {
      console.log('Sockets: connected');
    }

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'connected') return;
      if (data.type === 'message') {
        if (socket.listeners[data.event]) {
          for (const listener of socket.listeners[data.event]) {
            listener(data.data);
          }
        }
      }
    };

    SOCKETS = socket;
    // TODO
    //eventSource.close();

  } else {
    const socket = io(window.location.origin, {
      transports: ["polling"],
      reconnection: true,
      reconnectionDelay: 200,
      reconnectionAttempts: 20,
      randomizationFactor: 0,
      withCredentials: true
    });
    socket.on('connect', () => {
      console.log('Sockets: connected');
    });
    socket.on(`disconnect`, (message: string) => {
      console.log(`Sockets: disconnected due to ${message}`);
    });

    SOCKETS = socket;
    return SOCKETS;
  }
}
