/**
 * Backfill `lastActiveAt` (Date) on existing users.
 *
 * Env files (next to `apps/api/package.json`): `.env`, `.env.local`, `.env.development`,
 * `.env.production` — each must define `MONGODB_URI`.
 *
 * From monorepo root (recommended):
 *   Local:  pnpm --filter @tbe/api exec tsx scripts/backfill-last-active.ts --env local
 *   Dev:    pnpm --filter @tbe/api exec tsx scripts/backfill-last-active.ts --env dev
 *   Prod:   pnpm --filter @tbe/api exec tsx scripts/backfill-last-active.ts --env prod --confirm-prod
 */
import chalk from "chalk";
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

type EnvOption = "local" | "dev" | "prod";

interface BackfillArgs {
  env: EnvOption;
  "confirm-prod": boolean;
}

const ENV_FILE_MAP: Record<EnvOption, string> = {
  local: ".env", // check .env first or fallback
  dev: ".env.development",
  prod: ".env.production",
};

function loadEnv(env: EnvOption): string {
  const envFile = ENV_FILE_MAP[env];
  const envPath = path.resolve(API_ROOT, envFile);
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    // If local fails to load .env, try loading .env.local as fallback
    if (env === "local") {
      const fallbackPath = path.resolve(API_ROOT, ".env.local");
      const fallbackResult = dotenv.config({ path: fallbackPath });
      if (!fallbackResult.error && fallbackResult.parsed?.MONGODB_URI) {
        return fallbackResult.parsed.MONGODB_URI;
      }
    }
    console.error(chalk.red(`Failed to load env file: ${envPath}`));
    console.error(chalk.red(result.error.message));
    process.exit(1);
  }

  const uri = result.parsed?.MONGODB_URI;
  if (!uri) {
    console.error(chalk.red(`MONGODB_URI not found in ${envPath}`));
    process.exit(1);
  }

  return uri;
}

function cliArgv(): string[] {
  return hideBin(process.argv).filter((a) => a !== "--");
}

async function main() {
  const argv = (await yargs(cliArgv())
    .option("env", {
      type: "string",
      choices: ["local", "dev", "prod"] as const,
      demandOption: true,
      describe: "Target environment",
    })
    .option("confirm-prod", {
      type: "boolean",
      default: false,
      describe: "Required safety flag when running on prod",
    })
    .strict()
    .parse()) as BackfillArgs;

  if (argv.env === "prod" && !argv["confirm-prod"]) {
    console.error(
      chalk.red("Refusing to run on prod without --confirm-prod flag"),
    );
    process.exit(1);
  }

  console.log(
    chalk.yellow(`\nBackfill user activity dates — environment: ${argv.env}`),
  );
  console.log(chalk.yellow("=".repeat(50)));

  const uri = loadEnv(argv.env);
  const conn = await mongoose.createConnection(uri).asPromise();
  console.log(chalk.green("Connected to MongoDB\n"));

  const usersCollection = conn.collection("users");
  const logsCollection = conn.collection("useractivitylogs");

  const totalUsers = await usersCollection.countDocuments();
  console.log(chalk.blue(`Total users in DB: ${totalUsers}`));

  const cursor = usersCollection.find({});
  let processed = 0;
  let updatedCount = 0;

  for await (const user of cursor) {
    processed++;
    // Find the latest user activity log
    const latestLog = await logsCollection.findOne(
      { userId: user._id },
      { sort: { date: -1, createdAt: -1 } },
    );

    const updateObj: Record<string, any> = {};

    if (latestLog) {
      const activeDate = latestLog.createdAt || new Date(latestLog.date);
      updateObj.lastActiveAt = activeDate;

      // Set app-specific lastActiveAt
      if (latestLog.app === "DSA_YATRA") {
        updateObj["dsaYatra.lastActiveAt"] = activeDate;
      } else if (latestLog.app === "PREPYATRA") {
        updateObj["prepYatra.lastActiveAt"] = activeDate;
      } else if (latestLog.app === "ONCAMPUS") {
        updateObj["oncampus.lastActiveAt"] = activeDate;
      }
    } else {
      // Fallback to user creation date
      updateObj.lastActiveAt = user.createdAt || new Date();
    }

    // Always ensure reactivationEmails structure is initialized
    if (!user.reactivationEmails) {
      updateObj.reactivationEmails = {
        lastSent1DAt: null,
        lastSent7DAt: null,
        lastSent14DAt: null,
        lastSent30DAt: null,
      };
    }

    // Always ensure marketingEmails preferences are initialized
    if (!user.preferences?.marketingEmails) {
      updateObj["preferences.marketingEmails"] = true;
    }

    await usersCollection.updateOne({ _id: user._id }, { $set: updateObj });
    updatedCount++;

    if (processed % 100 === 0) {
      console.log(
        chalk.blue(
          `  Progress: ${processed}/${totalUsers} users backfilled...`,
        ),
      );
    }
  }

  await conn.close();

  console.log(chalk.yellow("\n" + "=".repeat(50)));
  console.log(
    chalk.green(
      `Successfully processed ${processed} users, updated ${updatedCount} profiles.`,
    ),
  );
  console.log(chalk.yellow("=".repeat(50) + "\n"));
}

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
