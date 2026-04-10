import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import { addDSAQuestionToDB } from "../src/lib/database/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB database:", mongoose.connection.name);

    const questionPayload = {
      title: "Test Sample Problem: Two Sum",
      answer:
        "Use a hashmap to store the difference and check if it exists in a single pass.",
      domain: ["DSA"],
      difficulty: "Easy",
      companyTypes: ["MNC", "Startup"],
      topics: ["ARRAY", "HASHMAP"],
      isRealWorldProblem: false,
    };

    const result = await addDSAQuestionToDB(questionPayload as any);

    if (result.error) {
      console.log("Failed to insert question:", result.error);
    } else {
      console.log("Successfully inserted a test question into the DB!");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error connecting to DB:", error);
    process.exit(1);
  }
}

seed();
