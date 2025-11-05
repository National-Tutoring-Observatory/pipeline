import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server } from 'socket.io';
import sessionStorage from './sessionStorage.js';

export function setupSockets({ server, app }: { server: any, app: any }) {

  let redis;

  const isRedisQueue = (process.env.REDIS_URL && process.env.DOCUMENTS_ADAPTER === 'DOCUMENT_DB');

  if (isRedisQueue && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null
    });
    const io = new Server(server);

    const pubClient = redis.duplicate();
    const subClient = redis.duplicate();

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
    // @ts-ignore
    app.use(async (req, res, next) => {
      //console.log(req, res);
      if (req.path.startsWith('/api/sockets')) {
        let socket = {};
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
          const connectionMessage = { "event": "connected" };
          res.write(`data: ${JSON.stringify(connectionMessage)}\n\n`);

          return;

        } catch (error) {
          return next(new Error('Authentication error: Session could not be parsed'));
        }

      }


      next();

    });

  }



}
