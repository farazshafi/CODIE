import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  REDIS_URL: process.env.REDIS_URL as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID as string,
  RAZORPAY_SECRET_ID: process.env.RAZORPAY_SECRET_ID as string,
};

if (!ENV.RAZORPAY_KEY_ID || !ENV.RAZORPAY_SECRET_ID) {
  console.warn("WARNING: Razorpay keys are missing from environment variables!");
}

