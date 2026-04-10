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
  if (!parsed.plans || !Array.isArray(parsed.plans) || parsed.plans.length === 0) {
    console.error("[seed-subscription-plans] JSON must contain a non-empty plans array.");
    process.exit(1);
  }

  const apiBase = (
    process.env.SEED_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3004/api/v1"
  ).replace(/\/$/, "");

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

  console.log("[seed-subscription-plans] OK", res.status, JSON.stringify(body, null, 2));
}

void main();
