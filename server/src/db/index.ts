import mongoose from "mongoose";
import { ENV } from "../config/env";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(ENV.DATABASE_URL);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;