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

export const upsertSubscriptionPlansInDB = async (
  plans: SubscriptionPlanInput[],
): Promise<DatabaseQueryResponseType> => {
  try {
    if (!plans.length) {
      return { error: "No plans provided" };
    }

    const bulk = plans.map((p) => {
      const planKey = normalizePlanKey(p.planKey);
      const planUuid = resolveSubscriptionPlanUuid(p, planKey);
      return {
        updateOne: {
          filter: { productType: p.productType, planKey },
          update: {
            $set: {
              productType: p.productType,
              planKey,
              planUuid,
              displayName: p.displayName ?? "",
              description: p.description ?? "",
              amountInr: p.amountInr,
              originalAmountInr: p.originalAmountInr ?? 0,
              currency: "INR",
              accessType: p.accessType ?? "SUBSCRIPTION",
              durationMonths: p.durationMonths ?? 0,
              features: p.features ?? [],
              isPopular: p.isPopular ?? false,
              isActive: p.isActive ?? true,
              sortOrder: p.sortOrder ?? 0,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await SubscriptionPlan.bulkWrite(bulk, { ordered: false });
    return {
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
      },
    };
  } catch (error) {
    logger.error("DB: upsertSubscriptionPlansInDB failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { error: "Failed to upsert subscription plans" };
  }
};
