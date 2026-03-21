import chalk from "chalk";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
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

const ENTITY_CHOICES = [...Object.keys(ENTITY_MAP), "all"] as const;

type EnvOption = "local" | "dev" | "prod";
type EntityOption = (typeof ENTITY_CHOICES)[number];

interface MigrateArgs {
  from: EnvOption;
  to: EnvOption;
  entity: EntityOption;
  "dry-run": boolean;
}

const ENV_FILE_MAP: Record<EnvOption, string> = {
  local: ".env.local",
  dev: ".env.dev",
  prod: ".env.prod",
};

function loadUri(env: EnvOption): string {
  const envFile = ENV_FILE_MAP[env];
  const envPath = path.resolve(__dirname, "..", envFile);
  const result = dotenv.config({ path: envPath, override: true });

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface EntityResult {
  entity: string;
  collection: string;
  inserted: number;
  updated: number;
  skipped: number;
  total: number;
  errors: number;
}

async function migrateEntity(
  sourceConn: mongoose.Connection,
  targetConn: mongoose.Connection,
  entityName: string,
  collectionName: string,
  dryRun: boolean,
): Promise<EntityResult> {
  const sourceCollection = sourceConn.collection(collectionName);
  const targetCollection = targetConn.collection(collectionName);

  const sourceDocs = await sourceCollection.find({}).toArray();
  const result: EntityResult = {
    entity: entityName,
    collection: collectionName,
    inserted: 0,
    updated: 0,
    skipped: 0,
    total: sourceDocs.length,
    errors: 0,
  };

  console.log(
    chalk.blue(
      `  [${entityName}] Found ${sourceDocs.length} documents in source`,
    ),
  );

  for (const doc of sourceDocs) {
    if (!doc.contentId) {
      console.log(
        chalk.yellow(
          `  [${entityName}] SKIP: document ${doc._id} has no contentId`,
        ),
      );
      result.skipped++;
      continue;
    }

    const { _id, ...docWithoutId } = doc;

    if (dryRun) {
      const existing = await targetCollection.findOne({
        contentId: doc.contentId,
      });
      if (existing) {
        console.log(
          chalk.blue(
            `  [${entityName}] DRY-RUN would update: contentId=${doc.contentId}`,
          ),
        );
        result.updated++;
      } else {
        console.log(
          chalk.green(
            `  [${entityName}] DRY-RUN would insert: contentId=${doc.contentId}`,
          ),
        );
        result.inserted++;
      }
      continue;
    }

    try {
      const writeResult = await targetCollection.updateOne(
        { contentId: doc.contentId },
        { $set: docWithoutId },
        { upsert: true },
      );

      if (writeResult.upsertedCount > 0) {
        result.inserted++;
      } else if (writeResult.modifiedCount > 0) {
        result.updated++;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(
        chalk.red(
          `  [${entityName}] ERROR on contentId=${doc.contentId}: ${msg}`,
        ),
      );
      result.errors++;
    }
  }

  const modeLabel = dryRun ? "DRY-RUN" : "DONE";
  console.log(
    chalk.green(
      `  [${entityName}] ${modeLabel}: ${result.inserted} inserted, ` +
        `${result.updated} updated, ${result.skipped} skipped, ${result.errors} errors`,
    ),
  );

  return result;
}

async function main() {
  const argv = (await yargs(hideBin(process.argv))
    .option("from", {
      type: "string",
      choices: ["local", "dev", "prod"] as const,
      demandOption: true,
      describe: "Source environment",
    })
    .option("to", {
      type: "string",
      choices: ["local", "dev", "prod"] as const,
      demandOption: true,
      describe: "Target environment",
    })
    .option("entity", {
      type: "string",
      choices: ENTITY_CHOICES,
      demandOption: true,
      describe: "Which entity to migrate",
    })
    .option("dry-run", {
      type: "boolean",
      default: false,
      describe: "Preview changes without writing",
    })
    .strict()
    .parse()) as MigrateArgs;

  if (argv.from === argv.to) {
    console.error(
      chalk.red("Source and target environments must be different"),
    );
    process.exit(1);
  }

  if (argv.to === "prod" && argv.from !== "dev") {
    console.error(
      chalk.red("Direct migration to prod is only allowed from dev"),
    );
    process.exit(1);
  }

  if (argv.to === "prod") {
    console.log(
      chalk.yellow(
        "\n⚠ WARNING: You are about to write to PRODUCTION.\n" +
          "Press Ctrl+C within 5 seconds to cancel.\n",
      ),
    );
    for (let i = 5; i > 0; i--) {
      process.stdout.write(chalk.yellow(`  ${i}...`));
      await sleep(1000);
    }
    console.log(chalk.yellow(" Proceeding.\n"));
  }

  const dryRunLabel = argv["dry-run"] ? " (DRY RUN)" : "";
  console.log(
    chalk.yellow(`\nMigrate content: ${argv.from} → ${argv.to}${dryRunLabel}`),
  );
  console.log(chalk.yellow("=".repeat(50)));

  const sourceUri = loadUri(argv.from);
  const targetUri = loadUri(argv.to);

  const sourceConn = await mongoose.createConnection(sourceUri).asPromise();
  console.log(chalk.green(`Connected to source (${argv.from})`));

  const targetConn = await mongoose.createConnection(targetUri).asPromise();
  console.log(chalk.green(`Connected to target (${argv.to})\n`));

  const entitiesToMigrate: Array<[string, string]> =
    argv.entity === "all"
      ? Object.entries(ENTITY_MAP)
      : [[argv.entity, ENTITY_MAP[argv.entity]]];

  const results: EntityResult[] = [];

  for (const [entityName, collectionName] of entitiesToMigrate) {
    try {
      const result = await migrateEntity(
        sourceConn,
        targetConn,
        entityName,
        collectionName,
        argv["dry-run"],
      );
      results.push(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`  [${entityName}] FATAL: ${msg}`));
      results.push({
        entity: entityName,
        collection: collectionName,
        inserted: 0,
        updated: 0,
        skipped: 0,
        total: 0,
        errors: 1,
      });
    }
    console.log("");
  }

  await sourceConn.close();
  await targetConn.close();

  console.log(chalk.yellow("=".repeat(50)));
  console.log(chalk.yellow(`SUMMARY${dryRunLabel}`));
  console.log(chalk.yellow("=".repeat(50)));

  let totalInserted = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const r of results) {
    const parts = [
      chalk.green(`${r.inserted} ins`),
      chalk.blue(`${r.updated} upd`),
      chalk.yellow(`${r.skipped} skip`),
    ];
    if (r.errors > 0) parts.push(chalk.red(`${r.errors} err`));

    console.log(
      `  ${r.entity.padEnd(20)} ${parts.join(" | ")} (${r.total} source)`,
    );

    totalInserted += r.inserted;
    totalUpdated += r.updated;
    totalSkipped += r.skipped;
    totalErrors += r.errors;
  }

  console.log(chalk.yellow("\n  Totals:"));
  console.log(chalk.green(`    Inserted: ${totalInserted}`));
  console.log(chalk.blue(`    Updated:  ${totalUpdated}`));
  console.log(chalk.yellow(`    Skipped:  ${totalSkipped}`));
  if (totalErrors > 0) {
    console.log(chalk.red(`    Errors:   ${totalErrors}`));
  }
  console.log("");
}

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
