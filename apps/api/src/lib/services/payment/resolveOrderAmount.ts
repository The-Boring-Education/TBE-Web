import { calculatePriceBreakdown } from "@tbe/utils";

import type { ProductType } from "@/lib/constants/database";
import {
  getACourseFromDBById,
  getInterviewSheetByIDFromDB,
  getSubscriptionPlanPriceFromDB,
  validateCouponForProductFromDB,
} from "@/lib/database";
import type { CouponModel, InterviewSheetModel } from "@/lib/interfaces";

type InterviewSheetForPricing = Parameters<typeof calculatePriceBreakdown>[0];

export interface ResolveOrderAmountParams {
  productType: ProductType;
  productId: string;
  couponCode?: string | null;
  userId?: string;
}

export interface ResolvedOrderAmount {
  baseAmount: number;
  finalAmount: number;
  appliedCoupon?: string;
  couponCode?: string;
  /** Present when a valid coupon was applied (for checkout UI). */
  couponDescription?: string;
  couponDiscountPercentage?: number;
  couponMinimumAmount?: number;
}

const toCouponModel = (doc: CouponModel): CouponModel => {
  const o =
    typeof (doc as { toObject?: (opts?: object) => CouponModel }).toObject ===
    "function"
      ? (doc as { toObject: (opts?: object) => CouponModel }).toObject({
          virtuals: true,
        })
      : doc;
  return { ...o, isValid: true } as CouponModel;
};

const applyCouponToFlatPrice = (
  baseAmount: number,
  productId: string,
  coupon: CouponModel,
): number => {
  const applicable =
    !coupon.applicableProducts?.length ||
    coupon.applicableProducts.includes(productId);
  if (!applicable || baseAmount < (coupon.minimumAmount ?? 0)) {
    return baseAmount;
  }
  const discount = (baseAmount * (coupon.discountPercentage ?? 0)) / 100;
  return Math.max(0, Math.round((baseAmount - discount) * 100) / 100);
};

type CouponResolution = {
  coupon?: CouponModel;
  appliedCoupon?: string;
  couponCode?: string;
};

const resolveCoupon = async ({
  couponCode,
  productId,
  productType,
  userId,
}: {
  couponCode?: string | null;
  productId: string;
  productType: ProductType;
  userId?: string;
}): Promise<
  { ok: true; data: CouponResolution } | { ok: false; error: string }
> => {
  if (!couponCode) {
    return { ok: true, data: {} };
  }

  const { data: coupon, error } = await validateCouponForProductFromDB(
    couponCode,
    productId,
    productType,
    userId,
  );

  if (error || !coupon) {
    return { ok: false, error: error || "Invalid coupon" };
  }

  const couponModel = toCouponModel(coupon as CouponModel);
  return {
    ok: true,
    data: {
      coupon: couponModel,
      appliedCoupon: coupon._id.toString(),
      couponCode: coupon.code,
    },
  };
};

const buildResolvedAmount = (
  baseAmount: number,
  finalAmount: number,
  coupon?: CouponResolution,
): ResolvedOrderAmount => ({
  baseAmount,
  finalAmount,
  ...(coupon?.appliedCoupon ? { appliedCoupon: coupon.appliedCoupon } : {}),
  ...(coupon?.couponCode ? { couponCode: coupon.couponCode } : {}),
  ...(coupon?.coupon
    ? {
        couponDescription: coupon.coupon.description,
        couponDiscountPercentage: coupon.coupon.discountPercentage,
        couponMinimumAmount: coupon.coupon.minimumAmount,
      }
    : {}),
});

const ensurePositivePrice = (
  price: number,
  message: string,
): { ok: false; error: string } | null => {
  if (!price || price <= 0) {
    return { ok: false, error: message };
  }
  return null;
};

const resolveFlatPrice = async ({
  baseAmount,
  errorMessage,
  productId,
  productType,
  couponCode,
  userId,
}: {
  baseAmount: number;
  errorMessage: string;
  productId: string;
  productType: ProductType;
  couponCode?: string | null;
  userId?: string;
}): Promise<
  | {
      ok: true;
      data: ResolvedOrderAmount;
    }
  | { ok: false; error: string }
> => {
  const invalid = ensurePositivePrice(baseAmount, errorMessage);
  if (invalid) {
    return invalid;
  }

  const couponResult = await resolveCoupon({
    couponCode,
    productId,
    productType,
    userId,
  });

  if (!couponResult.ok) {
    return { ok: false, error: couponResult.error };
  }

  const finalAmount = couponResult.data.coupon
    ? applyCouponToFlatPrice(baseAmount, productId, couponResult.data.coupon)
    : baseAmount;

  return {
    ok: true,
    data: buildResolvedAmount(baseAmount, finalAmount, couponResult.data),
  };
};

const subscriptionPlanProductTypes: ProductType[] = [
  "PREPYATRA",
  "DSA_YATRA",
  "ONCAMPUS",
  "PROJECTS",
  "WEBINAR",
  "GENERAL",
];

/**
 * Server-side price resolution for Cashfree orders. Never trust client-supplied amounts.
 */
export const resolveAuthoritativeOrderAmount = async ({
  productType,
  productId,
  couponCode,
  userId,
}: ResolveOrderAmountParams): Promise<
  | {
      ok: true;
      data: ResolvedOrderAmount;
    }
  | { ok: false; error: string }
> => {
  try {
    switch (productType) {
      case "INTERVIEW_SHEET": {
        const { data: sheet, error } =
          await getInterviewSheetByIDFromDB(productId);
        if (error || !sheet) {
          return { ok: false, error: error || "Interview sheet not found" };
        }
        const sheetModel = sheet as unknown as InterviewSheetModel;
        const baseAmount = sheetModel.price ?? 0;
        const invalid = ensurePositivePrice(baseAmount, "Invalid sheet price");
        if (invalid) {
          return invalid;
        }

        const couponResult = await resolveCoupon({
          couponCode,
          productId,
          productType,
          userId,
        });

        if (!couponResult.ok) {
          return { ok: false, error: couponResult.error };
        }

        const breakdown = calculatePriceBreakdown(
          sheetModel as unknown as InterviewSheetForPricing,
          couponResult.data.coupon,
        );

        return {
          ok: true,
          data: buildResolvedAmount(
            baseAmount,
            breakdown.finalPrice,
            couponResult.data,
          ),
        };
      }

      case "SHIKSHA": {
        const { data: course, error } = await getACourseFromDBById(productId);
        if (error || !course) {
          return { ok: false, error: error || "Course not found" };
        }
        const baseAmount = (course as { price?: number }).price ?? 0;
        return resolveFlatPrice({
          baseAmount,
          errorMessage: "Invalid course price",
          productId,
          productType,
          couponCode,
          userId,
        });
      }

      default:
        if (!subscriptionPlanProductTypes.includes(productType)) {
          return { ok: false, error: "Unsupported product type" };
        }

        const price = await getSubscriptionPlanPriceFromDB(
          productType,
          productId,
        );

        return resolveFlatPrice({
          baseAmount: price ?? 0,
          errorMessage: `Plan pricing not configured or inactive for ${productType} / ${productId}. Ask an admin to seed subscription plans.`,
          productId,
          productType,
          couponCode,
          userId,
        });
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to resolve order amount",
    };
  }
};
