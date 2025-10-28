import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import crypto from "crypto";
import { paymentRepository, subscriptionRepository, userRepository, userSubscriptionRepository } from "../container";

dotenv.config();

async function seedPayments() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");

    const users = await userRepository.find({});
    const userSubscriptions = await userSubscriptionRepository.find({});
    const subscriptions = await subscriptionRepository.find({});

    if (users.length === 0 || subscriptions.length === 0 || userSubscriptions.length === 0) {
      console.error("❌ Need users, subscriptions, and userSubscriptions before seeding payments!");
      process.exit(1);
    }

    await paymentRepository.deleteMany({});
    console.log("🧹 Cleared old payments");

    const payments = [];

    for (const userSub of userSubscriptions) {
      const plan = subscriptions.find(s => s._id.toString() === userSub.planId.toString());
      if (!plan) continue;

      // Randomly decide payment status
      const statusChance = faker.number.int({ min: 1, max: 100 });
      let paymentStatus: "completed" | "pending" | "failed";
      if (statusChance <= 80) paymentStatus = "completed";
      else if (statusChance <= 95) paymentStatus = "pending";
      else paymentStatus = "failed";

      // Use existing payment time if available
      const paymentDate =
        userSub.paymentOptions.paymentTime ||
        faker.date.between({
          from: new Date(2025, 8, 1),
          to: new Date(2025, 9, 25),
        });

      const payment = {
        userId: userSub.userId,
        subscriptionId: userSub.planId,
        amount: plan.pricePerMonth || faker.number.int({ min: 199, max: 1499 }), // fallback if missing
        currency: "INR",
        paymentStatus,
        transactionId: `pay_${crypto.randomBytes(8).toString("hex")}`,
        paymentDate,
        createdAt: paymentDate,
        updatedAt: faker.date.between({ from: paymentDate, to: new Date() }),
      };

      payments.push(payment);
    }

    await paymentRepository.insertMany(payments);
    console.log(`💰 Inserted ${payments.length} payments successfully!`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Payment seeding failed:", err);
    process.exit(1);
  }
}

seedPayments();
