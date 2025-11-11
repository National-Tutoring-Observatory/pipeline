import { createRequestHandler } from "@react-router/express";
import express from "express";
import "react-router";
import { RouterContextProvider } from "react-router";
import type { Server } from "socket.io";

declare module "react-router" {
  interface RouterContextProvider {
    io: Server;
  }
}

export const app = express();

app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io/')) {
    return next();
  }
  if (req.path.startsWith('/api/sockets')) {
    return next();
  }
  return createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
    getLoadContext(req: any) {
      const loadContext = {
        io: req.io
      };
      let context = new RouterContextProvider();
      Object.assign(context, loadContext);
      return context;
    },
  })(req, res, next);
});
