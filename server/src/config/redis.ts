import Redis from "ioredis";
import { logger } from "../utils/logger";

const isLocal = String(process.env.REDIS_LOCAL).toLowerCase() === "true";

const redis = isLocal && process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      tls: process.env.REDIS_URL.startsWith("rediss://") ? {} : undefined
    })
  : new Redis({
      host: process.env.REDIS_HOST || "redis",
      port: Number(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: null
    });


redis.on("connect", () => logger.info("✅ Redis connected"));
redis.on("error", (err) => logger.error({ err }, "❌ Redis Error"));

export default redis;
