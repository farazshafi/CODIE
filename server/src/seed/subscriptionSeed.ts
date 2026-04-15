import mongoose from "mongoose";
import dotenv from "dotenv";
import { subscriptionRepository } from "../container";

dotenv.config();

export default async function seedSubscriptions() {
  try {
    console.log("📦 Seeding Subscription Plans...");
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");

    await subscriptionRepository.deleteMany({});
    console.log("🧹 Cleared old plans");

    const plans = [
      {
        name: "Free",
        pricePerMonth: 0,
        maxPrivateProjects: 1,
        maxCollaborators: 1,
        chatSupport: { text: false, voice: false },
        aiFeature: { codeSuggestion: false, codeExplanation: false },
        limits: { codeExecutionsPerDay: 10 },
        isVisible: true,
      },
      {
        name: "Pro",
        pricePerMonth: 499,
        maxPrivateProjects: 10,
        maxCollaborators: 5,
        chatSupport: { text: true, voice: false },
        aiFeature: { codeSuggestion: true, codeExplanation: true },
        limits: { codeExecutionsPerDay: 100 },
        isVisible: true,
      },
      {
        name: "Team",
        pricePerMonth: 999,
        maxPrivateProjects: 50,
        maxCollaborators: 20,
        chatSupport: { text: true, voice: true },
        aiFeature: { codeSuggestion: true, codeExplanation: true },
        limits: { codeExecutionsPerDay: 500 },
        isVisible: true,
      },
      {
        name: "Enterprise",
        pricePerMonth: 1999,
        maxPrivateProjects: 999,
        maxCollaborators: 100,
        chatSupport: { text: true, voice: true },
        aiFeature: { codeSuggestion: true, codeExplanation: true },
        limits: { codeExecutionsPerDay: 9999 },
        isVisible: true,
      },
    ];

    await subscriptionRepository.insertMany(plans);

    console.log("🎉 Subscription plans seeded!");
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Subscription seeding failed:", err);
    process.exit(1);
  }
}