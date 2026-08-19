import Redis from "ioredis";

let redisClient = null;

export const initializeRedis = () => {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL is not configured; Redis caching is disabled.");
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    connectTimeout: 2000,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: (attempt) => (attempt > 3 ? null : attempt * 200),
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis");
  });

  redisClient.on("error", (error) => {
    console.warn(`Redis is unavailable; continuing without cache: ${error.message}`);
  });

  redisClient.connect().catch((error) => {
    console.warn(`Unable to initialize Redis; continuing without cache: ${error.message}`);
  });

  return redisClient;
};

export const getRedisClient = () =>
  redisClient?.status === "ready" ? redisClient : null;

export const deleteRedisKey = async (key) => {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  try {
    await client.del(key);
  } catch (error) {
    console.warn(`Unable to delete Redis cache entry: ${error.message}`);
  }
};
