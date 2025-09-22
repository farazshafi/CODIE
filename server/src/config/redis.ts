import Redis from "ioredis";
import { logger } from "../utils/logger";

const redis = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: Number(process.env.REDIS_PORT) || 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: null
});

redis.on("connect", () => logger.info("✅ Redis connected"));
redis.on("error", (err) => logger.error({ err }, "❌ Redis Error"));

export default redis;
