import "dotenv/config";

import fs from "fs";
import { connect, disconnect } from "mongoose";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import CoreSubject from "../src/lib/database/models/InterviewPrep/CoreSubject";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seedCoreSubjects() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in the environment.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await connect(uri);
    console.log("Connected successfully.");

    // Read JSON data
    const dataPath = path.join(__dirname, "core-subjects.json");
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    const dummySubjects = JSON.parse(fileContent);

    console.log("Clearing existing CoreSubject data...");
    await CoreSubject.deleteMany({});

    console.log("Seeding new dummy data...");
    for (const subjectData of dummySubjects) {
      const subject = new CoreSubject({
        ...subjectData,
        isActive: true,
      });
      await subject.save();
      console.log(
        `Saved subject: ${subject.label} with ${subject.chapters.length} chapters.`,
      );
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedCoreSubjects();
