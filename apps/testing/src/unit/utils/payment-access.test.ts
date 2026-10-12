import { describe, expect, it } from "vitest";

import {
  getPaymentStatusUserMessage,
  isPaymentStatusQueryFailure,
  isUserPurchasedFromPaymentCheck,
} from "../../../../api/src/lib/utils/paymentAccess";

describe("payment access helpers", () => {
  it("treats missing payment and PENDING as free tier (not query failures)", () => {
    expect(
      isPaymentStatusQueryFailure({ data: { purchased: false } }),
    ).toBe(false);
    expect(isUserPurchasedFromPaymentCheck({ data: { purchased: false } })).toBe(
      false,
    );
    expect(
      getPaymentStatusUserMessage({ data: { purchased: false } }),
    ).toBe("Payment not completed");
  });

  it("treats only missing data with error as query failure", () => {
    expect(
      isPaymentStatusQueryFailure({
        error: "Failed to check payment status",
      }),
    ).toBe(true);
    expect(
      isUserPurchasedFromPaymentCheck({
        error: "Failed to check payment status",
      }),
    ).toBe(false);
  });

  it("recognizes purchased users", () => {
    expect(
      isUserPurchasedFromPaymentCheck({
        data: { purchased: true, accessType: "SUBSCRIPTION" },
      }),
    ).toBe(true);
    expect(
      getPaymentStatusUserMessage({
        data: { purchased: true, accessType: "SUBSCRIPTION" },
      }),
    ).toBe("Payment completed");
  });
});
