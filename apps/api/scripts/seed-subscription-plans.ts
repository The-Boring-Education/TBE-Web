/**
 * One-time / occasional seed of subscription SKU prices into MongoDB.
 *
 * 1. Copy subscription-plans.example.json → subscription-plans.local.json (gitignored).
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
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const LOCAL_FILE = path.join(__dirname, "subscription-plans.local.json");
const EXAMPLE_FILE = path.join(__dirname, "subscription-plans.example.json");

async function main() {
  if (!fs.existsSync(LOCAL_FILE)) {
    console.error(
      `[seed-subscription-plans] Missing ${LOCAL_FILE}\n` +
        `Copy ${EXAMPLE_FILE} to subscription-plans.local.json and set amountInr values.`,
    );
    process.exit(1);
  }

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    console.error(
      "[seed-subscription-plans] ADMIN_SECRET is required in environment.",
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

  const rawBase = process.env.NEXT_PUBLIC_API_URL;
  if (!rawBase) {
    console.error(
      "[seed-subscription-plans] NEXT_PUBLIC_API_URL is required in environment.",
    );
    process.exit(1);
  }

  // NEXT_PUBLIC_API_URL is often the origin only (e.g. http://localhost:3004).
  // This handler lives at POST /api/v1/admin/subscription-plans.
  const trimmed = rawBase.replace(/\/$/, "");
  const apiBase = /\/api\/v\d+$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;

  const url = `${apiBase}/admin/subscription-plans`;

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
