import { Worker } from "bullmq";
import { userSubscriptionService } from "../../container";
import redis from "../../config/redis";

const subscriptionWorker = new Worker(
  "subscription",
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    try {
      switch (job.name) {
        case "applyDowngrade":
          await userSubscriptionService.applyDowngrade();
          break;
        case "sendExpiryReminder":
          await userSubscriptionService.sendExpiryReminder();
          break;
        default:
          console.error(`Unknown job name: ${job.name}`);
      }
    } catch (err) {
      console.error(`Job ${job.id} failed:`, err);
      throw err;
    }
  },
  {
    connection: redis,
  }
);

export default subscriptionWorker;
