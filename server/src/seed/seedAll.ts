import mongoose from "mongoose";
import dotenv from "dotenv";

import seedUsers from "./userSeed";
import seedProjects from "./projectSeed";
import seedComments from "./commentSeed";
import seedDiscover from "./discoverSeed";
import seedUserSubscriptions from "./userSubscriptionSeed";
import seedPayments from "./paymentSeed";
import seedRooms from "./roomSeed";
import seedStarred from "./starredSeed";
import seedSubscriptions from "./subscriptionSeed";

dotenv.config();

async function seedAll() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("🔥 Connected to DB");

    // ⚠️ Optional: Clear DB (careful in production)
    await mongoose.connection.db.dropDatabase();
    console.log("🧹 Database cleared");

    // ✅ Order matters
    await seedUsers();
    await seedSubscriptions();
    await seedUserSubscriptions();
    await seedProjects();
    await seedRooms();
    await seedStarred();
    await seedDiscover();
    await seedComments();
    await seedPayments();

    console.log("🎉 ALL DATA SEEDED SUCCESSFULLY");

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedAll();