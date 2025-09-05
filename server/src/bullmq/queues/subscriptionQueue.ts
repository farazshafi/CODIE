import { Queue } from "bullmq";
import redis from "../../config/redis";

const subscriptionQueue = new Queue("subscription", {
  connection: redis,
});

export default subscriptionQueue;
