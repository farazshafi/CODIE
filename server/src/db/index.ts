import mongoose from "mongoose";
import { ENV } from "../config/env";
import { logger } from "../utils/logger";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(ENV.DATABASE_URL);
    logger.info({ host: connection.connection.host }, "✅ MongoDB connected");
  } catch (error) {
    logger.error({ err: error }, "❌ MongoDB connection error");
    process.exit(1);
  }
};

export default connectDB;