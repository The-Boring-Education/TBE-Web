/**
 * One-shot migration: legacy `DevRelTask.completionTracking` → `Contribution`
 * ledger documents. Idempotent — safe to re-run.
 *
 *   pnpm --filter @tbe/api run migrate:devrel-contributions -- --env local --dry-run
 *   pnpm --filter @tbe/api run migrate:devrel-contributions -- --env prod --confirm-prod
 */
import chalk from "chalk";
import mongoose from "mongoose";
import yargs from "yargs";

import { migrateCompletionTrackingToContributions } from "../src/lib/migration/devrel-contributions";
import {
  cliArgv,
  loadScriptEnv,
  requireParsedValue,
  SCRIPT_ENV_CHOICES,
  type ScriptEnv,
} from "./lib/script-env";

interface Args {
  env: ScriptEnv;
  "confirm-prod": boolean;
  "dry-run": boolean;
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
      describe: "Report what would be written without writing",
    })
    .strict()
    .parse()) as Args;

  if (argv.env === "prod" && !argv["confirm-prod"]) {
    console.error(chalk.red("Refusing to run on prod without --confirm-prod"));
    process.exit(1);
  }

  const loaded = loadScriptEnv(argv.env);
  if (!loaded.ok) {
    console.error(chalk.red(loaded.error));
    process.exit(1);
  }
  const uri = requireParsedValue(loaded, "MONGODB_URI");
  if (!uri.ok) {
    console.error(chalk.red(uri.error));
    process.exit(1);
  }

  await mongoose.connect(uri.value);
  console.log(chalk.green(`Connected (${argv.env})`));

  const prefix = argv["dry-run"] ? "[dry-run] " : "";
  const result = await migrateCompletionTrackingToContributions({
    dryRun: argv["dry-run"],
  });

  console.log(
    chalk.yellow(
      `${prefix}Tasks ${result.tasksScanned}, entries ${result.entriesScanned}: ` +
        `${result.created} contributions, ${result.dropped} dropped, ` +
        `${result.skippedExisting} already migrated, ` +
        `${result.skippedUnresolved} unresolved leads, ${result.errors} errors`,
    ),
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(
    chalk.red(error instanceof Error ? error.message : String(error)),
  );
  await mongoose.disconnect();
  process.exit(1);
});
