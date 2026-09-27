import { envConfig } from "./envConfig";

/**
 * Cashfree payment helpers.
 */

type CashfreeMode = "sandbox" | "production";

const getCashfreeMode = (): CashfreeMode => {
  if (envConfig.CASHFREE_MODE) {
    return envConfig.CASHFREE_MODE === "production" ? "production" : "sandbox";
  }
  if (
    envConfig.CASHFREE_BASE_URL &&
    !envConfig.CASHFREE_BASE_URL.includes("sandbox")
  ) {
    return "production";
  }
  return "sandbox";
};

const isCashfreeSandbox = (): boolean => getCashfreeMode() === "sandbox";

/**
 * SDK mode for a hosted checkout link returned by create-order.
 * `api.cashfree.com` is production. `sandbox.cashfree.com` is sandbox.
 * Returns undefined when the link is missing or not a Cashfree host, so the
 * caller can fall back to `getCashfreeMode()`.
 */
const cashfreeModeFromPaymentLink = (
  paymentLink: string | undefined,
): CashfreeMode | undefined => {
  if (!paymentLink) return undefined;
  let host = "";
  try {
    host = new URL(paymentLink).hostname.toLowerCase();
  } catch {
    return undefined;
  }
  if (!host.endsWith("cashfree.com")) return undefined;
  return host.includes("sandbox") ? "sandbox" : "production";
};

/**
 * Cashfree PG REST base URL normalised to include `/pg`.
 * e.g. `https://sandbox.cashfree.com` → `https://sandbox.cashfree.com/pg`
 *
 * Server-side only — returns empty string when `CASHFREE_BASE_URL` is not set.
 */
const getCashfreePgBaseUrl = (): string => {
  const raw = (envConfig.CASHFREE_BASE_URL || "").trim().replace(/\/+$/, "");
  if (!raw) return raw;
  return raw.endsWith("/pg") ? raw : `${raw}/pg`;
};

const paymentConfig = {
  getCashfreeMode,
  isCashfreeSandbox,
  getCashfreePgBaseUrl,
  CASHFREE_BASE_URL: envConfig.CASHFREE_BASE_URL || "",
  CASHFREE_CLIENT_ID: envConfig.CASHFREE_CLIENT_ID || "",
  CASHFREE_SECRET_KEY: envConfig.CASHFREE_SECRET_KEY || "",
};

export {
  cashfreeModeFromPaymentLink,
  getCashfreeMode,
  getCashfreePgBaseUrl,
  isCashfreeSandbox,
  paymentConfig,
};
export type { CashfreeMode };
