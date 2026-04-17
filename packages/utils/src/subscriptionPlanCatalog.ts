import { envConfig, routes } from "@tbe/constants";
import type { SubscriptionPlanCatalogRow } from "@tbe/types";

export const formatPriceInr = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const calculateDiscountPercent = (
  original: number,
  current: number,
): number => {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

/** Base URL for Platform checkout (NEXT_PUBLIC_PLATFORM_URL), with local dev fallback. */
export const getPlatformCheckoutOrigin = (): string => {
  const fromEnv = envConfig.PLATFORM_URL?.replace(/\/$/, "") ?? "";
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return "";
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
};

export const isSubscriptionPlanCatalogRow = (
  value: unknown,
): value is SubscriptionPlanCatalogRow => {
  if (!isRecord(value)) return false;
  return (
    typeof value.productType === "string" &&
    typeof value.planKey === "string" &&
    typeof value.displayName === "string" &&
    typeof value.description === "string" &&
    typeof value.amountInr === "number" &&
    typeof value.originalAmountInr === "number" &&
    typeof value.currency === "string" &&
    typeof value.accessType === "string" &&
    typeof value.durationMonths === "number" &&
    isStringArray(value.features) &&
    typeof value.isPopular === "boolean" &&
    typeof value.isActive === "boolean" &&
    typeof value.sortOrder === "number"
  );
};

export const normalizeSubscriptionPlansForPricing = (
  raw: unknown,
): SubscriptionPlanCatalogRow[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isSubscriptionPlanCatalogRow)
    .filter((p) => p.isActive && p.amountInr >= 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

export const buildSubscriptionPlansRequestUrl = (
  productType: string,
): string => {
  const path = routes.api.subscriptionPlans;
  const params = new URLSearchParams({ productType });
  return `${path}?${params.toString()}`;
};
