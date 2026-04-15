import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { roomRepository, projectRepository, userRepository } from "../container";

dotenv.config();

export default async function seedRooms() {
  try {
    console.log("🏠 Seeding Rooms...");
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");


    const users = await userRepository.find({});
    const projects = await projectRepository.find({});

    if (!users.length || !projects.length) {
      throw new Error("Need users and projects first!");
    }

    await roomRepository.deleteMany({});
    console.log("🧹 Cleared old rooms");

    const rooms = [];

    for (const project of projects) {
      // owner = project creator
      const owner = project.userId;

      // pick random collaborators (excluding owner)
      const otherUsers = users.filter(u => u._id.toString() !== owner.toString());

      const collaborators = faker.helpers.arrayElements(
        otherUsers,
        faker.number.int({ min: 1, max: 4 })
      ).map(user => ({
        user: user._id,
        role: faker.helpers.arrayElement(["editor", "viewer"]),
        joinedAt: faker.date.recent(),
      }));

      rooms.push({
        roomId: `room_${faker.string.alphanumeric(10)}`,
        projectId: project._id,
        owner,
        collaborators,
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
      });
    }

    await roomRepository.insertMany(rooms);

    console.log(`🏠 Inserted ${rooms.length} rooms`);
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Room seeding failed:", err);
    process.exit(1);
  }
}