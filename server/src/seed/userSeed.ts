import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";
import { userRepository } from "../container";

config(); // load env vars

async function seedUsers() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");

    // await userRepository.deleteMany({});
    // console.log("🧹 Cleared existing users");

    const mockUsers = [];

    for (let i = 0; i < 30; i++) {
      mockUsers.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "password@123", 
        isAdmin: false,
        isBlocked: false,
        avatarUrl: faker.image.avatar(),
        bio: faker.person.bio(),
        github: faker.internet.url(),
        portfolio: faker.internet.url(),
        isPublic: faker.datatype.boolean(),
      });
    }

    await userRepository.insertMany(mockUsers);
    console.log("🎉 Inserted mock users successfully!");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedUsers();
