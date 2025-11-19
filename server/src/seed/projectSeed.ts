import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { projectRepository, userRepository } from "../container";


dotenv.config();

async function seedProjects() {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("✅ Connected to MongoDB");

    const users = await userRepository.find({});
    console.log(`👤 Found ${users.length} users`);

    // Clear existing projects
    await projectRepository.deleteMany({});
    console.log("🧹 Cleared existing projects");

    const languages = ["JavaScript", "Python", "Go", "Java", "C++", "C", "Rust"];

    const projects = [];

    for (const user of users) {
      // Each user has 1–2 projects
      const projectCount = faker.number.int({ min: 1, max: 2 });

      for (let i = 0; i < projectCount; i++) {
        const lang = faker.helpers.arrayElement(languages);

        const projectName = faker.helpers.arrayElement([
          `${lang} Portfolio App`,
          `${lang} Chat Server`,
          `${lang} Task Manager`,
          `${lang} API Service`,
          `${lang} Compiler`,
          `${lang} Notes App`,
          `${lang} Blog System`,
        ]);

        const randomCode = faker.helpers.arrayElement([
          `console.log("Hello ${lang}!");`,
          `print("Hello ${lang}!")`,
          `fmt.Println("Hello ${lang}!")`,
          `System.out.println("Hello ${lang}!");`,
          `printf("Hello ${lang}!\\n");`,
          `cout << "Hello ${lang}!" << endl;`,
          `println!("Hello ${lang}!");`,
        ]);

        // 🎯 Generate a random creation date (some in Sept, some in Oct , some in nov)
        const randomMonth = faker.helpers.arrayElement([8, 9, 10]); // 8 = September, 9 = October
        const createdAt = faker.date.between({
          from: new Date(2025, randomMonth, 1),
          to: new Date(2025, randomMonth, 25),
        });

        // updatedAt slightly after createdAt
        const updatedAt = faker.date.between({
          from: createdAt,
          to: new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000), // within 5 days
        });

        projects.push({
          projectName,
          projectLanguage: lang,
          projectCode: randomCode,
          userId: user._id,
          createdAt,
          updatedAt,
        });
      }
    }

    await projectRepository.insertMany(projects);
    console.log(`🎉 Inserted ${projects.length} projects successfully!`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Project seeding failed:", err);
    process.exit(1);
  }
}

seedProjects();
