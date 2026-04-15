import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { commentRepository, projectRepository, userRepository } from "../container";



dotenv.config();

export default async function seedComments() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");

    const users = await userRepository.find({});
    const projects = await projectRepository.find({});

    if (users.length === 0 || projects.length === 0) {
      console.error("❌ Need users and projects in DB first!");
      process.exit(1);
    }

    await commentRepository.deleteMany({});
    console.log("🧹 Cleared old comments");

    const comments = [];

    // Let’s say each project gets between 3–10 comments randomly
    for (const project of projects) {
      const commentCount = faker.number.int({ min: 3, max: 10 });

      for (let i = 0; i < commentCount; i++) {
        // Pick a random user to make the comment
        const commentingUser = faker.helpers.arrayElement(users);

        // Generate random likes (subset of users)
        const likedByUsers = faker.helpers.arrayElements(users, {
          min: 0,
          max: faker.number.int({ min: 1, max: Math.floor(users.length / 3) }),
        }).map(u => u._id);

        const createdAt = faker.date.between({
          from: new Date(2025, 8, 1), // September 1
          to: new Date(2025, 9, 25),  // October 25
        });

        comments.push({
          userId: commentingUser._id,
          projectId: project._id,
          likes: likedByUsers,
          comment: faker.lorem.sentence({ min: 5, max: 15 }),
          createdAt,
          updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
        });
      }
    }

    await commentRepository.insertMany(comments);
    console.log(`💬 Inserted ${comments.length} comments successfully!`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Comment seeding failed:", err);
    process.exit(1);
  }
}
