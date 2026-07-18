import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const API_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

interface SeedArgs {
  emails?: string;
  confirm: boolean;
}

async function main() {
  dotenv.config({ path: path.resolve(API_ROOT, ".env") });

  const argv = (await yargs(hideBin(process.argv))
    .option("emails", {
      type: "string",
      describe: "Comma-separated list of up to 4 target test emails (PII safe)",
    })
    .option("confirm", {
      type: "boolean",
      default: false,
      describe: "Confirm execution against the target database",
    })
    .parse()) as SeedArgs;

  if (!argv.confirm) {
    console.warn(
      "Safety Check: Please run with --confirm to execute seed writes.",
    );
    process.exit(0);
  }

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

  // Parse emails or fallback to safe placeholders
  const parsedEmails = argv.emails
    ? argv.emails.split(",").map((e) => e.trim())
    : [];

  const emailPlatform = parsedEmails[0] || "user-platform@example.com";
  const emailDsa = parsedEmails[1] || "user-dsayatra@example.com";
  const emailOncampus = parsedEmails[2] || "user-oncampus@example.com";
  const emailPrepyatra = parsedEmails[3] || "user-prepyatra@example.com";

  const testUsers = [
    {
      email: emailPlatform,
      name: "TBE Platform Learner",
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
      email: emailDsa,
      name: "TBE DSA Learner",
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
      email: emailOncampus,
      name: "TBE OnCampus Learner",
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
      email: emailPrepyatra,
      name: "TBE PrepYatra Learner",
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
