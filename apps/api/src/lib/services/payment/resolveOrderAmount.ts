import type { ProductType } from "@/lib/constants/database";
import {
  getACourseFromDBById,
  getInterviewSheetByIDFromDB,
  validateCouponForProductFromDB,
} from "@/lib/database";
import type { CouponModel, InterviewSheetModel } from "@/lib/interfaces";
import { calculatePriceBreakdown } from "@tbe/utils";

import { getSubscriptionPlanPrice } from "./subscriptionPlanCatalog";

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

/**
 * Server-side price resolution for Cashfree orders. Never trust client-supplied amounts.
 */
export const resolveAuthoritativeOrderAmount = async ({
  productType,
  productId,
  couponCode,
  userId,
}: ResolveOrderAmountParams): Promise<{
  ok: true;
  data: ResolvedOrderAmount;
} | { ok: false; error: string }> => {
  try {
    let baseAmount = 0;

    switch (productType) {
      case "INTERVIEW_SHEET": {
        const { data: sheet, error } = await getInterviewSheetByIDFromDB(
          productId,
        );
        if (error || !sheet) {
          return { ok: false, error: error || "Interview sheet not found" };
        }
        const sheetModel = sheet as unknown as InterviewSheetModel;
        baseAmount = sheetModel.price ?? 0;
        if (!baseAmount || baseAmount <= 0) {
          return { ok: false, error: "Invalid sheet price" };
        }

        if (couponCode) {
          const { data: coupon, error: cErr } =
            await validateCouponForProductFromDB(
              couponCode,
              productId,
              productType,
              userId,
            );
          if (cErr || !coupon) {
            return { ok: false, error: cErr || "Invalid coupon" };
          }
          const couponModel = toCouponModel(coupon as CouponModel);
          const breakdown = calculatePriceBreakdown(sheetModel, couponModel);
          return {
            ok: true,
            data: {
              baseAmount,
              finalAmount: breakdown.finalPrice,
              appliedCoupon: coupon._id.toString(),
              couponCode: coupon.code,
            },
          };
        }

        const breakdown = calculatePriceBreakdown(sheetModel);
        return {
          ok: true,
          data: {
            baseAmount,
            finalAmount: breakdown.finalPrice,
          },
        };
      }

      case "SHIKSHA": {
        const { data: course, error } = await getACourseFromDBById(productId);
        if (error || !course) {
          return { ok: false, error: error || "Course not found" };
        }
        const price = (course as { price?: number }).price ?? 0;
        if (!price || price <= 0) {
          return { ok: false, error: "Invalid course price" };
        }
        baseAmount = price;

        if (couponCode) {
          const { data: coupon, error: cErr } =
            await validateCouponForProductFromDB(
              couponCode,
              productId,
              productType,
              userId,
            );
          if (cErr || !coupon) {
            return { ok: false, error: cErr || "Invalid coupon" };
          }
          const couponModel = toCouponModel(coupon as CouponModel);
          const finalAmount = applyCouponToFlatPrice(
            baseAmount,
            productId,
            couponModel,
          );
          return {
            ok: true,
            data: {
              baseAmount,
              finalAmount,
              appliedCoupon: coupon._id.toString(),
              couponCode: coupon.code,
            },
          };
        }

        return { ok: true, data: { baseAmount, finalAmount: baseAmount } };
      }

      case "PREPYATRA":
      case "DSA_YATRA":
      case "ONCAMPUS": {
        const price = getSubscriptionPlanPrice(productType, productId);
        if (price === null || price <= 0) {
          return {
            ok: false,
            error: `Unknown or invalid plan for ${productType}: ${productId}`,
          };
        }
        baseAmount = price;

        if (couponCode) {
          const { data: coupon, error: cErr } =
            await validateCouponForProductFromDB(
              couponCode,
              productId,
              productType,
              userId,
            );
          if (cErr || !coupon) {
            return { ok: false, error: cErr || "Invalid coupon" };
          }
          const couponModel = toCouponModel(coupon as CouponModel);
          const finalAmount = applyCouponToFlatPrice(
            baseAmount,
            productId,
            couponModel,
          );
          return {
            ok: true,
            data: {
              baseAmount,
              finalAmount,
              appliedCoupon: coupon._id.toString(),
              couponCode: coupon.code,
            },
          };
        }

        return { ok: true, data: { baseAmount, finalAmount: baseAmount } };
      }

      case "PROJECTS":
      case "WEBINAR":
      case "GENERAL":
        return {
          ok: false,
          error: `Price resolution for ${productType} is not implemented — add catalog or DB fields`,
        };

      default:
        return { ok: false, error: "Unsupported product type" };
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to resolve order amount",
    };
  }
};
