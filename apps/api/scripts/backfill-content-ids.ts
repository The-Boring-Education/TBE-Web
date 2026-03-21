import chalk from "chalk";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const ENTITY_MAP: Record<string, string> = {
  interviewSheets: "interviewsheets",
  dsaQuestions: "dsaquestions",
  aptitudeTopics: "aptitudetopics",
  courses: "courses",
  projects: "projects",
  quizzes: "quizzes",
};

type EnvOption = "local" | "dev" | "prod";

interface BackfillArgs {
  env: EnvOption;
  "confirm-prod": boolean;
}

const ENV_FILE_MAP: Record<EnvOption, string> = {
  local: ".env.local",
  dev: ".env.dev",
  prod: ".env.prod",
};

function loadEnv(env: EnvOption): string {
  const envFile = ENV_FILE_MAP[env];
  const envPath = path.resolve(__dirname, "..", envFile);
  const result = dotenv.config({ path: envPath });

  if (result.error) {
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

async function backfillCollection(
  conn: mongoose.Connection,
  entityName: string,
  collectionName: string,
): Promise<{ total: number; updated: number }> {
  const collection = conn.collection(collectionName);
  const totalDocs = await collection.countDocuments();
  const docsWithoutContentId = await collection.countDocuments({
    contentId: { $exists: false },
  });

  console.log(
    chalk.blue(
      `  [${entityName}] ${totalDocs} total docs, ${docsWithoutContentId} missing contentId`,
    ),
  );

  if (docsWithoutContentId === 0) {
    console.log(chalk.green(`  [${entityName}] Nothing to backfill`));
    return { total: totalDocs, updated: 0 };
  }

  const cursor = collection.find({ contentId: { $exists: false } });
  let updated = 0;

  for await (const doc of cursor) {
    await collection.updateOne(
      { _id: doc._id },
      { $set: { contentId: uuidv4() } },
    );
    updated++;

    if (updated % 100 === 0) {
      console.log(
        chalk.blue(
          `  [${entityName}] Progress: ${updated}/${docsWithoutContentId}`,
        ),
      );
    }
  }

  console.log(chalk.green(`  [${entityName}] Backfilled ${updated} documents`));
  return { total: totalDocs, updated };
}

async function main() {
  const argv = (await yargs(hideBin(process.argv))
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

  console.log(chalk.yellow(`\nBackfill contentId — environment: ${argv.env}`));
  console.log(chalk.yellow("=".repeat(50)));

  const uri = loadEnv(argv.env);
  const conn = await mongoose.createConnection(uri).asPromise();
  console.log(chalk.green("Connected to MongoDB\n"));

  const summary: Array<{
    entity: string;
    collection: string;
    total: number;
    updated: number;
  }> = [];

  for (const [entityName, collectionName] of Object.entries(ENTITY_MAP)) {
    try {
      const result = await backfillCollection(conn, entityName, collectionName);
      summary.push({
        entity: entityName,
        collection: collectionName,
        ...result,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`  [${entityName}] ERROR: ${msg}`));
      summary.push({
        entity: entityName,
        collection: collectionName,
        total: 0,
        updated: -1,
      });
    }
    console.log("");
  }

  await conn.close();

  console.log(chalk.yellow("\n" + "=".repeat(50)));
  console.log(chalk.yellow("SUMMARY"));
  console.log(chalk.yellow("=".repeat(50)));

  let totalUpdated = 0;
  for (const row of summary) {
    const status =
      row.updated === -1
        ? chalk.red("ERROR")
        : row.updated === 0
          ? chalk.green("OK (none needed)")
          : chalk.green(`${row.updated} backfilled`);

    console.log(`  ${row.entity.padEnd(20)} ${status}`);
    if (row.updated > 0) totalUpdated += row.updated;
  }

  console.log(chalk.yellow(`\nTotal documents backfilled: ${totalUpdated}\n`));
}

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
