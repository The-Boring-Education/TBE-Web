import type { ProductType } from "@/lib/constants/database";
import type { DatabaseQueryResponseType } from "@/lib/interfaces";
import { logger } from "@/lib/utils/logger";

import SubscriptionPlan from "../models/SubscriptionPlan";

export interface SubscriptionPlanInput {
  productType: ProductType;
  planKey: string;
  amountInr: number;
  isActive?: boolean;
}

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
        .sort({ productType: 1, planKey: 1 })
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
      return {
        updateOne: {
          filter: { productType: p.productType, planKey },
          update: {
            $set: {
              productType: p.productType,
              planKey,
              amountInr: p.amountInr,
              isActive: p.isActive ?? true,
              currency: "INR",
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
