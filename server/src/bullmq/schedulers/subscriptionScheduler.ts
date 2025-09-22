import subscriptionQueue from "../queues/subscriptionQueue";
import { logger } from "../../utils/logger";

const scheduleSubscriptionJobs = async () => {
  await subscriptionQueue.add("applyDowngrade", {}, {
    jobId: "applyDowngrade",
    repeat: { pattern: "0 1 * * *" }
  });

  await subscriptionQueue.add("sendExpiryReminder", {}, {
    jobId: "sendExpiryReminder",
    repeat: { pattern: "0 1 * * *" }
  });

  logger.info("✅ Subscription jobs scheduled");
  process.exit(0);
};

scheduleSubscriptionJobs();
