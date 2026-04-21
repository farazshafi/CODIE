import Redis from "ioredis";
import { logger } from "../utils/logger";

const isLocal = String(process.env.REDIS_LOCAL).toLowerCase() === "true";
const redisUrl = process.env.REDIS_URL;

const redis = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      tls: redisUrl.startsWith("rediss://") ? {} : undefined
    })
  : new Redis({
      host: process.env.REDIS_HOST || (isLocal ? "localhost" : "redis"),
      port: Number(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: null
    });


redis.on("connect", () => logger.info("✅ Redis connected"));
redis.on("error", (err) => logger.error({ err }, "❌ Redis Error"));

export default redis;
