import Redis from "ioredis";

const redis = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: Number(process.env.REDIS_PORT) || 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000)
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis Error:", err));

export default redis;
