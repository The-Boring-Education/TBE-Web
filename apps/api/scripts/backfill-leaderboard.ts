/**
 * Backfill live Period Scores for the current Daily / Weekly / Monthly Periods
 * from legacy Gamification.actions[] (run once at leaderboard launch; ADR-0001).
 * Idempotent — safe to re-run.
 *
 *   pnpm --filter @tbe/api run backfill:leaderboard -- --env local --dry-run
 *   pnpm --filter @tbe/api run backfill:leaderboard -- --env prod --confirm-prod
 */
import chalk from "chalk";
import mongoose from "mongoose";
import yargs from "yargs";

import { backfillCurrentPeriodScores } from "../src/lib/database/queries/leaderboardBackfill";
import {
  type ScriptEnv,
  SCRIPT_ENV_CHOICES,
  cliArgv,
  loadScriptEnv,
  requireParsedValue,
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
      describe: "Compute totals without writing",
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

  const result = await backfillCurrentPeriodScores({ dryRun: argv["dry-run"] });

  console.log(
    chalk.yellow(
      `${argv["dry-run"] ? "[dry-run] " : ""}Periods ${JSON.stringify(result.periodKeys)}: ` +
        `${result.counters} counters for ${result.learners} learners`,
    ),
  );
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  await mongoose.disconnect();
  process.exit(1);
});
