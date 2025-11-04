import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server } from 'socket.io';
import sessionStorage from './sessionStorage.js';

export function setupSockets({ server }) {

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

        socket.user = user;
        next();

      } catch (error) {
        return next(new Error('Authentication error: Session could not be parsed'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}, User: ${socket.user.username}`);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }



}
