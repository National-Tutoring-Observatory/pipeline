import { createAdapter } from "@socket.io/redis-adapter";
import { Server } from "socket.io";
import { getRedisInstance } from "./app/helpers/getRedisInstance.js";
import sessionStorage from "./sessionStorage.js";

export function setupSockets({ server, app }: { server: any; app: any }) {
  const redis = getRedisInstance();

  const io = new Server(server);

  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();

  app.use((req: any, res: any, next: any) => {
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
      // @ts-ignore
      socket.user = user;
      next();
    } catch (error) {
      return next(
        new Error("Authentication error: Session could not be parsed"),
      );
    }
  });

  io.on("connection", (socket) => {
    console.log(
      // @ts-expect-error user is attached by auth middleware
      `Client connected: ${socket.id}, User: ${socket.user.username}`,
    );

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
