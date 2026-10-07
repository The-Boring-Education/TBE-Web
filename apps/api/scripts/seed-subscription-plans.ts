/**
 * One-time / occasional seed of subscription SKU prices into MongoDB.
 *
 * Env files (next to `apps/api/package.json`): `.env.local`, `.env.development`,
 * `.env.production` — same as migrate / backfill / manage-admin. Each must
 * define `ADMIN_SECRET` (the value the API expects on `x-admin-secret`).
 *
 * 1. Copy subscription-plans.example.json → subscription-plans.json (gitignored).
 * 2. Fill real INR amounts (amountInr).
 * 3. Ensure the target API is running (local) or reachable (dev/prod).
 * 4. Run from `apps/api/` or the monorepo root.
 *
 * Uses POST /api/v1/admin/subscription-plans with `x-admin-secret`. The admin
 * panel still authenticates with a user JWT.
 *
 * Each plan in JSON should include the full catalog (displayName, features, etc.).
 * Optional `planUuid` must be a valid RFC 4122 id; if omitted, the API derives a
 * stable UUID v5 from (productType, planKey). Re-seeding updates the same Mongo
 * row (unique on productType + planKey) — no duplicates.
 *
 * From monorepo root:
 *   pnpm --filter @tbe/api run seed:subscription-plans
 *   pnpm --filter @tbe/api run seed:subscription-plans -- --env dev
 *   pnpm --filter @tbe/api run seed:subscription-plans -- --env prod --yes
 *
 * From `apps/api/`: `pnpm seed:subscription-plans -- --env local`
 */
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import yargs from "yargs";

import {
  type ScriptEnv,
  API_ROOT,
  SCRIPT_ENV_CHOICES,
  assertProdConfirmed,
  cliArgv,
  loadScriptEnv,
  requireParsedValue,
} from "./lib/script-env";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_API_BASE_BY_ENV: Record<ScriptEnv, string> = {
  local: "http://localhost:3004/api/v1",
  dev: "https://tbe-api-dev.vercel.app/api/v1",
  prod: "https://api.theboringeducation.com/api/v1",
};

const LOCAL_FILE = path.join(__dirname, "subscription-plans.json");
const EXAMPLE_FILE = path.join(__dirname, "subscription-plans.example.json");

interface SeedArgs {
  env: ScriptEnv;
  yes: boolean;
  api?: string;
}

export const resolveSeedAdminSecret = (
  adminSecret: string | undefined,
  envPath?: string,
): { ok: true; secret: string } | { ok: false; error: string } => {
  const secret = adminSecret?.trim();
  if (!secret) {
    return {
      ok: false,
      error: envPath
        ? `ADMIN_SECRET not found in ${envPath}`
        : "ADMIN_SECRET is missing for this environment.",
    };
  }
  return { ok: true, secret };
};

export const normalizeSeedApiBase = (rawBase: string): string => {
  const trimmed = rawBase.replace(/\/$/, "");
  return /\/api\/v\d+$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
};

const parseArgs = async (): Promise<SeedArgs> => {
  const argv = await yargs(cliArgv())
    .option("env", {
      type: "string",
      choices: SCRIPT_ENV_CHOICES,
      default: "local" as const,
      describe: "Target environment",
    })
    .option("yes", {
      type: "boolean",
      default: false,
      describe: "Required to seed production",
    })
    .option("api", {
      type: "string",
      describe: "Override API base (origin or .../api/v1)",
    })
    .strict()
    .parse();

  return {
    env: argv.env,
    yes: Boolean(argv.yes),
    api: argv.api,
  };
};

async function main() {
  const args = await parseArgs();

  if (!fs.existsSync(LOCAL_FILE)) {
    console.error(
      chalk.red(
        `[seed-subscription-plans] Missing ${LOCAL_FILE}\n` +
          `Copy ${EXAMPLE_FILE} to subscription-plans.json and set amountInr values.`,
      ),
    );
    process.exit(1);
  }

  const loaded = loadScriptEnv(args.env);
  if (!loaded.ok) {
    console.error(chalk.red(`[seed-subscription-plans] ${loaded.error}`));
    process.exit(1);
  }

  const secretResult = resolveSeedAdminSecret(
    loaded.parsed.ADMIN_SECRET,
    loaded.envPath,
  );
  if (!secretResult.ok) {
    console.error(chalk.red(`[seed-subscription-plans] ${secretResult.error}`));
    process.exit(1);
  }

  const prodGuard = assertProdConfirmed(args.env, args.yes);
  if (!prodGuard.ok) {
    console.error(chalk.red(`[seed-subscription-plans] ${prodGuard.error}`));
    process.exit(1);
  }

  const raw = fs.readFileSync(LOCAL_FILE, "utf-8");
  const parsed = JSON.parse(raw) as { plans?: unknown[] };
  if (
    !parsed.plans ||
    !Array.isArray(parsed.plans) ||
    parsed.plans.length === 0
  ) {
    console.error(
      chalk.red(
        "[seed-subscription-plans] JSON must contain a non-empty plans array.",
      ),
    );
    process.exit(1);
  }

  const seedApiBase = requireParsedValue(loaded, "SEED_API_BASE");
  const rawBase =
    args.api ||
    (seedApiBase.ok ? seedApiBase.value : undefined) ||
    (args.env === "local"
      ? loaded.parsed.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_BY_ENV.local
      : DEFAULT_API_BASE_BY_ENV[args.env]);

  const apiBase = normalizeSeedApiBase(rawBase);
  const url = `${apiBase}/admin/subscription-plans`;

  console.log(
    chalk.yellow(
      `\nSeed subscription plans — env: ${args.env} (${path.relative(API_ROOT, loaded.envPath)})`,
    ),
  );
  console.log(chalk.yellow("=".repeat(50)));
  console.log(
    `[seed-subscription-plans] url=${url} plans=${parsed.plans.length}`,
  );

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": secretResult.secret,
    },
    body: JSON.stringify({ plans: parsed.plans }),
  });

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    console.error(
      chalk.red("[seed-subscription-plans] Request failed"),
      res.status,
      body,
    );
    process.exit(1);
  }

  console.log(
    chalk.green("[seed-subscription-plans] OK"),
    res.status,
    JSON.stringify(body, null, 2),
  );
}

/** Only auto-run when invoked directly, so tests can import the pure helpers. */
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  void main().catch((error) => {
    console.error(chalk.red("Fatal error:"), error);
    process.exit(1);
  });
}
