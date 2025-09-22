import { Worker } from "bullmq";
import { userSubscriptionService } from "../../container";
import redis from "../../config/redis";
import { logger } from "../../utils/logger";

const subscriptionWorker = new Worker(
  "subscription",
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, "Processing job");
    try {
      switch (job.name) {
        case "applyDowngrade":
          await userSubscriptionService.applyDowngrade();
          break;
        case "sendExpiryReminder":
          await userSubscriptionService.sendExpiryReminder();
          break;
        default:
          logger.warn({ jobId: job.id }, `Unknown job name: ${job.name}`);
      }
    } catch (err) {
      logger.error({ jobId: job.id, err }, "Job failed");
      throw err;
    }
  },
  { connection: redis }
);

logger.info("✅ Subscription Worker started");

export default subscriptionWorker;
