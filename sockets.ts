import { createAdapter } from '@socket.io/redis-adapter';
import { Server } from 'socket.io';
import { getRedisInstance } from './app/helpers/getRedisInstance.js';
import sessionStorage from './sessionStorage.js';

export function setupSockets({ server, app }: { server: any, app: any }) {

  let redis;

  const isRedisQueue = (process.env.DOCUMENTS_ADAPTER === 'DOCUMENT_DB');

  if (isRedisQueue) {
    redis = getRedisInstance();
  }

  if (redis) {
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
        return next(new Error('Authentication error: No cookie provided'));
      }

      try {
        const session = await sessionStorage.getSession(cookieHeader);

        const user = session.get('user');

        if (!user) {
          return next(new Error('Authentication error: Invalid session'));
        }
        // @ts-ignore
        socket.user = user;
        next();

      } catch (error) {
        return next(new Error('Authentication error: Session could not be parsed'));
      }
    });

    io.on('connection', (socket) => {
      // @ts-ignore
      console.log(`Client connected: ${socket.id}, User: ${socket.user.username}`);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  } else {

    let socket: any = {};

    app.use((req: any, res: any, next: any) => {
      req.io = socket; // Attach the main 'io' server instance to every HTTP request
      next();
    });
    // @ts-ignore
    app.use(async (req, res, next) => {
      //console.log(req, res);
      if (req.path.startsWith('/api/sockets')) {
        const cookieHeader = req.headers.cookie;

        if (!cookieHeader) {
          return next(new Error('Authentication error: No cookie provided'));
        }

        try {
          const session = await sessionStorage.getSession(cookieHeader);

          const user = session.get('user');

          if (!user) {
            return next(new Error('Authentication error: Invalid session'));
          }
          // @ts-ignore
          socket.user = user;

          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.flushHeaders();
          const connectionMessage = { "type": "connected" };
          res.write(`data: ${JSON.stringify(connectionMessage)}\n\n`);

          socket.emit = (event: string, data: any) => {
            const message = { "type": "message", event, data };
            res.write(`data: ${JSON.stringify(message)}\n\n`);
          }
          req.io = socket;

          return;

        } catch (error) {
          return next(new Error('Authentication error: Session could not be parsed'));
        }

      }


      next();

    });

  }



}
