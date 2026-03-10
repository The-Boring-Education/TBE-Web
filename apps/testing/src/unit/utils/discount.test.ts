import { describe, it, expect } from "vitest";
import {
  calculatePriceBreakdown,
  getDiscountDisplayInfo,
  validateCouponForSheet,
  formatPrice,
  getSavingsPercentage,
} from "@tbe/utils/discount";
import type { InterviewSheetModel, CouponModel } from "@tbe/interface";

describe("Discount Utilities", () => {
  const createMockSheet = (
    overrides: Partial<InterviewSheetModel> = {},
  ): InterviewSheetModel =>
    ({
      _id: "sheet-123" as any,
      price: 1000,
      discountPercentage: 10,
      ...overrides,
    }) as InterviewSheetModel;

  const createMockCoupon = (
    overrides: Partial<CouponModel> = {},
  ): CouponModel =>
    ({
      _id: "coupon-123" as any,
      code: "TEST10",
      discountPercentage: 10,
      isActive: true,
      isValid: true,
      isExpired: false,
      isUsageLimitReached: false,
      applicableProducts: [],
      minimumAmount: 0,
      ...overrides,
    }) as CouponModel;

  describe("calculatePriceBreakdown", () => {
    it("should calculate price breakdown without coupon", () => {
      const sheet = createMockSheet({ price: 1000, discountPercentage: 20 });

      const result = calculatePriceBreakdown(sheet);

      expect(result.originalPrice).toBe(1000);
      expect(result.discountPercentage).toBe(20);
      expect(result.discountAmount).toBe(200);
      expect(result.couponDiscount).toBe(0);
      expect(result.totalDiscount).toBe(200);
      expect(result.finalPrice).toBe(800);
      expect(result.savings).toBe(200);
    });

    it("should calculate price breakdown with coupon", () => {
      const sheet = createMockSheet({ price: 1000, discountPercentage: 10 });
      const coupon = createMockCoupon({ discountPercentage: 5, isValid: true });

      const result = calculatePriceBreakdown(sheet, coupon);

      expect(result.originalPrice).toBe(1000);
      expect(result.discountPercentage).toBe(10);
      expect(result.discountAmount).toBe(100);
      // Coupon applied on price after sheet discount (900 * 5% = 45)
      expect(result.couponDiscount).toBe(45);
      expect(result.totalDiscount).toBe(145);
      expect(result.finalPrice).toBe(855);
      expect(result.savings).toBe(145);
    });

    it("should handle coupon with product restriction", () => {
      const sheet = createMockSheet({ _id: "sheet-123" as any });
      const coupon = createMockCoupon({
        applicableProducts: ["sheet-456"], // Different sheet
        isValid: true,
      });

      const result = calculatePriceBreakdown(sheet, coupon);

      // Coupon should not apply
      expect(result.couponDiscount).toBe(0);
    });

    it("should handle coupon with minimum amount requirement", () => {
      const sheet = createMockSheet({ price: 500, discountPercentage: 10 });
      const coupon = createMockCoupon({
        minimumAmount: 1000, // Higher than price after discount
        isValid: true,
      });

      const result = calculatePriceBreakdown(sheet, coupon);

      // Coupon should not apply due to minimum amount
      expect(result.couponDiscount).toBe(0);
    });

    it("should handle zero price", () => {
      const sheet = createMockSheet({ price: 0, discountPercentage: 10 });

      const result = calculatePriceBreakdown(sheet);

      expect(result.originalPrice).toBe(0);
      expect(result.finalPrice).toBe(0);
    });

    it("should ensure final price is never negative", () => {
      const sheet = createMockSheet({ price: 100, discountPercentage: 50 });
      const coupon = createMockCoupon({
        discountPercentage: 100,
        isValid: true,
      });

      const result = calculatePriceBreakdown(sheet, coupon);

      expect(result.finalPrice).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getDiscountDisplayInfo", () => {
    it("should show discount info when sheet has discount", () => {
      const sheet = createMockSheet({ discountPercentage: 15 });

      const result = getDiscountDisplayInfo(sheet);

      expect(result.hasDiscount).toBe(true);
      expect(result.showDiscountBadge).toBe(true);
      expect(result.discountText).toBe("15% OFF");
    });

    it("should show coupon info when coupon is applied", () => {
      const sheet = createMockSheet();
      const coupon = createMockCoupon({
        code: "SAVE20",
        discountPercentage: 20,
      });

      const result = getDiscountDisplayInfo(sheet, coupon);

      expect(result.hasDiscount).toBe(true);
      expect(result.couponCode).toBe("SAVE20");
      expect(result.couponText).toContain("SAVE20");
    });

    it("should show no discount when neither sheet nor coupon has discount", () => {
      const sheet = createMockSheet({ discountPercentage: 0 });

      const result = getDiscountDisplayInfo(sheet);

      expect(result.hasDiscount).toBe(false);
      expect(result.showDiscountBadge).toBe(false);
    });

    it("should handle invalid coupon", () => {
      const sheet = createMockSheet();
      const coupon = createMockCoupon({ isValid: false });

      const result = getDiscountDisplayInfo(sheet, coupon);

      expect(result.hasDiscount).toBe(true); // Sheet has discount
      expect(result.couponText).toBe(""); // Invalid coupon doesn't show text
    });
  });

  describe("validateCouponForSheet", () => {
    it("should validate active coupon", () => {
      const sheet = createMockSheet({ price: 1000 });
      const coupon = createMockCoupon({ isValid: true });

      const result = validateCouponForSheet(coupon, sheet, 1000);

      expect(result.isValid).toBe(true);
    });

    it("should reject inactive coupon", () => {
      const sheet = createMockSheet();
      const coupon = createMockCoupon({ isActive: false });

      const result = validateCouponForSheet(coupon, sheet, 1000);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Coupon is inactive");
    });

    it("should reject expired coupon", () => {
      const sheet = createMockSheet();
      const coupon = createMockCoupon({ isExpired: true });

      const result = validateCouponForSheet(coupon, sheet, 1000);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Coupon has expired");
    });

    it("should reject coupon with usage limit reached", () => {
      const sheet = createMockSheet();
      const coupon = createMockCoupon({ isUsageLimitReached: true });

      const result = validateCouponForSheet(coupon, sheet, 1000);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Coupon usage limit reached");
    });

    it("should reject coupon not applicable to product", () => {
      const sheet = createMockSheet({ _id: "sheet-123" as any });
      const coupon = createMockCoupon({
        applicableProducts: ["sheet-456"],
      });

      const result = validateCouponForSheet(coupon, sheet, 1000);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Coupon not applicable to this product");
    });

    it("should accept coupon with empty applicableProducts (all products)", () => {
      const sheet = createMockSheet();
      const coupon = createMockCoupon({
        applicableProducts: [], // Empty means all products
      });

      const result = validateCouponForSheet(coupon, sheet, 1000);

      expect(result.isValid).toBe(true);
    });

    it("should reject coupon when price is below minimum amount", () => {
      const sheet = createMockSheet();
      const coupon = createMockCoupon({ minimumAmount: 2000 });

      const result = validateCouponForSheet(coupon, sheet, 1000);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain("Minimum order amount");
    });
  });

  describe("formatPrice", () => {
    it("should format price with Indian locale", () => {
      expect(formatPrice(1000)).toBe("₹1,000");
      expect(formatPrice(10000)).toBe("₹10,000");
      expect(formatPrice(100000)).toBe("₹1,00,000");
    });

    it("should format zero price", () => {
      expect(formatPrice(0)).toBe("₹0");
    });

    it("should format decimal prices", () => {
      expect(formatPrice(1234.56)).toBe("₹1,234.56");
    });

    it("should format large numbers", () => {
      expect(formatPrice(1000000)).toBe("₹10,00,000");
    });
  });

  describe("getSavingsPercentage", () => {
    it("should calculate savings percentage correctly", () => {
      expect(getSavingsPercentage(1000, 800)).toBe(20);
      expect(getSavingsPercentage(1000, 500)).toBe(50);
    });

    it("should return 0 when original price is 0", () => {
      expect(getSavingsPercentage(0, 0)).toBe(0);
      expect(getSavingsPercentage(0, 100)).toBe(0);
    });

    it("should round savings percentage", () => {
      expect(getSavingsPercentage(1000, 833)).toBe(17); // 16.7% rounded
    });

    it("should handle negative savings (price increase)", () => {
      expect(getSavingsPercentage(1000, 1200)).toBe(-20);
    });
  });
});
