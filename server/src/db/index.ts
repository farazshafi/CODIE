import mongoose from "mongoose";
import dns from "dns";
import { ENV } from "../config/env";
import { logger } from "../utils/logger";

const connectDB = async () => {
  try {
    try {
      dns.setDefaultResultOrder("ipv4first");
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch {
      // Ignore DNS override if restricted by container environment
    }
    const connection = await mongoose.connect(ENV.DATABASE_URL);
    logger.info({ host: connection.connection.host }, "✅ MongoDB connected");
  } catch (error) {
    logger.error({ err: error }, "❌ MongoDB connection error");
    process.exit(1);
  }
};

export default connectDB;