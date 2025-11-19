import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import crypto from "crypto";
import {
  paymentRepository,
  subscriptionRepository,
  userRepository,
  userSubscriptionRepository,
} from "../container";

dotenv.config();

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// return a random Date inside a given month (year, monthIndex are numbers). monthIndex is 0-based.
function randomDateInMonth(year: number, monthIndex: number, maxDayInclusive?: number) {
  const first = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  // determine last day of month
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const lastDayAllowed = Math.min(lastDay, maxDayInclusive ?? lastDay);
  const day = randomInt(1, lastDayAllowed);
  // produce random hour/min/sec within that day
  const hour = randomInt(0, 23);
  const minute = randomInt(0, 59);
  const second = randomInt(0, 59);
  return new Date(year, monthIndex, day, hour, minute, second);
}

async function seedPayments() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");

    const users = await userRepository.find({});
    const userSubscriptions = await userSubscriptionRepository.find({});
    const subscriptions = await subscriptionRepository.find({});

    if (users.length === 0 || subscriptions.length === 0) {
      console.error(
        "❌ Need users and subscriptions before seeding payments! (userSubscriptions optional)"
      );
      process.exit(1);
    }

    // Clear old payments
    await paymentRepository.deleteMany({});
    console.log("🧹 Cleared old payments");

    const payments: Array<Record<string, any>> = [];

    // Which months we will use: September, October, November 2025
    // months are 0-indexed: Sept=8, Oct=9, Nov=10
    const YEAR = 2025;
    const MONTH_OPTIONS = [8, 9, 10]; // Sept, Oct, Nov

    // Current time used to clamp November dates so we don't generate future timestamps
    const now = new Date();

    for (const user of users) {
      // Find a userSubscription for this user if exists, otherwise choose a random subscription
      const userSub = userSubscriptions.find(
        (us) => us.userId?.toString() === user._id?.toString()
      );
      let plan: any = null;
      if (userSub) {
        plan = subscriptions.find((s) => s._id.toString() === userSub.planId.toString());
      }
      if (!plan) {
        // pick random subscription as fallback
        plan = subscriptions[randomInt(0, subscriptions.length - 1)];
      }

      // decide payment status with similar distribution
      const statusChance = randomInt(1, 100);
      let paymentStatus: "completed" | "pending" | "failed";
      if (statusChance <= 80) paymentStatus = "completed";
      else if (statusChance <= 95) paymentStatus = "pending";
      else paymentStatus = "failed";

      // pick a random month from September/October/November
      const monthIndex = MONTH_OPTIONS[randomInt(0, MONTH_OPTIONS.length - 1)];

      // if month is November (10) clamp max day to today's day to avoid future dates
      let maxDayInclusive: number | undefined = undefined;
      if (YEAR === now.getFullYear() && monthIndex === now.getMonth()) {
        maxDayInclusive = now.getDate();
      }

      // Generate paymentDate inside chosen month
      const paymentDate = randomDateInMonth(YEAR, monthIndex, maxDayInclusive);

      // createdAt = paymentDate
      const createdAt = paymentDate;

      // updatedAt: if paymentDate < now -> random between paymentDate and now, else createdAt
      let updatedAt: Date;
      if (paymentDate.getTime() < now.getTime()) {
        // ensure faker-safe interval, but we can just create a random timestamp between two dates
        const t0 = paymentDate.getTime();
        const t1 = now.getTime();
        const randTs = randomInt(t0, t1);
        updatedAt = new Date(randTs);
      } else {
        updatedAt = paymentDate;
      }

      const amount =
        (plan && (typeof plan.pricePerMonth === "number" ? plan.pricePerMonth : undefined)) ??
        faker.number.int({ min: 199, max: 1499 });

      const payment = {
        userId: user._id,
        subscriptionId: plan._id,
        amount,
        currency: "INR",
        paymentStatus,
        transactionId: `pay_${crypto.randomBytes(8).toString("hex")}`,
        paymentDate,
        createdAt,
        updatedAt,
      };

      payments.push(payment);
    }

    // Insert payments (one per user)
    if (payments.length > 0) {
      await paymentRepository.insertMany(payments);
    }

    console.log(`💰 Inserted ${payments.length} payments (one per user).`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Payment seeding failed:", err);
    process.exit(1);
  }
}

seedPayments();
