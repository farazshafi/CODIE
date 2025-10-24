import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { subscriptionRepository, userRepository, userSubscriptionRepository } from "../container";

dotenv.config();

async function seedUserSubscriptions() {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("✅ Connected to MongoDB");

        // Fetch all users
        const users = await userRepository.find({});
        console.log(`👤 Found ${users.length} users`);

        // Fetch all available subscription plans
        const plans = await subscriptionRepository.find({});
        if (!plans.length) {
            console.error("⚠️ No subscription plans found. Please seed plans first.");
            process.exit(1);
        }

        console.log(`📦 Found ${plans.length} plans: ${plans.map(p => p.name).join(", ")}`);

        // Clear old user subscriptions
        await userSubscriptionRepository.deleteMany({});
        console.log("🧹 Cleared existing user subscriptions");

        const subscriptions = [];

        for (const user of users) {
            const randomPlan = faker.helpers.arrayElement(plans);

            // Random start date (September or October)
            const randomMonth = faker.helpers.arrayElement([8, 9]); // 8 = September, 9 = October
            const startDate = faker.date.between({
                from: new Date(2025, randomMonth, 1),
                to: new Date(2025, randomMonth, 25),
            });

            // 30-day subscription period
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);

            const isActive = endDate > new Date();

            subscriptions.push({
                userId: user._id,
                planId: randomPlan._id,
                startDate,
                endDate,
                isActive,
                paymentOptions: {
                    paymentTime: faker.date.between({
                        from: startDate,
                        to: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000), // within 3 days after start
                    }),
                    paymentMethod: faker.helpers.arrayElement(["Card", "UPI", "PayPal", "Free"]),
                },
                cancelledDate: isActive ? null : faker.date.between({ from: startDate, to: endDate }),
                nextPlan: null,
                aiUsage: faker.number.int({ min: 0, max: 500 }),
            });
        }

        await userSubscriptionRepository.insertMany(subscriptions);
        console.log(`🎉 Inserted ${subscriptions.length} user subscriptions successfully!`);

        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seedUserSubscriptions();
