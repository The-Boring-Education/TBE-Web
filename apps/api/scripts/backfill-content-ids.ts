/**
 * Backfill `contentId` (UUID v4) on existing documents in content collections.
 *
 * Env files (next to `apps/api/package.json`): `.env.local`, `.env.development`,
 * `.env.production` — each must define `MONGODB_URI`.
 *
 * From monorepo root (recommended):
 *   Local:  pnpm --filter @tbe/api run backfill -- --env local
 *   Dev:    pnpm --filter @tbe/api run backfill -- --env dev
 *   Prod:   pnpm --filter @tbe/api run backfill -- --env prod --confirm-prod
 *
 * From `apps/api/`: `pnpm run backfill -- --env local` (same flags).
 *
 * Then use `migrate-content.ts` to copy data between environments after backfill.
 */
import chalk from "chalk";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import yargs from "yargs";

import { CONTENT_ENTITY_MAP } from "../src/lib/migration/content-entity-map";
import {
  type ScriptEnv,
  SCRIPT_ENV_CHOICES,
  cliArgv,
  loadScriptEnv,
  requireParsedValue,
} from "./lib/script-env";

interface BackfillArgs {
  env: ScriptEnv;
  "confirm-prod": boolean;
}

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

  for (const [entityName, collectionName] of Object.entries(
    CONTENT_ENTITY_MAP,
  )) {
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
