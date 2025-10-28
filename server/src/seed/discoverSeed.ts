import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { discoverRepository, projectRepository } from "../container";


dotenv.config();

async function seedDiscover() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");

    // Fetch all projects
    const projects = await projectRepository.find({});
    console.log(`📁 Found ${projects.length} projects`);

    // Clear existing Discover entries
    await discoverRepository.deleteMany({});
    console.log("🧹 Cleared existing Discover entries");

    const selectedProjects = faker.helpers.arrayElements(
      projects,
      Math.min(60, projects.length)
    );


    const discoverEntries = [];

    for (const project of selectedProjects) {
      const createdAt = faker.date.between({
        from: new Date(2025, 8, 1), // Sept 1, 2025
        to: new Date(2025, 9, 25), // Oct 25, 2025
      });

      discoverEntries.push({
        projectId: project._id,
        like: faker.number.int({ min: 0, max: 500 }),
        views: faker.number.int({ min: 100, max: 5000 }),
        starred: faker.number.int({ min: 0, max: 200 }),
        createdAt,
        updatedAt: faker.date.between({
          from: createdAt,
          to: new Date(),
        }),
      });
    }

    await discoverRepository.insertMany(discoverEntries);
    console.log(`🎉 Inserted ${discoverEntries.length} Discover records successfully!`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Discover seeding failed:", err);
    process.exit(1);
  }
}

seedDiscover();
