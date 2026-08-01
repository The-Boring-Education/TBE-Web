import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PaymentModel } from "../../../../api/src/lib/interfaces";

// Mock dependencies
const mockExecuteEnrollmentHandler = vi.fn();
const mockGetProductConfig = vi.fn();

vi.mock("../../../../api/src/lib/services/payment/enrollmentHandlers", () => ({
  executeEnrollmentHandler: (...args: unknown[]) =>
    mockExecuteEnrollmentHandler(...args),
}));

vi.mock("../../../../api/src/lib/constants/products", () => ({
  getProductConfig: (...args: unknown[]) => mockGetProductConfig(...args),
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import { processPostPaymentEnrollment } from "../../../../api/src/lib/services/payment/enrollmentService";

const createMockPayment = (
  overrides: Partial<PaymentModel> = {},
): PaymentModel =>
  ({
    _id: "payment_123",
    user: "user_123",
    productId: "product_123",
    productType: "INTERVIEW_SHEET",
    amount: 999,
    orderId: "order_abc123",
    paymentLink: "https://pay.example.com/order_abc123",
    status: "SUCCESS",
    ...overrides,
  }) as unknown as PaymentModel;

describe("Payment Enrollment Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("processPostPaymentEnrollment", () => {
    it("should successfully process enrollment when handler exists", async () => {
      mockGetProductConfig.mockReturnValue({
        type: "INTERVIEW_SHEET",
        accessType: "ONE_TIME",
        enrollmentHandler: "enrollInSheet",
      });
      mockExecuteEnrollmentHandler.mockResolvedValue({
        success: true,
        data: { enrollmentId: "enroll_123" },
      });

      const payment = createMockPayment({
        productType: "INTERVIEW_SHEET",
      });

      const result = await processPostPaymentEnrollment(payment);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ enrollmentId: "enroll_123" });
      expect(mockExecuteEnrollmentHandler).toHaveBeenCalledWith(
        "enrollInSheet",
        payment,
      );
    });

    it("should return success with noEnrollmentRequired when no handler configured", async () => {
      mockGetProductConfig.mockReturnValue({
        type: "WEBINAR",
        accessType: "ONE_TIME",
        // No enrollmentHandler
      });

      const payment = createMockPayment({
        productType: "WEBINAR",
      });

      const result = await processPostPaymentEnrollment(payment);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ noEnrollmentRequired: true });
      expect(mockExecuteEnrollmentHandler).not.toHaveBeenCalled();
    });

    it("should return error when enrollment handler fails", async () => {
      mockGetProductConfig.mockReturnValue({
        type: "SHIKSHA",
        accessType: "ONE_TIME",
        enrollmentHandler: "enrollInCourse",
      });
      mockExecuteEnrollmentHandler.mockResolvedValue({
        success: false,
        error: "Course not found",
      });

      const payment = createMockPayment({
        productType: "SHIKSHA",
        productId: "course_nonexistent",
      });

      const result = await processPostPaymentEnrollment(payment);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Course not found");
    });

    it("should handle subscription enrollment", async () => {
      mockGetProductConfig.mockReturnValue({
        type: "PREPYATRA",
        accessType: "SUBSCRIPTION",
        enrollmentHandler: "createSubscription",
      });
      mockExecuteEnrollmentHandler.mockResolvedValue({
        success: true,
        data: { subscriptionId: "sub_123", plan: "Lifetime" },
      });

      const payment = createMockPayment({
        productType: "PREPYATRA",
        productId: "lifetime",
      });

      const result = await processPostPaymentEnrollment(payment);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        subscriptionId: "sub_123",
        plan: "Lifetime",
      });
      expect(mockExecuteEnrollmentHandler).toHaveBeenCalledWith(
        "createSubscription",
        payment,
      );
    });

    it("should handle unexpected errors gracefully", async () => {
      mockGetProductConfig.mockImplementation(() => {
        throw new Error("Config error");
      });

      const payment = createMockPayment();

      const result = await processPostPaymentEnrollment(payment);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Config error");
    });

    it("should handle errors from executeEnrollmentHandler throwing", async () => {
      mockGetProductConfig.mockReturnValue({
        type: "INTERVIEW_SHEET",
        accessType: "ONE_TIME",
        enrollmentHandler: "enrollInSheet",
      });
      mockExecuteEnrollmentHandler.mockRejectedValue(
        new Error("Handler threw an error"),
      );

      const payment = createMockPayment({
        productType: "INTERVIEW_SHEET",
      });

      const result = await processPostPaymentEnrollment(payment);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Handler threw an error");
    });

    it("should handle DSA_YATRA product type", async () => {
      mockGetProductConfig.mockReturnValue({
        type: "DSA_YATRA",
        accessType: "SUBSCRIPTION",
        enrollmentHandler: "createSubscription",
      });
      mockExecuteEnrollmentHandler.mockResolvedValue({
        success: true,
        data: { subscriptionId: "dsa_sub_123" },
      });

      const payment = createMockPayment({
        productType: "DSA_YATRA",
        productId: "6months",
      });

      const result = await processPostPaymentEnrollment(payment);

      expect(result.success).toBe(true);
      expect(mockExecuteEnrollmentHandler).toHaveBeenCalledWith(
        "createSubscription",
        payment,
      );
    });

    it("should handle ONCAMPUS product type", async () => {
      mockGetProductConfig.mockReturnValue({
        type: "ONCAMPUS",
        accessType: "SUBSCRIPTION",
        enrollmentHandler: "createSubscription",
      });
      mockExecuteEnrollmentHandler.mockResolvedValue({
        success: true,
        data: { subscriptionId: "oncampus_sub_123" },
      });

      const payment = createMockPayment({
        productType: "ONCAMPUS",
        productId: "3months",
      });

      const result = await processPostPaymentEnrollment(payment);

      expect(result.success).toBe(true);
    });

    it("should handle PROJECTS product type without enrollment handler", async () => {
      mockGetProductConfig.mockReturnValue({
        type: "PROJECTS",
        accessType: "ONE_TIME",
        // No enrollmentHandler
      });

      const payment = createMockPayment({
        productType: "PROJECTS",
      });

      const result = await processPostPaymentEnrollment(payment);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ noEnrollmentRequired: true });
    });

    it("should handle non-Error objects thrown", async () => {
      mockGetProductConfig.mockImplementation(() => {
        throw "String error"; // Non-Error thrown
      });

      const payment = createMockPayment();

      const result = await processPostPaymentEnrollment(payment);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown enrollment error");
    });
  });
});
