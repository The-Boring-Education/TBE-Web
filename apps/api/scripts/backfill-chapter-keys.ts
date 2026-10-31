/**
 * Backfill `key` (kebab-case Chapter Key) on every chapter of every course.
 *
 * Env files (next to `apps/api/package.json`): `.env.local`, `.env.development`,
 * `.env.production` — each must define `MONGODB_URI`.
 *
 * From monorepo root (recommended):
 *   Local:  pnpm --filter @tbe/api run backfill:chapter-keys -- --env local
 *   Dev:    pnpm --filter @tbe/api run backfill:chapter-keys -- --env dev
 *   Prod:   pnpm --filter @tbe/api run backfill:chapter-keys -- --env prod --confirm-prod
 *
 * Safe to re-run: chapters that already carry a valid key keep it.
 */
import chalk from "chalk";
import mongoose from "mongoose";
import yargs from "yargs";

import { backfillChapterKeys } from "../src/lib/migration/chapter-key-backfill";
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

  console.log(
    chalk.yellow(`\nBackfill chapter keys — environment: ${argv.env}`),
  );
  console.log(chalk.yellow("=".repeat(50)));

  const uri = loadEnv(argv.env);
  const conn = await mongoose.createConnection(uri).asPromise();
  console.log(chalk.green("Connected to MongoDB\n"));

  try {
    const result = await backfillChapterKeys(conn, (progress) => {
      if (progress.coursesUpdated % 25 === 0) {
        console.log(
          chalk.blue(
            `  Progress: ${progress.coursesUpdated} courses, ${progress.chaptersUpdated} chapters`,
          ),
        );
      }
    });

    console.log(chalk.yellow("\n" + "=".repeat(50)));
    console.log(chalk.yellow("SUMMARY"));
    console.log(chalk.yellow("=".repeat(50)));
    console.log(`  Courses scanned:  ${result.coursesScanned}`);
    console.log(`  Courses updated:  ${result.coursesUpdated}`);
    console.log(`  Chapters keyed:   ${result.chaptersUpdated}\n`);
  } finally {
    await conn.close();
  }
}

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
