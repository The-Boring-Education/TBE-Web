/**
 * One-time user personalization normalization migration.
 *
 * Normalizes legacy values in `users` documents:
 * - `prepYatra.targetCompanies`
 * - `dsaYatra.timeline`
 * - `oncampus.duration`
 *
 * Usage from monorepo root:
 *   pnpm --filter @tbe/api run migrate:personalization -- --env local --dry-run
 *   pnpm --filter @tbe/api run migrate:personalization -- --env dev
 *   pnpm --filter @tbe/api run migrate:personalization -- --env prod --confirm-prod
 */
import chalk from "chalk";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import {
  isCanonicalCompanyTypeInput,
  isCanonicalDsaDurationInput,
  normalizeCompanyTypeArray,
  normalizeDsaDuration,
} from "../src/lib/validation/personalization";

const API_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

type EnvOption = "local" | "dev" | "prod";

interface MigrationArgs {
  env: EnvOption;
  "dry-run": boolean;
  "confirm-prod": boolean;
  "batch-size": number;
}

interface MigrationStats {
  usersScanned: number;
  usersPlannedForUpdate: number;
  usersUpdated: number;
  prepTargetDocsUpdated: number;
  dsaTimelineDocsUpdated: number;
  oncampusDurationDocsUpdated: number;
  oncampusDurationUnset: number;
  companyTypeFallbackHits: number;
  durationFallbackHits: number;
  invalidTargetCompaniesRemoved: number;
  unresolvedDsaTimeline: number;
  unresolvedOncampusDuration: number;
}

const ENV_FILE_MAP: Record<EnvOption, string> = {
  local: ".env.local",
  dev: ".env.development",
  prod: ".env.production",
};

const EMPTY_STATS: MigrationStats = {
  usersScanned: 0,
  usersPlannedForUpdate: 0,
  usersUpdated: 0,
  prepTargetDocsUpdated: 0,
  dsaTimelineDocsUpdated: 0,
  oncampusDurationDocsUpdated: 0,
  oncampusDurationUnset: 0,
  companyTypeFallbackHits: 0,
  durationFallbackHits: 0,
  invalidTargetCompaniesRemoved: 0,
  unresolvedDsaTimeline: 0,
  unresolvedOncampusDuration: 0,
};

interface UserDoc {
  _id: mongoose.Types.ObjectId;
  prepYatra?: {
    targetCompanies?: unknown;
  };
  dsaYatra?: {
    timeline?: unknown;
  };
  oncampus?: {
    duration?: unknown;
  };
}

const loadUri = (env: EnvOption): string => {
  const envPath = path.resolve(API_ROOT, ENV_FILE_MAP[env]);
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
};

const cliArgv = (): string[] =>
  hideBin(process.argv).filter((arg) => arg !== "--");

const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const buildUserUpdatePlan = (doc: UserDoc, stats: MigrationStats) => {
  const set: Record<string, unknown> = {};
  const unset: Record<string, ""> = {};

  const rawTargetSource = doc.prepYatra?.targetCompanies;
  if (Array.isArray(rawTargetSource)) {
    const rawTargets = rawTargetSource.map((entry) => String(entry));
    const candidateTargets = rawTargets
      .map((entry) => entry.trim())
      .filter(Boolean);

    const {
      values: normalizedTargetCompanies,
      invalid: invalidTargetCompanies,
    } = normalizeCompanyTypeArray(candidateTargets);

    if (invalidTargetCompanies.length > 0) {
      stats.invalidTargetCompaniesRemoved += invalidTargetCompanies.length;
    }

    const canonicalInputCount = candidateTargets.filter((entry) =>
      isCanonicalCompanyTypeInput(entry),
    ).length;
    const fallbackCount =
      candidateTargets.length -
      canonicalInputCount -
      invalidTargetCompanies.length;

    if (fallbackCount > 0) {
      stats.companyTypeFallbackHits += fallbackCount;
    }

    if (!arraysEqual(rawTargets, normalizedTargetCompanies)) {
      set["prepYatra.targetCompanies"] = normalizedTargetCompanies;
      stats.prepTargetDocsUpdated += 1;
    }
  }

  const rawTimelineValue = doc.dsaYatra?.timeline;
  if (typeof rawTimelineValue === "string") {
    const rawTimeline = rawTimelineValue.trim();

    if (rawTimeline) {
      const normalizedTimeline = normalizeDsaDuration(rawTimeline);
      if (!normalizedTimeline) {
        stats.unresolvedDsaTimeline += 1;
      } else {
        if (!isCanonicalDsaDurationInput(rawTimeline)) {
          stats.durationFallbackHits += 1;
        }

        if (normalizedTimeline !== rawTimelineValue) {
          set["dsaYatra.timeline"] = normalizedTimeline;
          stats.dsaTimelineDocsUpdated += 1;
        }
      }
    }
  }

  const rawOncampusDurationValue = doc.oncampus?.duration;
  if (typeof rawOncampusDurationValue === "string") {
    const rawDuration = rawOncampusDurationValue.trim();

    if (!rawDuration) {
      unset["oncampus.duration"] = "";
      stats.oncampusDurationUnset += 1;
    } else {
      const normalizedDuration = normalizeDsaDuration(rawDuration);

      if (!normalizedDuration) {
        unset["oncampus.duration"] = "";
        stats.oncampusDurationUnset += 1;
        stats.unresolvedOncampusDuration += 1;
      } else {
        if (!isCanonicalDsaDurationInput(rawDuration)) {
          stats.durationFallbackHits += 1;
        }

        if (normalizedDuration !== rawOncampusDurationValue) {
          set["oncampus.duration"] = normalizedDuration;
          stats.oncampusDurationDocsUpdated += 1;
        }
      }
    }
  }

  return {
    set,
    unset,
    hasChanges: Object.keys(set).length > 0 || Object.keys(unset).length > 0,
  };
};

async function main() {
  const argv = (await yargs(cliArgv())
    .option("env", {
      type: "string",
      choices: ["local", "dev", "prod"] as const,
      demandOption: true,
      describe: "Target environment",
    })
    .option("dry-run", {
      type: "boolean",
      default: false,
      describe: "Preview changes without writing",
    })
    .option("confirm-prod", {
      type: "boolean",
      default: false,
      describe: "Required safety flag for prod writes",
    })
    .option("batch-size", {
      type: "number",
      default: 500,
      describe: "Bulk write batch size",
    })
    .strict()
    .parse()) as MigrationArgs;

  if (argv.env === "prod" && !argv["dry-run"] && !argv["confirm-prod"]) {
    console.error(
      chalk.red("Refusing to run on prod without --confirm-prod flag"),
    );
    process.exit(1);
  }

  const dryRunLabel = argv["dry-run"] ? " (DRY RUN)" : "";

  console.log(
    chalk.yellow(
      `\nNormalize user personalization — env: ${argv.env}${dryRunLabel}`,
    ),
  );
  console.log(chalk.yellow("=".repeat(60)));

  const uri = loadUri(argv.env);
  const conn = await mongoose.createConnection(uri).asPromise();
  const users = conn.collection("users");

  console.log(chalk.green("Connected to MongoDB\n"));

  const stats: MigrationStats = { ...EMPTY_STATS };
  const pendingOps: Array<Record<string, unknown>> = [];

  const flush = async () => {
    if (argv["dry-run"] || pendingOps.length === 0) return;

    const result = await users.bulkWrite(
      pendingOps as Parameters<typeof users.bulkWrite>[0],
      {
        ordered: false,
      },
    );

    stats.usersUpdated += result.modifiedCount;
    pendingOps.length = 0;
  };

  const cursor = users.find(
    {
      $or: [
        { "prepYatra.targetCompanies": { $exists: true } },
        { "dsaYatra.timeline": { $exists: true } },
        { "oncampus.duration": { $exists: true } },
      ],
    },
    {
      projection: {
        _id: 1,
        "prepYatra.targetCompanies": 1,
        "dsaYatra.timeline": 1,
        "oncampus.duration": 1,
      },
    },
  );

  for await (const doc of cursor as AsyncIterable<UserDoc>) {
    stats.usersScanned += 1;

    const { set, unset, hasChanges } = buildUserUpdatePlan(doc, stats);
    if (!hasChanges) continue;

    stats.usersPlannedForUpdate += 1;

    if (!argv["dry-run"]) {
      const update: Record<string, unknown> = {};
      if (Object.keys(set).length > 0) update.$set = set;
      if (Object.keys(unset).length > 0) update.$unset = unset;

      pendingOps.push({
        updateOne: {
          filter: { _id: doc._id },
          update,
        },
      });

      if (pendingOps.length >= argv["batch-size"]) {
        await flush();
      }
    }

    if (stats.usersScanned % 1000 === 0) {
      console.log(
        chalk.blue(
          `Scanned ${stats.usersScanned} users, planned ${stats.usersPlannedForUpdate} updates...`,
        ),
      );
    }
  }

  await flush();

  if (argv["dry-run"]) {
    stats.usersUpdated = stats.usersPlannedForUpdate;
  }

  await conn.close();

  console.log(chalk.yellow("\n" + "=".repeat(60)));
  console.log(chalk.yellow(`SUMMARY${dryRunLabel}`));
  console.log(chalk.yellow("=".repeat(60)));
  console.log(`Users scanned:              ${stats.usersScanned}`);
  console.log(`Users updated/planned:      ${stats.usersUpdated}`);
  console.log(`Prep targets normalized:    ${stats.prepTargetDocsUpdated}`);
  console.log(`DSA timeline normalized:    ${stats.dsaTimelineDocsUpdated}`);
  console.log(
    `OnCampus duration normalized: ${stats.oncampusDurationDocsUpdated}`,
  );
  console.log(`OnCampus duration unset:    ${stats.oncampusDurationUnset}`);
  console.log(`Duration fallback hits:     ${stats.durationFallbackHits}`);
  console.log(`Company fallback hits:      ${stats.companyTypeFallbackHits}`);
  console.log(
    `Invalid target values dropped: ${stats.invalidTargetCompaniesRemoved}`,
  );
  console.log(`Unresolved DSA timelines:   ${stats.unresolvedDsaTimeline}`);
  console.log(
    `Unresolved OnCampus duration: ${stats.unresolvedOncampusDuration}`,
  );
  console.log("");
}

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
