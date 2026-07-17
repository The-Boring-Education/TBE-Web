import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const API_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

async function main() {
  dotenv.config({ path: path.resolve(API_ROOT, ".env") });
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }

  const conn = await mongoose.createConnection(uri).asPromise();
  console.log("Connected to MongoDB");

  const usersCollection = conn.collection("users");

  const thirtySixHoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000);
  const sevenPointFiveDaysAgo = new Date(
    Date.now() - 7.5 * 24 * 60 * 60 * 1000,
  );
  const fourteenPointFiveDaysAgo = new Date(
    Date.now() - 14.5 * 24 * 60 * 60 * 1000,
  );
  const thirtyPointFiveDaysAgo = new Date(
    Date.now() - 30.5 * 24 * 60 * 60 * 1000,
  );

  const testUsers = [
    {
      email: "nitinverma9784@gmail.com",
      name: "Nitin Verma",
      lastActiveAt: thirtySixHoursAgo,
      reactivationEmails: {
        lastSent1DAt: null,
        lastSent7DAt: null,
        lastSent14DAt: null,
        lastSent30DAt: null,
      },
      dsaYatra: null,
      prepYatra: null,
      oncampus: null,
    },
    {
      email: "nitinverma7601@gmail.com",
      name: "Nitin Verma",
      lastActiveAt: sevenPointFiveDaysAgo,
      reactivationEmails: {
        lastSent1DAt: null,
        lastSent7DAt: null,
        lastSent14DAt: null,
        lastSent30DAt: null,
      },
      dsaYatra: {
        dyOnboarded: true,
        lastActiveAt: sevenPointFiveDaysAgo,
        progress: {
          completedQuestionIds: Array.from({ length: 24 }, (_, i) => `q${i}`),
        },
      },
      prepYatra: null,
      oncampus: null,
    },
    {
      email: "keanbosak@gmail.com",
      name: "Kean Bosak",
      lastActiveAt: fourteenPointFiveDaysAgo,
      reactivationEmails: {
        lastSent1DAt: null,
        lastSent7DAt: null,
        lastSent14DAt: null,
        lastSent30DAt: null,
      },
      dsaYatra: null,
      prepYatra: null,
      oncampus: {
        onboardingCompleted: true,
        lastActiveAt: fourteenPointFiveDaysAgo,
      },
    },
    {
      email: "devzco69@gmail.com",
      name: "Dev Zco",
      lastActiveAt: thirtyPointFiveDaysAgo,
      reactivationEmails: {
        lastSent1DAt: null,
        lastSent7DAt: null,
        lastSent14DAt: null,
        lastSent30DAt: null,
      },
      dsaYatra: null,
      prepYatra: {
        pyOnboarded: true,
        lastActiveAt: thirtyPointFiveDaysAgo,
        prepLog: {
          currentStreak: 12,
        },
      },
      oncampus: null,
    },
  ];

  for (const user of testUsers) {
    const updateDoc = {
      name: user.name,
      email: user.email,
      provider: "google",
      lastActiveAt: user.lastActiveAt,
      reactivationEmails: user.reactivationEmails,
      preferences: {
        marketingEmails: true,
      },
      dsaYatra: user.dsaYatra,
      prepYatra: user.prepYatra,
      oncampus: user.oncampus,
    };

    const result = await usersCollection.updateOne(
      { email: user.email },
      { $set: updateDoc },
      { upsert: true },
    );

    if (result.upsertedCount > 0) {
      console.log(`Successfully created test user: ${user.email}`);
    } else {
      console.log(`Successfully updated test user: ${user.email}`);
    }
  }

  await conn.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
