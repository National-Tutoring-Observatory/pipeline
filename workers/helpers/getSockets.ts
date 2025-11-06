let SOCKETS: Emitter;
import { Emitter } from '@socket.io/redis-emitter';
import { createClient } from 'redis';

export default async () => {

  if (SOCKETS) return SOCKETS;

  const pubClient = createClient({
    socket: {
      tls: process.env.REDIS_URL?.startsWith('rediss://') || undefined
    },
    pingInterval: 4 * 60 * 1000,
    url: process.env.REDIS_URL
  });
  pubClient.on('error', (err) => console.log('PubClient:Redis Client Error', err));

  await pubClient.connect();

  const io = new Emitter(pubClient);
  SOCKETS = io;
  return SOCKETS;
};
