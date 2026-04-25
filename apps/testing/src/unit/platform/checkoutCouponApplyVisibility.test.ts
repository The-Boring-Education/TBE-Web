import { describe, expect, it } from "vitest";

import { shouldShowCheckoutApplyButton } from "../../../../platform/src/checkout/checkoutCouponApplyVisibility";

describe("shouldShowCheckoutApplyButton", () => {
  it("hides apply when server coupon matches draft and no error", () => {
    expect(shouldShowCheckoutApplyButton("OFF", "OFF", null)).toBe(false);
    expect(shouldShowCheckoutApplyButton("off", "  OFF  ", null)).toBe(false);
  });

  it("shows apply when user edits the draft away from applied code", () => {
    expect(shouldShowCheckoutApplyButton("OFF", "OTHER", null)).toBe(true);
  });

  it("shows apply when there is no applied coupon on quote", () => {
    expect(shouldShowCheckoutApplyButton(null, "OFF", null)).toBe(true);
    expect(shouldShowCheckoutApplyButton(undefined, "", null)).toBe(true);
  });

  it("shows apply when there is a coupon-apply error (retry path)", () => {
    expect(
      shouldShowCheckoutApplyButton("OFF", "OFF", "Coupon not found"),
    ).toBe(true);
  });
});
