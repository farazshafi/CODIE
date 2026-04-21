import connectDB from "./db";
import "./bullmq/workers/subscriptionWorker";
import { logger } from "./utils/logger";

const startWorker = async () => {
  try {
    await connectDB();
    logger.info("Worker process started");
  } catch (error) {
    logger.error({ err: error }, "Worker startup failed");
    process.exit(1);
  }
};

startWorker();
