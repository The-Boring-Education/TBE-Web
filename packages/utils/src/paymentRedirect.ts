import { APP_CONFIGS, envConfig } from "@tbe/constants";

const SUBSCRIPTION_PRODUCT_TYPES = new Set([
  "DSA_YATRA",
  "PREPYATRA",
  "ONCAMPUS",
]);

/** Local dev ports from each app’s `package.json` (`next dev -p`). */
const DEV_APP_ORIGIN: Record<string, string> = {
  DSA_YATRA: "http://localhost:3005",
  PREPYATRA: "http://localhost:3001",
  ONCAMPUS: "http://localhost:3007",
};

const PROD_APP_ORIGIN: Record<string, string> = {
  DSA_YATRA: APP_CONFIGS.dsayatra.domain,
  PREPYATRA: APP_CONFIGS["prep-yatra"].domain,
  ONCAMPUS: "https://oncampus.theboringeducation.com",
};

const stripTrailingSlash = (value: string): string => value.replace(/\/$/, "");

const isAllowedAbsoluteContinueUrl = (raw: string): boolean => {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (u.hostname === "localhost") return true;
    return u.hostname.endsWith("theboringeducation.com");
  } catch {
    return false;
  }
};

/** Relative in-app path only — blocks protocol-relative URLs (`//host/...`) and backslashes. */
const sanitizeRelativeNextPath = (
  path: string | undefined,
  fallback: string,
): string => {
  if (typeof path !== "string" || !path.startsWith("/")) {
    return fallback;
  }
  if (path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }
  return path;
};

const getPlatformOrigin = (): string => {
  const fromEnv = envConfig.PLATFORM_URL?.replace(/\/$/, "") ?? "";
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return "";
};

const getSubscriptionAppOrigin = (productType: string): string => {
  const envMap: Record<string, string | undefined> = {
    DSA_YATRA: process.env.NEXT_PUBLIC_DSAYATRA_APP_URL,
    PREPYATRA: process.env.NEXT_PUBLIC_PREPYATRA_APP_URL,
    ONCAMPUS: process.env.NEXT_PUBLIC_ONCAMPUS_APP_URL,
  };
  const fromEnv = envMap[productType]?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV !== "production") {
    return DEV_APP_ORIGIN[productType] ?? getPlatformOrigin();
  }

  return PROD_APP_ORIGIN[productType] ?? getPlatformOrigin();
};

export type ResolvePaymentSuccessContinueHrefParams = {
  nextQuery: string | undefined;
  productType: string | undefined;
  /** Platform-only success target when `next` is missing or invalid (e.g. `/user/dashboard`). */
  platformFallbackPath: string;
};

/**
 * After payment on Platform, the `next` query is often a relative path such as `/dashboard`.
 * That path is correct for product apps but resolves on the Platform origin when used in a
 * `<Link>` on `/payment/status`. For subscription products, prepend the product app origin.
 * If `next` is already an absolute URL to an allowed host, it is preserved.
 */
export const resolvePaymentSuccessContinueHref = ({
  nextQuery,
  productType,
  platformFallbackPath,
}: ResolvePaymentSuccessContinueHrefParams): string => {
  if (typeof nextQuery === "string" && /^https?:\/\//i.test(nextQuery)) {
    const trimmed = nextQuery.trim();
    if (isAllowedAbsoluteContinueUrl(trimmed)) {
      return trimmed;
    }
  }

  const path = sanitizeRelativeNextPath(nextQuery, "/dashboard");

  if (productType && SUBSCRIPTION_PRODUCT_TYPES.has(productType)) {
    const origin = stripTrailingSlash(getSubscriptionAppOrigin(productType));
    return `${origin}${path}`;
  }

  return sanitizeRelativeNextPath(nextQuery, platformFallbackPath);
};
