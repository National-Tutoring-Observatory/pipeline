import { createAdapter } from "@socket.io/redis-adapter";
import type { Application, NextFunction, Request, Response } from "express";
import type { Server as HttpServer } from "http";
import type { Socket } from "socket.io";
import { Server } from "socket.io";
import { getRedisInstance } from "./app/helpers/getRedisInstance";
import sessionStorage from "./sessionStorage";

declare module "express-serve-static-core" {
  interface Request {
    io: Server;
  }
}

type AuthenticatedSocket = Socket & { user: { username: string } };

export function setupSockets({
  server,
  app,
}: {
  server: HttpServer;
  app: Application;
}) {
  const redis = getRedisInstance();

  const io = new Server(server);

  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();

  const onRedisError = (err: Error) =>
    console.error("[sockets] Redis error:", err.message);
  redis.on("error", onRedisError);
  pubClient.on("error", onRedisError);
  subClient.on("error", onRedisError);

  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.io = io; // Attach the main 'io' server instance to every HTTP request
    next();
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.use(async (socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Authentication error: No cookie provided"));
    }

    try {
      const session = await sessionStorage.getSession(cookieHeader);

      const user = session.get("user");

      if (!user) {
        return next(new Error("Authentication error: Invalid session"));
      }
      (socket as AuthenticatedSocket).user = user;
      next();
    } catch {
      return next(
        new Error("Authentication error: Session could not be parsed"),
      );
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `Client connected: ${socket.id}, User: ${(socket as AuthenticatedSocket).user.username}`,
    );

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
