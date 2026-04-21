import connectDB from "./db";
import { scheduleSubscriptionJobs } from "./bullmq/schedulers/subscriptionScheduler";
import { logger } from "./utils/logger";

const startScheduler = async () => {
  try {
    await connectDB();
    await scheduleSubscriptionJobs();
    logger.info("Scheduler process started");
  } catch (error) {
    logger.error({ err: error }, "Scheduler startup failed");
    process.exit(1);
  }
};

startScheduler();
