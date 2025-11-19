import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import crypto from "crypto";
import { projectRepository, roomRepository, userRepository } from "../container";

dotenv.config();

const generateRoomId = () => crypto.randomBytes(4).toString("hex");

/**
 * Return a random Date that falls in September, October or November
 * of the given year. Defaults to the current year.
 */
function randomDateInSeptOctNov(year = new Date().getFullYear()): Date {
  const start = new Date(`${year}-09-01T00:00:00.000Z`);
  const end = new Date(`${year}-11-30T23:59:59.999Z`);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedRooms() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");

    // Fetch all users and projects 
    const users = await userRepository.find({});
    const projects = await projectRepository.find({});
    console.log(`👤 Found ${users.length} users`);
    console.log(`📁 Found ${projects.length} projects`);

    // Clear old rooms
    await roomRepository.deleteMany({}); 
    console.log("🧹 Cleared existing rooms");

    const rooms: any[] = [];

    for (const project of projects) {
      const ownerId = project.userId; // owner is the project creator

      // Determine number of collaborators for this room (1-4 random)
      const numCollaborators = faker.number.int({ min: 1, max: 4 });

      // Pick random collaborators
      const collaborators: { user: mongoose.Types.ObjectId, role: string, joinedAt?: Date }[] = [];

      // Owner joinedAt - random Sept/Oct/Nov date
      collaborators.push({
        user: ownerId,
        role: "owner",
        joinedAt: randomDateInSeptOctNov(),
      });

      // Pick random other users excluding owner
      const otherUsers = users.filter(u => !u._id.equals(ownerId));
      faker.helpers.shuffle(otherUsers);

      for (let i = 0; i < numCollaborators; i++) {
        const user = otherUsers[i];
        if (!user) break; // fewer users than numCollaborators

        collaborators.push({
          user: user._id,
          role: faker.helpers.arrayElement(["editor", "viewer"]),
          // joinedAt also restricted to Sept/Oct/Nov
          joinedAt: randomDateInSeptOctNov(),
        });
      }

      // Room createdAt also restricted to Sept/Oct/Nov
      const roomCreatedAt = randomDateInSeptOctNov();

      rooms.push({
        roomId: generateRoomId(),
        projectId: project._id,
        owner: ownerId,
        collaborators,
        createdAt: roomCreatedAt,
        // optionally set updatedAt same as createdAt or leave it out
        updatedAt: roomCreatedAt,
      });
    }

    if (rooms.length > 0) {
      await roomRepository.insertMany(rooms);
    }
    console.log(`🎉 Inserted ${rooms.length} rooms successfully!`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Room seeding failed:", err);
    process.exit(1);
  }
}

seedRooms();
