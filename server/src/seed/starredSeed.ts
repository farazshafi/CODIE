import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { projectRepository, starredRepository, userRepository } from "../container";

dotenv.config();

async function seedStarred() {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log("✅ Connected to MongoDB");

        const users = await userRepository.find({});
        const projects = await projectRepository.find({});

        if (users.length === 0 || projects.length === 0) {
            console.error("❌ Need users and projects in DB before seeding starred data!");
            process.exit(1);
        }

        await starredRepository.deleteMany({});
        console.log("🧹 Cleared old starred data");

        const starredEntries: any[] = [];

        // Pick 60% of projects to have stars
        const selectedProjects = faker.helpers.arrayElements(
            projects,
            Math.floor(projects.length * 0.6)
        );

        for (const project of selectedProjects) {
            // Random users who starred this project (between 3 and 15)
            const starredUsers = faker.helpers.arrayElements(
                users,
                faker.number.int({ min: 3, max: 15 })
            );

            const createdAt = faker.date.between({
                from: new Date(2025, 8, 1), // September 1
                to: new Date(2025, 9, 25),  // October 25
            });

            for (const user of starredUsers) {
                starredEntries.push({
                    projectId: project._id,
                    userId: user._id,
                    createdAt,
                    updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
                });
            }
        }

        await starredRepository.insertMany(starredEntries);
        console.log(`⭐ Inserted ${starredEntries.length} starred entries successfully!`);

        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Starred seeding failed:", err);
        process.exit(1);
    }
}

seedStarred();
