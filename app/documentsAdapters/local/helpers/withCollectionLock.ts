import { Redlock } from "@sesamecare-oss/redlock";
import { getRedisInstance } from "../../../helpers/getRedisInstance.js";

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_RETRY_DELAY = 200; // ms

const redis = getRedisInstance();

const redlock = new Redlock([redis], {
  retryCount: 100,
  retryDelay: DEFAULT_RETRY_DELAY,
  retryJitter: 50,
});

export default function withCollectionLock<T extends { collection: string }, R>(
  fn: (args: T) => Promise<R>,
  opts?: { timeoutMs?: number }
): (args: T) => Promise<R> {
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return async (args: T) => {
    const { collection } = args;
    const resource = `locks:local:documents:${collection}`;
    const ttl = timeoutMs;

    try {
      const lock = await redlock.acquire([resource], ttl);
      try {
        const res = await fn(args);
        return res;
      } finally {
        await lock.release();
      }
    } catch (err: any) {
      console.error(err)
      throw new Error(`Error acquiring lock for collection '${collection}'`);
    }
  };
}
