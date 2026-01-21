import type { Redis, RedisOptions } from "ioredis";
import IORedis from "ioredis";

/**
 * Creates a new Redis instance
 *
 * Set REDIS_LOCAL='true' for local development (uses localhost:6379)
 * Set REDIS_URL for external Redis (production)
 */
export const getRedisInstance = (options?: RedisOptions): Redis => {
  let redisUrl: string;

  if (process.env.REDIS_LOCAL === "true") {
    redisUrl = "redis://localhost:6379";
  } else if (process.env.REDIS_URL) {
    redisUrl = process.env.REDIS_URL;
  } else {
    throw new Error(
      "Redis connection required. Set REDIS_LOCAL=true for local development or REDIS_URL for external Redis",
    );
  }

  return new IORedis(redisUrl, options || {});
};
