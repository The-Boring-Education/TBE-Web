import type { ProductType } from "@/lib/constants/database";

/**
 * Authoritative INR prices for subscription products (Cashfree order_amount is in INR).
 * Keys must match `productId` passed to create-order (plan id, e.g. "3months", "lifetime").
 * Tune per product line; keep in sync with public marketing pages and admin coupons.
 */
export const SUBSCRIPTION_PLAN_PRICES: Partial<
  Record<ProductType, Record<string, number>>
> = {
  PREPYATRA: {
    "1months": 199,
    "3months": 499,
    "6months": 999,
    "12months": 1799,
    lifetime: 1999,
  },
  /** DSA Yatra: single lifetime SKU (productId = "lifetime"). */
  DSA_YATRA: {
    lifetime: 2999,
  },
  /** On Campus: duration plans + optional separate coupon rules in DB. */
  ONCAMPUS: {
    "1months": 199,
    "3months": 499,
    "6months": 999,
    "12months": 1799,
  },
};

export const getSubscriptionPlanPrice = (
  productType: ProductType,
  planKey: string,
): number | null => {
  const catalog = SUBSCRIPTION_PLAN_PRICES[productType];
  if (!catalog) return null;
  const key = planKey.toLowerCase();
  return catalog[key] ?? null;
};
