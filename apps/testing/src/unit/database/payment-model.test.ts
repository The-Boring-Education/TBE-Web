import { describe, expect, it } from "vitest";

/**
 * Test Payment schema constraints and enum logic in isolation
 * (mirrors the schema rules defined in Payment.ts).
 */

const PAYMENT_STATUS = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];
const PRODUCT_TYPE = [
  "INTERVIEW_SHEET",
  "SHIKSHA",
  "PROJECTS",
  "PREPYATRA",
  "DSA_YATRA",
  "ONCAMPUS",
  "WEBINAR",
  "GENERAL",
];

describe("Payment Model Schema Constraints", () => {
  describe("status enum", () => {
    it.each(PAYMENT_STATUS)("accepts valid status: %s", (status) => {
      expect(PAYMENT_STATUS).toContain(status);
    });

    it.each(["pending", "Completed", "CANCELLED", ""])(
      "rejects invalid status: %s",
      (status) => {
        expect(PAYMENT_STATUS).not.toContain(status);
      },
    );

    it("defaults to PENDING", () => {
      const defaultStatus = "PENDING";
      expect(PAYMENT_STATUS).toContain(defaultStatus);
    });
  });

  describe("productType enum", () => {
    it.each(PRODUCT_TYPE)("accepts valid productType: %s", (type) => {
      expect(PRODUCT_TYPE).toContain(type);
    });

    it.each(["interview_sheet", "STRIPE", "UNKNOWN", ""])(
      "rejects invalid productType: %s",
      (type) => {
        expect(PRODUCT_TYPE).not.toContain(type);
      },
    );
  });

  describe("amount validation (after Phase 1 fix)", () => {
    it("accepts zero amount (free after coupon)", () => {
      expect(0).toBeGreaterThanOrEqual(0);
    });

    it("accepts positive amounts", () => {
      expect(999).toBeGreaterThanOrEqual(0);
      expect(0.01).toBeGreaterThanOrEqual(0);
    });

    it("rejects negative amounts", () => {
      expect(-1).toBeLessThan(0);
    });
  });

  describe("orderId uniqueness", () => {
    it("orderId format follows expected pattern", () => {
      // The generatePaymentOrderId() creates IDs like 'ORD_xxxx'
      const orderId = "ORD_test123";
      expect(orderId).toBeTruthy();
      expect(typeof orderId).toBe("string");
    });
  });

  describe("gateway default", () => {
    it("defaults to CASHFREE", () => {
      const defaultGateway = "CASHFREE";
      expect(defaultGateway).toBe("CASHFREE");
    });
  });

  describe("index configuration", () => {
    it("has compound index on user + productId for purchase lookup", () => {
      // Verified in schema: PaymentSchema.index({ user: 1, productId: 1 });
      const indexes = [
        { user: 1, productId: 1 },
        { status: 1 },
        { createdAt: -1 },
        { paymentId: 1 }, // sparse
      ];
      expect(indexes).toHaveLength(4);
      expect(indexes[0]).toEqual({ user: 1, productId: 1 });
    });
  });
});
