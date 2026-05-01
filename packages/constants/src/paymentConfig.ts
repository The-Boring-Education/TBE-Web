/**
 * Centralised Cashfree Payment configuration.
 *
 * All Cashfree-related env vars are consumed here — nowhere else should read
 * CASHFREE_* variables directly from process.env or envConfig.
 *
 * Client-side (Platform SDK):
 *   Uses `NEXT_PUBLIC_CASHFREE_MODE` to choose "sandbox" | "production".
 *   This is a `NEXT_PUBLIC_*` var so Next.js inlines it at build time.
 *
 * Server-side (API):
 *   Uses `CASHFREE_BASE_URL`, `CASHFREE_CLIENT_ID`, `CASHFREE_SECRET_KEY`.
 *   `getCashfreeMode()` falls back to deriving from `CASHFREE_BASE_URL` when
 *   `NEXT_PUBLIC_CASHFREE_MODE` is not set (e.g. in the API app).
 */

type CashfreeMode = "sandbox" | "production";

/* ---------- raw env reads (only place in the codebase) ---------- */

const NEXT_PUBLIC_CASHFREE_MODE = (
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_CASHFREE_MODE
    : undefined
) as string | undefined;

const CASHFREE_BASE_URL = (
  typeof process !== "undefined" ? process.env.CASHFREE_BASE_URL : undefined
) as string | undefined;

const CASHFREE_CLIENT_ID = (
  typeof process !== "undefined" ? process.env.CASHFREE_CLIENT_ID : undefined
) as string | undefined;

const CASHFREE_SECRET_KEY = (
  typeof process !== "undefined" ? process.env.CASHFREE_SECRET_KEY : undefined
) as string | undefined;

/* ---------- helpers ---------- */

/**
 * Determine Cashfree mode.
 *
 * Priority:
 *  1. Explicit `NEXT_PUBLIC_CASHFREE_MODE` (works on client AND server).
 *  2. Derived from `CASHFREE_BASE_URL` — if URL contains "sandbox" → sandbox.
 *  3. Falls back to `"sandbox"` for safety (never accidentally hit production).
 */
const getCashfreeMode = (): CashfreeMode => {
  if (NEXT_PUBLIC_CASHFREE_MODE) {
    return NEXT_PUBLIC_CASHFREE_MODE === "production"
      ? "production"
      : "sandbox";
  }
  if (CASHFREE_BASE_URL && !CASHFREE_BASE_URL.includes("sandbox")) {
    return "production";
  }
  return "sandbox";
};

const isCashfreeSandbox = (): boolean => getCashfreeMode() === "sandbox";

/**
 * Cashfree PG REST base URL normalised to include `/pg`.
 * e.g. `https://sandbox.cashfree.com` → `https://sandbox.cashfree.com/pg`
 *
 * Server-side only — returns empty string when `CASHFREE_BASE_URL` is not set.
 */
const getCashfreePgBaseUrl = (): string => {
  const raw = (CASHFREE_BASE_URL || "").trim().replace(/\/+$/, "");
  if (!raw) return raw;
  return raw.endsWith("/pg") ? raw : `${raw}/pg`;
};

const paymentConfig = {
  getCashfreeMode,
  isCashfreeSandbox,
  getCashfreePgBaseUrl,
  CASHFREE_BASE_URL: CASHFREE_BASE_URL || "",
  CASHFREE_CLIENT_ID: CASHFREE_CLIENT_ID || "",
  CASHFREE_SECRET_KEY: CASHFREE_SECRET_KEY || "",
};

export {
  getCashfreeMode,
  getCashfreePgBaseUrl,
  isCashfreeSandbox,
  paymentConfig,
};
export type { CashfreeMode };
