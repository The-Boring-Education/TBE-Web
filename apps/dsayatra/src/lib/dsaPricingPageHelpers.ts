import { envConfig, routes } from "@tbe/constants";

import type { DsaSubscriptionPlan } from "../types/dsaSubscriptionPlan";

export const getPlatformOrigin = (): string => {
  const fromEnv = envConfig.PLATFORM_URL?.replace(/\/$/, "") ?? "";
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return "";
};

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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
};

/** Narrow API rows to the shape the pricing UI expects; drops malformed entries. */
export const isDsaSubscriptionPlan = (
  value: unknown,
): value is DsaSubscriptionPlan => {
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

export const normalizePlansForPricing = (
  raw: unknown,
): DsaSubscriptionPlan[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isDsaSubscriptionPlan)
    .filter((p) => p.isActive && p.amountInr >= 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

export const buildDsaSubscriptionPlansRequestUrl = (
  productType: string,
): string => {
  const path = routes.api.subscriptionPlans;
  const params = new URLSearchParams({ productType });
  return `${path}?${params.toString()}`;
};
