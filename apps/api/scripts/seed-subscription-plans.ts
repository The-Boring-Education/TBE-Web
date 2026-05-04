/**
 * One-time / occasional seed of subscription SKU prices into MongoDB.
 *
 * 1. Copy subscription-plans.example.json → subscription-plans.json (gitignored).
 * 2. Fill real INR amounts (amountInr).
 * 3. Ensure API is running (or use deployed API URL).
 * 4. Set ADMIN_SECRET in env (same as the API).
 * 5. Run: pnpm seed:subscription-plans (from apps/api)
 *
 * Uses POST /api/v1/admin/subscription-plans with x-admin-secret — never commit secrets or local JSON.
 *
 * Each plan in JSON should include the full catalog (displayName, features, etc.). Optional `planUuid`
 * must be a valid RFC 4122 id; if omitted, the API derives a stable UUID v5 from (productType, planKey).
 * Re-seeding updates the same Mongo row (unique on productType + planKey) — no duplicates.
 *
 * Usage:
 *   pnpm seed:subscription-plans                   # local (default)
 *   pnpm seed:subscription-plans -- --env development
 *   pnpm seed:subscription-plans -- --env production --yes
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type TargetEnv = "local" | "development" | "production";

const arg = (name: string): string | undefined => {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return undefined;
  return process.argv[idx + 1];
};

const hasFlag = (name: string): boolean => process.argv.includes(name);

const resolveTargetEnv = (): TargetEnv => {
  const value = (arg("--env") || "local").toLowerCase();
  if (value === "dev") return "development";
  if (value === "prod") return "production";
  if (value === "local" || value === "development" || value === "production") {
    return value;
  }
  console.error(
    `[seed-subscription-plans] Invalid --env '${value}'. Use one of: local | development | production.`,
  );
  process.exit(1);
};

const loadEnvFiles = (targetEnv: TargetEnv) => {
  const candidates = [
    path.join(__dirname, "../.env"),
    path.join(__dirname, "../.env.local"),
    path.join(__dirname, `../.env.${targetEnv}`),
    path.join(__dirname, `../.env.${targetEnv}.local`),
    path.join(__dirname, `../.env.${targetEnv}`),
  ];

  for (const file of candidates) {
    dotenv.config({ path: file, override: true });
  }
};

const DEFAULT_API_BASE_BY_ENV: Record<TargetEnv, string> = {
  local: "http://localhost:3004/api/v1",
  development: "https://tbe-api-dev.vercel.app/api/v1",
  production: "https://api.theboringeducation.com/api/v1",
};

const LOCAL_FILE = path.join(__dirname, "subscription-plans.json");
const EXAMPLE_FILE = path.join(__dirname, "subscription-plans.example.json");

async function main() {
  const targetEnv = resolveTargetEnv();
  loadEnvFiles(targetEnv);

  if (!fs.existsSync(LOCAL_FILE)) {
    console.error(
      `[seed-subscription-plans] Missing ${LOCAL_FILE}\n` +
        `Copy ${EXAMPLE_FILE} to subscription-plans.json and set amountInr values.`,
    );
    process.exit(1);
  }

  const secret =
    targetEnv === "production"
      ? process.env.ADMIN_SECRET_PROD || process.env.ADMIN_SECRET
      : process.env.ADMIN_SECRET;

  if (!secret) {
    console.error(
      `[seed-subscription-plans] ${
        targetEnv === "production" ? "ADMIN_SECRET_PROD" : "ADMIN_SECRET"
      } is required in environment for --env ${targetEnv}.`,
    );
    process.exit(1);
  }

  if (targetEnv === "production" && !hasFlag("--yes")) {
    console.error(
      "[seed-subscription-plans] Refusing to seed production without explicit confirmation. Re-run with --yes.",
    );
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
      "[seed-subscription-plans] JSON must contain a non-empty plans array.",
    );
    process.exit(1);
  }

  const rawBase =
    arg("--api") ||
    process.env.SEED_API_BASE ||
    (targetEnv === "local" ? process.env.NEXT_PUBLIC_API_URL : undefined) ||
    DEFAULT_API_BASE_BY_ENV[targetEnv];

  // NEXT_PUBLIC_API_URL is often the origin only (e.g. http://localhost:3004).
  // This handler lives at POST /api/v1/admin/subscription-plans.
  const trimmed = rawBase.replace(/\/$/, "");
  const apiBase = /\/api\/v\d+$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
  console.log(`[seed-subscription-plans] Using API base URL: ${apiBase}`);

  const url = `${apiBase}/admin/subscription-plans`;

  console.log(
    `[seed-subscription-plans] env=${targetEnv} url=${url} plans=${parsed.plans.length}`,
  );

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": secret,
    },
    body: JSON.stringify({ plans: parsed.plans }),
  });

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    console.error("[seed-subscription-plans] Request failed", res.status, body);
    process.exit(1);
  }

  console.log(
    "[seed-subscription-plans] OK",
    res.status,
    JSON.stringify(body, null, 2),
  );
}

void main();
