/**
 * Copy content between MongoDB environments using `contentId` (upsert). Same env files
 * as backfill: `.env.local`, `.env.development`, `.env.production` under `apps/api/`.
 * Backfill the source DB first if documents lack `contentId`.
 *
 * How updates work:
 * - Each run sends a **full document snapshot** from source (minus `_id`) via `$set`.
 *   Adding an embedded interview question, editing a Shiksha chapter, etc. on **source**
 *   will replace those arrays/objects on **target** on the next migrate — no partial-merge
 *   beyond MongoDB field semantics.
 * - **New** content (new sheet / DSA / quiz / …) works as long as the doc has `contentId`
 *   (assigned at create time or by backfill).
 * - **Caveat:** fields that store **other collections’ `_id`s** (e.g. InterviewSheet
 *   `dsaQuestions` refs) still point at **source** ObjectIds. Migrate referenced collections
 *   in the same order you expect, or resolve links by `contentId` in app code.
 *
 * From monorepo root (examples):
 *   pnpm --filter @tbe/api run migrate -- --from dev --to local --entity all --dry-run
 *   pnpm --filter @tbe/api run migrate -- --from dev --to local --entity all
 *   pnpm --filter @tbe/api run migrate -- --from dev --to prod --entity all
 *
 * From `apps/api/`: `pnpm run migrate -- --from dev --to local --entity all`
 *
 * `--entity`: interviewSheets | dsaQuestions | studyGuides | aptitudeTopics | coreSubjects | courses | projects | quizzes | all
 * `--to prod` only with `--from dev`; prod writes wait 5s (Ctrl+C to cancel).
 */
import chalk from "chalk";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import {
  ENTITY_MAP,
  type EntityMapKey,
  migrateCollectionByContentId,
  type MigrateEntityResult,
} from "../src/lib/migration/content-migrate-entity";

const API_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const ENTITY_CHOICES = [...Object.keys(ENTITY_MAP), "all"] as const;

type EnvOption = "local" | "dev" | "prod";
type EntityOption = (typeof ENTITY_CHOICES)[number];

interface MigrateArgs {
  from: EnvOption;
  to: EnvOption;
  entity: EntityOption;
  "dry-run": boolean;
}

/** Must match backfill-content-ids.ts so both CLIs read the same DB URIs per env. */
const ENV_FILE_MAP: Record<EnvOption, string> = {
  local: ".env.local",
  dev: ".env.development",
  prod: ".env.production",
};

function loadUri(env: EnvOption): string {
  const envFile = ENV_FILE_MAP[env];
  const envPath = path.resolve(API_ROOT, envFile);
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

/** pnpm/tsx sometimes pass a bare `--` in argv; yargs then misses flags. */
function cliArgv(): string[] {
  return hideBin(process.argv).filter((a) => a !== "--");
}

async function main() {
  const argv = (await yargs(cliArgv())
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

  let entitiesToMigrate: Array<[string, string]>;
  if (argv.entity === "all") {
    entitiesToMigrate = Object.entries(ENTITY_MAP) as Array<[string, string]>;
  } else {
    const key = argv.entity as EntityMapKey;
    entitiesToMigrate = [[key, ENTITY_MAP[key]]];
  }

  const results: MigrateEntityResult[] = [];

  for (const [entityName, collectionName] of entitiesToMigrate) {
    try {
      const result = await migrateCollectionByContentId(
        sourceConn,
        targetConn,
        entityName,
        collectionName,
        { dryRun: argv["dry-run"], verbose: true },
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
