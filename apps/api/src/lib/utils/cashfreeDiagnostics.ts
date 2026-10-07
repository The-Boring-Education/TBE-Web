import {
  getCashfreeMode,
  getCashfreePgBaseUrl,
  paymentConfig,
} from "@tbe/constants";

export type CashfreeConfigSnapshot = {
  pgBaseUrl: string;
  ordersUrl: string;
  mode: "sandbox" | "production";
  looksLikeSandbox: boolean;
  modeUrlMismatch: boolean;
  clientIdConfigured: boolean;
  secretConfigured: boolean;
  clientIdSuffix: string;
};

export type CashfreeGatewayErrorDetails = {
  message?: string;
  code?: string;
  type?: string;
  help?: string;
};

const firstNonEmptyString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
};

/**
 * Last-4 suffix only — never log the full Cashfree App ID or secret.
 */
export const maskIdentifierSuffix = (value: string, visible = 4): string => {
  if (!value) return "";
  if (value.length <= visible) {
    return "*".repeat(value.length);
  }
  return `…${value.slice(-visible)}`;
};

export const getCashfreeConfigSnapshot = (): CashfreeConfigSnapshot => {
  const pgBaseUrl = getCashfreePgBaseUrl();
  const mode = getCashfreeMode();
  const looksLikeSandbox = pgBaseUrl.includes("sandbox");
  const clientId = paymentConfig.CASHFREE_CLIENT_ID;
  const secret = paymentConfig.CASHFREE_SECRET_KEY;

  return {
    pgBaseUrl,
    ordersUrl: pgBaseUrl ? `${pgBaseUrl}/orders` : "",
    mode,
    looksLikeSandbox,
    modeUrlMismatch:
      Boolean(pgBaseUrl) &&
      ((mode === "production" && looksLikeSandbox) ||
        (mode === "sandbox" && !looksLikeSandbox)),
    clientIdConfigured: Boolean(clientId),
    secretConfigured: Boolean(secret),
    clientIdSuffix: maskIdentifierSuffix(clientId),
  };
};

export const extractCashfreeErrorDetails = (
  data: unknown,
): CashfreeGatewayErrorDetails => {
  if (!data || typeof data !== "object") {
    return typeof data === "string" && data.trim()
      ? { message: data.trim() }
      : {};
  }

  const d = data as Record<string, unknown>;
  const nested =
    d.error && typeof d.error === "object" && d.error !== null
      ? (d.error as Record<string, unknown>)
      : undefined;

  const arrayMessage = Array.isArray(d.message) ? d.message[0] : undefined;

  return {
    message: firstNonEmptyString(
      d.message,
      arrayMessage,
      d.error,
      nested?.message,
      d.sub_code,
    ),
    code: firstNonEmptyString(d.code, nested?.code, d.sub_code),
    type: firstNonEmptyString(d.type, nested?.type),
    help: firstNonEmptyString(d.help, nested?.help),
  };
};

/** Safe subset of a Cashfree error body — never include credentials. */
export const sanitizeCashfreeGatewayBody = (
  data: unknown,
): Record<string, unknown> | string | undefined => {
  if (data === null || data === undefined) return undefined;
  if (typeof data === "string") {
    return data.slice(0, 500);
  }
  if (typeof data !== "object") {
    return String(data);
  }

  const details = extractCashfreeErrorDetails(data);
  const raw = data as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const key of ["message", "code", "type", "help", "sub_code"] as const) {
    if (details[key as keyof CashfreeGatewayErrorDetails]) {
      sanitized[key] = details[key as keyof CashfreeGatewayErrorDetails];
    } else if (typeof raw[key] === "string") {
      sanitized[key] = raw[key];
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : { parsed: false };
};
