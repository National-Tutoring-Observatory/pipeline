import { createRequestHandler } from "@react-router/express";
import express from "express";
import "react-router";

declare module "react-router" {
  interface AppLoadContext {

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
      return {
        io: req.io
      };
    },
  })(req, res, next);
});
