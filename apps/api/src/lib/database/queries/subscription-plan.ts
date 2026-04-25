import { v5 as uuidv5 } from "uuid";

import type { ProductType } from "@/lib/constants/database";
import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import SubscriptionPlan from "../models/SubscriptionPlan";

/**
 * Fixed namespace for UUID v5 derivation when `planUuid` is omitted from seed data.
 * Same (productType, planKey) always yields the same `planUuid` across environments.
 */
export const SUBSCRIPTION_PLAN_UUID_NAMESPACE =
  "f47ac10b-58cc-4372-a567-0e02b2c3d479";

export interface SubscriptionPlanInput {
  productType: ProductType;
  planKey: string;
  /** Optional explicit UUID from seed JSON (stable across prod/staging when copied). */
  planUuid?: string;
  displayName?: string;
  description?: string;
  amountInr: number;
  originalAmountInr?: number;
  accessType?: "ONE_TIME" | "SUBSCRIPTION";
  durationMonths?: number;
  features?: string[];
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

/** Resolve stored plan UUID: explicit seed value, else deterministic v5 from SKU. */
export const resolveSubscriptionPlanUuid = (
  input: SubscriptionPlanInput,
  normalizedPlanKey: string,
): string => {
  const explicit = input.planUuid?.trim();
  if (explicit) {
    return explicit.toLowerCase();
  }
  return uuidv5(
    `${input.productType}:${normalizedPlanKey}`,
    SUBSCRIPTION_PLAN_UUID_NAMESPACE,
  );
};

const normalizePlanKey = (key: string) => key.trim().toLowerCase();

/**
 * Authoritative INR price for a subscription SKU. Returns null if missing or inactive.
 */
export const getSubscriptionPlanPriceFromDB = async (
  productType: ProductType,
  planKey: string,
): Promise<number | null> => {
  try {
    const key = normalizePlanKey(planKey);
    const doc = await SubscriptionPlan.findOne({
      productType,
      planKey: key,
      isActive: true,
    }).lean();

    if (!doc || typeof doc.amountInr !== "number") {
      return null;
    }
    return doc.amountInr;
  } catch (error) {
    logger.error("DB: getSubscriptionPlanPriceFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      productType,
      planKey,
    });
    return null;
  }
};

export const listSubscriptionPlansFromDB =
  async (): Promise<DatabaseQueryResponseType> => {
    try {
      const rows = await SubscriptionPlan.find({})
        .sort({ productType: 1, sortOrder: 1, planKey: 1 })
        .lean();
      return { data: rows };
    } catch (error) {
      logger.error("DB: listSubscriptionPlansFromDB failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { error: "Failed to list subscription plans" };
    }
  };

type SubscriptionPlanLean = {
  planUuid?: string;
  displayName?: string;
  description?: string;
  originalAmountInr?: number;
  accessType?: "ONE_TIME" | "SUBSCRIPTION";
  durationMonths?: number;
  features?: string[];
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

/**
 * Merges DB row with request body so **omitted** optional fields keep existing values
 * (partial API/admin payloads do not wipe catalog copy on edit).
 * Explicit `""` or `[]` still clears (caller sent the key).
 */
export const mergeSubscriptionPlanFieldsForUpsert = (
  existing: SubscriptionPlanLean | null,
  p: SubscriptionPlanInput,
  planKey: string,
): {
  productType: ProductType;
  planKey: string;
  planUuid: string;
  displayName: string;
  description: string;
  amountInr: number;
  originalAmountInr: number;
  currency: string;
  accessType: "ONE_TIME" | "SUBSCRIPTION";
  durationMonths: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
} => {
  const ex = existing;
  const planUuid = (() => {
    if (p.planUuid !== undefined) {
      const t = p.planUuid.trim();
      if (t.length > 0) {
        return t.toLowerCase();
      }
    }
    const prev = ex?.planUuid?.toString().trim();
    if (prev) {
      return prev.toLowerCase();
    }
    return resolveSubscriptionPlanUuid(p, planKey);
  })();

  return {
    productType: p.productType,
    planKey,
    planUuid,
    displayName:
      p.displayName !== undefined ? p.displayName : (ex?.displayName ?? ""),
    description:
      p.description !== undefined ? p.description : (ex?.description ?? ""),
    amountInr: p.amountInr,
    originalAmountInr:
      p.originalAmountInr !== undefined
        ? p.originalAmountInr
        : (ex?.originalAmountInr ?? 0),
    currency: "INR",
    accessType:
      p.accessType !== undefined
        ? p.accessType
        : (ex?.accessType ?? "SUBSCRIPTION"),
    durationMonths:
      p.durationMonths !== undefined
        ? p.durationMonths
        : (ex?.durationMonths ?? 0),
    features: p.features !== undefined ? p.features : (ex?.features ?? []),
    isPopular:
      p.isPopular !== undefined ? p.isPopular : (ex?.isPopular ?? false),
    isActive: p.isActive !== undefined ? p.isActive : (ex?.isActive ?? true),
    sortOrder: p.sortOrder !== undefined ? p.sortOrder : (ex?.sortOrder ?? 0),
  };
};

export const upsertSubscriptionPlansInDB = async (
  plans: SubscriptionPlanInput[],
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!plans.length) {
      return { error: "No plans provided" };
    }

    let matched = 0;
    let modified = 0;
    let upserted = 0;

    for (const p of plans) {
      const planKey = normalizePlanKey(p.planKey);
      const existing = await SubscriptionPlan.findOne({
        productType: p.productType,
        planKey,
      }).lean<SubscriptionPlanLean | null>();

      const $set = mergeSubscriptionPlanFieldsForUpsert(existing, p, planKey);

      const res = await SubscriptionPlan.updateOne(
        { productType: p.productType, planKey },
        { $set },
        { upsert: true },
      );

      if (res.matchedCount > 0) {
        matched += 1;
      }
      if (res.modifiedCount > 0) {
        modified += 1;
      }
      if (res.upsertedCount > 0) {
        upserted += 1;
      }
    }

    return {
      data: {
        matched,
        modified,
        upserted,
      },
    };
  } catch (error) {
    logger.error("DB: upsertSubscriptionPlansInDB failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Failed to upsert subscription plans" };
  }
};

export const deleteSubscriptionPlanFromDB = async (
  productType: ProductType,
  planKey: string,
): Promise<DatabaseQueryResponseType> => {
  try {
    const key = normalizePlanKey(planKey);
    const res = await SubscriptionPlan.deleteOne({ productType, planKey: key });
    if (res.deletedCount === 0) {
      return { data: { deleted: false } };
    }
    return { data: { deleted: true } };
  } catch (error) {
    logger.error("DB: deleteSubscriptionPlanFromDB failed", {
      error: error instanceof Error ? error.message : String(error),
      productType,
      planKey,
    });
    return { error: "Failed to delete subscription plan" };
  }
};
