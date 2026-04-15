import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { starredRepository, userRepository, projectRepository } from "../container";

dotenv.config();

export default async function seedStarred() {
  try {
    console.log("⭐ Seeding Starred...");
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");

    const users = await userRepository.find({});
    const projects = await projectRepository.find({});

    if (!users.length || !projects.length) {
      throw new Error("حتاج users and projects first!");
    }

    await starredRepository.deleteMany({});
    console.log("🧹 Cleared old starred");

    const starred = [];

    for (const user of users) {
      // each user stars 2–5 projects
      const starredProjects = faker.helpers.arrayElements(
        projects,
        faker.number.int({ min: 2, max: 5 })
      );

      for (const project of starredProjects) {
        starred.push({
          userId: user._id,
          projectId: project._id,
          createdAt: faker.date.recent(),
          updatedAt: faker.date.recent(),
        });
      }
    }

    await starredRepository.insertMany(starred);

    console.log(`⭐ Inserted ${starred.length} starred records`);
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Starred seeding failed:", err);
    process.exit(1);
  }
}