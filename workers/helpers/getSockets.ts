let SOCKETS: Emitter;
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";

export default async () => {
  if (SOCKETS) return SOCKETS;

  let redisUrl;
  if (process.env.REDIS_LOCAL === "true") {
    redisUrl = "redis://localhost:6379";
  } else if (process.env.REDIS_URL) {
    redisUrl = process.env.REDIS_URL;
  } else {
    throw new Error(
      "Redis connection required. Set REDIS_LOCAL=true for local development or REDIS_URL for external Redis",
    );
  }

  const pubClient = createClient({
    socket: {
      tls: redisUrl.startsWith("rediss://") || undefined,
    },
    pingInterval: 4 * 60 * 1000,
    url: redisUrl,
  });
  pubClient.on("error", (err) =>
    console.log("PubClient:Redis Client Error", err),
  );

  await pubClient.connect();

  const io = new Emitter(pubClient);
  SOCKETS = io;
  return SOCKETS;
};
