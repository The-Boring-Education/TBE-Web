import { describe, expect, it } from "vitest";

import { isRecoverableCouponQuoteError } from "../../../../platform/src/checkout/quoteErrors";

describe("isRecoverableCouponQuoteError", () => {
  it("returns true for coupon / applicability messaging", () => {
    expect(isRecoverableCouponQuoteError("Coupon not found")).toBe(true);
    expect(
      isRecoverableCouponQuoteError(
        "This coupon is not applicable to this product",
      ),
    ).toBe(true);
  });

  it("returns false for empty message", () => {
    expect(isRecoverableCouponQuoteError("")).toBe(false);
    expect(isRecoverableCouponQuoteError("   ")).toBe(false);
  });

  it("returns false for plan or product configuration errors", () => {
    expect(
      isRecoverableCouponQuoteError(
        "Plan pricing not configured for this product",
      ),
    ).toBe(false);
    expect(
      isRecoverableCouponQuoteError("Not configured or inactive for PREPYATRA"),
    ).toBe(false);
    expect(isRecoverableCouponQuoteError("Interview sheet not found")).toBe(
      false,
    );
    expect(isRecoverableCouponQuoteError("Course not found")).toBe(false);
    expect(isRecoverableCouponQuoteError("Invalid product type")).toBe(false);
  });
});
