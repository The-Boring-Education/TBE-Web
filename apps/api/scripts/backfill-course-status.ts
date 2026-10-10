/**
 * Backfill the Course lifecycle `status` field on existing course documents.
 *
 * Every course that predates the lifecycle status field is treated as live and
 * is backfilled to `PUBLISHED`. This MUST be run (and verified) before the
 * PUBLISHED-only read filtering reaches an environment, otherwise the whole
 * catalogue disappears from the platform.
 *
 * Env files (next to `apps/api/package.json`): `.env.local`, `.env.development`,
 * `.env.production` — each must define `MONGODB_URI`.
 *
 * From monorepo root (recommended):
 *   Local:  pnpm --filter @tbe/api run backfill:course-status -- --env local
 *   Dev:    pnpm --filter @tbe/api run backfill:course-status -- --env dev
 *   Prod:   pnpm --filter @tbe/api run backfill:course-status -- --env prod --confirm-prod
 *
 * Add `--dry-run` to print the before/after verification counts without
 * writing anything.
 */
import chalk from "chalk";
import mongoose from "mongoose";
import yargs from "yargs";

import { CONTENT_ENTITY_MAP } from "../src/lib/migration/content-entity-map";
import {
  cliArgv,
  loadScriptEnv,
  requireParsedValue,
  SCRIPT_ENV_CHOICES,
  type ScriptEnv,
} from "./lib/script-env";

interface BackfillArgs {
  env: ScriptEnv;
  "confirm-prod": boolean;
  "dry-run": boolean;
}

const COURSE_COLLECTION = CONTENT_ENTITY_MAP.courses;
const PUBLISHED = "PUBLISHED";

function loadEnv(env: ScriptEnv): string {
  const loaded = loadScriptEnv(env);
  if (!loaded.ok) {
    console.error(chalk.red(loaded.error));
    process.exit(1);
  }

  const uri = requireParsedValue(loaded, "MONGODB_URI");
  if (!uri.ok) {
    console.error(chalk.red(uri.error));
    process.exit(1);
  }

  return uri.value;
}

async function countsByStatus(
  collection: mongoose.Collection,
): Promise<{ total: number; published: number; missing: number }> {
  const [total, published, missing] = await Promise.all([
    collection.countDocuments(),
    collection.countDocuments({ status: PUBLISHED }),
    collection.countDocuments({
      $or: [{ status: { $exists: false } }, { status: null }],
    }),
  ]);

  return { total, published, missing };
}

async function main() {
  const argv = (await yargs(cliArgv())
    .option("env", {
      type: "string",
      choices: SCRIPT_ENV_CHOICES,
      demandOption: true,
      describe: "Target environment",
    })
    .option("confirm-prod", {
      type: "boolean",
      default: false,
      describe: "Required safety flag when running on prod",
    })
    .option("dry-run", {
      type: "boolean",
      default: false,
      describe: "Report counts without writing any document",
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
    chalk.yellow(`\nBackfill course status — environment: ${argv.env}`),
  );
  console.log(chalk.yellow("=".repeat(50)));

  const uri = loadEnv(argv.env);
  const conn = await mongoose.createConnection(uri).asPromise();
  console.log(chalk.green("Connected to MongoDB\n"));

  try {
    const collection = conn.collection(COURSE_COLLECTION);

    const before = await countsByStatus(collection);
    console.log(chalk.blue("BEFORE"));
    console.log(`  total courses:        ${before.total}`);
    console.log(`  already PUBLISHED:    ${before.published}`);
    console.log(`  missing status:       ${before.missing}\n`);

    if (argv["dry-run"]) {
      console.log(
        chalk.yellow(
          `Dry run — would set status=${PUBLISHED} on ${before.missing} course(s)\n`,
        ),
      );
      return;
    }

    const result = await collection.updateMany(
      { $or: [{ status: { $exists: false } }, { status: null }] },
      { $set: { status: PUBLISHED } },
    );

    const after = await countsByStatus(collection);
    console.log(chalk.blue("AFTER"));
    console.log(`  total courses:        ${after.total}`);
    console.log(`  PUBLISHED:            ${after.published}`);
    console.log(`  missing status:       ${after.missing}\n`);

    console.log(
      chalk.green(`Updated ${result.modifiedCount} course document(s)`),
    );

    // Verification: no course may be lost and none may be left without a status.
    const totalUnchanged = before.total === after.total;
    const noneMissing = after.missing === 0;
    const publishedMatches =
      after.published === before.published + before.missing;

    if (totalUnchanged && noneMissing && publishedMatches) {
      console.log(chalk.green("\nVerification passed: course counts match\n"));
    } else {
      console.error(
        chalk.red(
          `\nVerification FAILED — total ${before.total} → ${after.total}, ` +
            `published ${before.published} → ${after.published}, ` +
            `missing status ${before.missing} → ${after.missing}\n`,
        ),
      );
      process.exitCode = 1;
    }
  } finally {
    await conn.close();
  }
}

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
