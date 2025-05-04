import Redis from "ioredis";

const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000)
});

redis.on("connect", () => console.log("Redis connected".green))
redis.on("error", (err) => console.log("Redis Error: ".red, err))

export default redis