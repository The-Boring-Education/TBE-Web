import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PaymentModel } from "../../../../api/src/lib/interfaces";

// Mock all database functions
const mockGetEnrolledSheetFromDB = vi.fn();
const mockEnrollInASheet = vi.fn();
const mockUpdateUserPointsInDB = vi.fn();
const mockGetEnrolledCourseFromDB = vi.fn();
const mockEnrollInACourse = vi.fn();
const mockGetActiveSubscriptionByUserFromDB = vi.fn();
const mockCreateSubscriptionInDB = vi.fn();
const mockUpdateUserSubscriptionStatusInDB = vi.fn();
const mockExtendSubscriptionInDB = vi.fn();

vi.mock("../../../../api/src/lib/database", () => ({
  getEnrolledSheetFromDB: (...args: unknown[]) =>
    mockGetEnrolledSheetFromDB(...args),
  enrollInASheet: (...args: unknown[]) => mockEnrollInASheet(...args),
  updateUserPointsInDB: (...args: unknown[]) =>
    mockUpdateUserPointsInDB(...args),
  getEnrolledCourseFromDB: (...args: unknown[]) =>
    mockGetEnrolledCourseFromDB(...args),
  enrollInACourse: (...args: unknown[]) => mockEnrollInACourse(...args),
  getActiveSubscriptionByUserFromDB: (...args: unknown[]) =>
    mockGetActiveSubscriptionByUserFromDB(...args),
  createSubscriptionInDB: (...args: unknown[]) =>
    mockCreateSubscriptionInDB(...args),
  updateUserSubscriptionStatusInDB: (...args: unknown[]) =>
    mockUpdateUserSubscriptionStatusInDB(...args),
  extendSubscriptionInDB: (...args: unknown[]) =>
    mockExtendSubscriptionInDB(...args),
}));

vi.mock("../../../../api/src/lib/constants", () => ({
  planTypeMap: {
    lifetime: { type: "Lifetime", duration: 999 },
    "3months": { type: "3Months", duration: 3 },
    "1month": { type: "1Month", duration: 1 },
    "6months": { type: "6Months", duration: 6 },
  },
}));

vi.mock("../../../../api/src/lib/utils", () => ({
  getPYSubscriptionFeaturesByType: vi.fn().mockReturnValue({
    unlimitedQuizzes: true,
    aiMockInterviews: true,
  }),
}));

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  ENROLLMENT_HANDLERS,
  executeEnrollmentHandler,
} from "../../../../api/src/lib/services/payment/enrollmentHandlers";

const createMockPayment = (
  overrides: Partial<PaymentModel> = {},
): PaymentModel =>
  ({
    _id: "payment_123",
    user: "user_123",
    productId: "product_123",
    productType: "INTERVIEW_SHEET",
    amount: 999,
    orderId: "order_123",
    paymentLink: "https://pay.example.com/order_123",
    status: "SUCCESS",
    ...overrides,
  }) as unknown as PaymentModel;

describe("Payment Enrollment Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtendSubscriptionInDB.mockResolvedValue({ data: {} });
  });

  describe("enrollInSheet handler", () => {
    it("should successfully enroll user in a sheet", async () => {
      mockGetEnrolledSheetFromDB.mockResolvedValue({ data: null });
      mockEnrollInASheet.mockResolvedValue({
        data: { _id: "enrollment_123" },
      });
      mockUpdateUserPointsInDB.mockResolvedValue({});

      const payment = createMockPayment({
        productType: "INTERVIEW_SHEET",
        productId: "sheet_456",
      });

      const result = await ENROLLMENT_HANDLERS.enrollInSheet(payment);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ _id: "enrollment_123" });
      expect(mockEnrollInASheet).toHaveBeenCalledWith({
        userId: "user_123",
        sheetId: "sheet_456",
      });
      expect(mockUpdateUserPointsInDB).toHaveBeenCalledWith(
        "user_123",
        "ENROLL_SHEET",
      );
    });

    it("should return success with alreadyEnrolled flag when user is already enrolled", async () => {
      mockGetEnrolledSheetFromDB.mockResolvedValue({
        data: { _id: "existing_enrollment" },
      });

      const payment = createMockPayment({
        productType: "INTERVIEW_SHEET",
        productId: "sheet_456",
      });

      const result = await ENROLLMENT_HANDLERS.enrollInSheet(payment);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ alreadyEnrolled: true });
      expect(mockEnrollInASheet).not.toHaveBeenCalled();
    });

    it("should return error when enrollment fails", async () => {
      mockGetEnrolledSheetFromDB.mockResolvedValue({ data: null });
      mockEnrollInASheet.mockResolvedValue({
        error: "Database error",
      });

      const payment = createMockPayment({
        productType: "INTERVIEW_SHEET",
      });

      const result = await ENROLLMENT_HANDLERS.enrollInSheet(payment);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });

    it("should handle unexpected errors gracefully", async () => {
      mockGetEnrolledSheetFromDB.mockRejectedValue(new Error("Network error"));

      const payment = createMockPayment({
        productType: "INTERVIEW_SHEET",
      });

      const result = await ENROLLMENT_HANDLERS.enrollInSheet(payment);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("enrollInCourse handler", () => {
    it("should successfully enroll user in a course", async () => {
      mockGetEnrolledCourseFromDB.mockResolvedValue({ data: null });
      mockEnrollInACourse.mockResolvedValue({
        data: { _id: "course_enrollment_123" },
      });
      mockUpdateUserPointsInDB.mockResolvedValue({});

      const payment = createMockPayment({
        productType: "SHIKSHA",
        productId: "course_789",
      });

      const result = await ENROLLMENT_HANDLERS.enrollInCourse(payment);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ _id: "course_enrollment_123" });
      expect(mockEnrollInACourse).toHaveBeenCalledWith({
        userId: "user_123",
        courseId: "course_789",
      });
      expect(mockUpdateUserPointsInDB).toHaveBeenCalledWith(
        "user_123",
        "ENROLL_COURSE",
      );
    });

    it("should return success with alreadyEnrolled flag when user is already enrolled", async () => {
      mockGetEnrolledCourseFromDB.mockResolvedValue({
        data: { _id: "existing_course_enrollment" },
      });

      const payment = createMockPayment({
        productType: "SHIKSHA",
        productId: "course_789",
      });

      const result = await ENROLLMENT_HANDLERS.enrollInCourse(payment);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ alreadyEnrolled: true });
      expect(mockEnrollInACourse).not.toHaveBeenCalled();
    });

    it("should return error when course enrollment fails", async () => {
      mockGetEnrolledCourseFromDB.mockResolvedValue({ data: null });
      mockEnrollInACourse.mockResolvedValue({
        error: "Course not found",
      });

      const payment = createMockPayment({
        productType: "SHIKSHA",
      });

      const result = await ENROLLMENT_HANDLERS.enrollInCourse(payment);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Course not found");
    });
  });

  describe("createSubscription handler", () => {
    it("should successfully create a new subscription", async () => {
      mockGetActiveSubscriptionByUserFromDB.mockResolvedValue({ data: null });
      mockCreateSubscriptionInDB.mockResolvedValue({
        data: { _id: "sub_123" },
      });
      mockUpdateUserSubscriptionStatusInDB.mockResolvedValue({});

      const payment = createMockPayment({
        productType: "PREPYATRA",
        productId: "lifetime",
        amount: 4999,
      });

      const result = await ENROLLMENT_HANDLERS.createSubscription(payment);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        plan: "Lifetime",
      });
      expect(mockCreateSubscriptionInDB).toHaveBeenCalled();
      expect(mockUpdateUserSubscriptionStatusInDB).toHaveBeenCalledWith({
        userId: "user_123",
        subscriptionStatus: "Active",
        subscriptionExpiry: expect.any(Date),
      });
    });

    it("should return alreadyEnrolled when user has active subscription", async () => {
      mockGetActiveSubscriptionByUserFromDB.mockResolvedValue({
        data: { _id: "existing_sub", expiryDate: new Date() },
      });

      const payment = createMockPayment({
        productType: "PREPYATRA",
        productId: "3months",
      });

      const result = await ENROLLMENT_HANDLERS.createSubscription(payment);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        extended: true,
      });
      expect(mockExtendSubscriptionInDB).toHaveBeenCalled();
      expect(mockCreateSubscriptionInDB).not.toHaveBeenCalled();
    });

    it("should return error when subscription creation fails", async () => {
      mockGetActiveSubscriptionByUserFromDB.mockResolvedValue({ data: null });
      mockCreateSubscriptionInDB.mockResolvedValue({
        error: "Failed to create subscription",
      });

      const payment = createMockPayment({
        productType: "DSA_YATRA",
        productId: "6months",
      });

      const result = await ENROLLMENT_HANDLERS.createSubscription(payment);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create subscription");
    });

    it("should return error when user subscription status update fails", async () => {
      mockGetActiveSubscriptionByUserFromDB.mockResolvedValue({ data: null });
      mockCreateSubscriptionInDB.mockResolvedValue({
        data: { _id: "sub_new" },
      });
      mockUpdateUserSubscriptionStatusInDB.mockResolvedValue({
        error: "Update failed",
      });

      const payment = createMockPayment({
        productType: "ONCAMPUS",
        productId: "1month",
      });

      const result = await ENROLLMENT_HANDLERS.createSubscription(payment);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });

    it("should use default plan type when productId not in planTypeMap", async () => {
      mockGetActiveSubscriptionByUserFromDB.mockResolvedValue({ data: null });
      mockCreateSubscriptionInDB.mockResolvedValue({
        data: { _id: "sub_default" },
      });
      mockUpdateUserSubscriptionStatusInDB.mockResolvedValue({});

      const payment = createMockPayment({
        productType: "PREPYATRA",
        productId: "unknown_plan",
      });

      const result = await ENROLLMENT_HANDLERS.createSubscription(payment);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        plan: "3Months", // Default
      });
    });

    it("should set lifetime expiry date to 2099 for lifetime plans", async () => {
      mockGetActiveSubscriptionByUserFromDB.mockResolvedValue({ data: null });
      mockCreateSubscriptionInDB.mockResolvedValue({
        data: { _id: "sub_lifetime" },
      });
      mockUpdateUserSubscriptionStatusInDB.mockResolvedValue({});

      const payment = createMockPayment({
        productType: "PREPYATRA",
        productId: "lifetime",
      });

      const result = await ENROLLMENT_HANDLERS.createSubscription(payment);

      expect(result.success).toBe(true);
      expect(result.data.expiryDate.getFullYear()).toBe(2099);
    });
  });

  describe("executeEnrollmentHandler", () => {
    it("should execute the correct handler for enrollInSheet", async () => {
      mockGetEnrolledSheetFromDB.mockResolvedValue({ data: null });
      mockEnrollInASheet.mockResolvedValue({ data: { _id: "enrollment" } });
      mockUpdateUserPointsInDB.mockResolvedValue({});

      const payment = createMockPayment({ productType: "INTERVIEW_SHEET" });

      const result = await executeEnrollmentHandler("enrollInSheet", payment);

      expect(result.success).toBe(true);
    });

    it("should execute the correct handler for enrollInCourse", async () => {
      mockGetEnrolledCourseFromDB.mockResolvedValue({ data: null });
      mockEnrollInACourse.mockResolvedValue({ data: { _id: "enrollment" } });
      mockUpdateUserPointsInDB.mockResolvedValue({});

      const payment = createMockPayment({ productType: "SHIKSHA" });

      const result = await executeEnrollmentHandler("enrollInCourse", payment);

      expect(result.success).toBe(true);
    });

    it("should execute the correct handler for createSubscription", async () => {
      mockGetActiveSubscriptionByUserFromDB.mockResolvedValue({ data: null });
      mockCreateSubscriptionInDB.mockResolvedValue({ data: {} });
      mockUpdateUserSubscriptionStatusInDB.mockResolvedValue({});

      const payment = createMockPayment({
        productType: "PREPYATRA",
        productId: "3months",
      });

      const result = await executeEnrollmentHandler(
        "createSubscription",
        payment,
      );

      expect(result.success).toBe(true);
    });

    it("should throw error for unknown handler name", async () => {
      const payment = createMockPayment();

      await expect(
        executeEnrollmentHandler("unknownHandler" as any, payment),
      ).rejects.toThrow('Enrollment handler "unknownHandler" not found');
    });
  });
});
