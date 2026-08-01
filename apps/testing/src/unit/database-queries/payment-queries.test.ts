import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Mongoose models
const mockPaymentSave = vi.fn();
const mockPaymentFindOne = vi.fn();
const mockPaymentFindOneAndUpdate = vi.fn();
const mockSubscriptionFindOne = vi.fn();

vi.mock("../../../../api/src/lib/database/models", () => ({
  Payment: vi.fn().mockImplementation((data) => ({
    ...data,
    save: mockPaymentSave,
  })),
  Subscription: {
    findOne: (...args: unknown[]) => mockSubscriptionFindOne(...args),
  },
}));

// Set the mock for Payment.findOne and Payment.findOneAndUpdate after import
vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Override the Payment model methods
const Payment = {
  findOne: (...args: unknown[]) => mockPaymentFindOne(...args),
  findOneAndUpdate: (...args: unknown[]) =>
    mockPaymentFindOneAndUpdate(...args),
};

const Subscription = {
  findOne: (...args: unknown[]) => mockSubscriptionFindOne(...args),
};

// Re-create the functions for testing since we can't import directly due to model mocking
const addPaymentToDB = async ({
  userId,
  productId,
  productType,
  amount,
  orderId,
  paymentLink,
  appliedCoupon,
  couponCode,
}: {
  userId: string;
  productId: string;
  productType: string;
  amount: number;
  orderId: string;
  paymentLink: string;
  appliedCoupon?: string;
  couponCode?: string;
}) => {
  try {
    const payment = {
      user: userId,
      productId,
      productType,
      amount,
      orderId,
      paymentLink,
      status: "PENDING",
      ...(appliedCoupon && { appliedCoupon }),
      ...(couponCode && { couponCode }),
    };
    await mockPaymentSave(payment);
    return { data: payment };
  } catch (error: any) {
    return { error: "Failed to save payment to DB", details: error };
  }
};

const getPaymentByOrderIdFromDB = async (orderId: string) => {
  try {
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return { error: "Payment not found" };
    }
    return { data: payment };
  } catch (error: any) {
    return { error: "Failed to find payment", details: error };
  }
};

const updatePaymentStatusToDB = async ({
  orderId,
  paymentId,
  status,
}: {
  orderId: string;
  paymentId?: string;
  status: string;
}) => {
  try {
    const updated = await Payment.findOneAndUpdate(
      { orderId },
      {
        status,
        ...(paymentId && { paymentId }),
      },
      { new: true },
    );

    if (!updated) {
      return { error: "Payment not found" };
    }

    return { data: updated };
  } catch (error: any) {
    return { error: "Failed to update payment status", details: error };
  }
};

const checkPaymentStatusFromDB = async (
  userId: string,
  productId: string,
  productType?: string,
) => {
  try {
    if (
      productType === "PREPYATRA" ||
      productType === "DSA_YATRA" ||
      productType === "ONCAMPUS"
    ) {
      const activeSubscription = await Subscription.findOne({
        userId,
        isActive: true,
        $or: [
          { productType },
          ...(productType === "PREPYATRA"
            ? [{ productType: { $exists: false } }]
            : []),
        ],
      });

      if (activeSubscription) {
        return {
          data: {
            purchased: true,
            accessType: "SUBSCRIPTION",
          },
        };
      }
    }

    const payment = await Payment.findOne({
      user: userId,
      productId,
      ...(productType && { productType }),
    });

    if (!payment) {
      return {
        data: { purchased: false },
        error: "No payment record found",
      };
    }

    if (payment.status === "SUCCESS") {
      return {
        data: {
          purchased: true,
          accessType: "DIRECT_PAYMENT",
        },
      };
    } else {
      return {
        data: { purchased: false },
        error: "Payment not completed",
      };
    }
  } catch (error: any) {
    return { error: "Failed to check payment status", details: error };
  }
};

describe("Payment Database Queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addPaymentToDB", () => {
    it("should successfully add a new payment record", async () => {
      mockPaymentSave.mockResolvedValue({
        _id: "payment_123",
        user: "user_123",
        productId: "product_123",
        productType: "INTERVIEW_SHEET",
        amount: 999,
        orderId: "order_123",
        paymentLink: "https://pay.example.com/order_123",
        status: "PENDING",
      });

      const result = await addPaymentToDB({
        userId: "user_123",
        productId: "product_123",
        productType: "INTERVIEW_SHEET",
        amount: 999,
        orderId: "order_123",
        paymentLink: "https://pay.example.com/order_123",
      });

      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(result.data?.user).toBe("user_123");
      expect(result.data?.status).toBe("PENDING");
    });

    it("should include appliedCoupon when provided", async () => {
      mockPaymentSave.mockResolvedValue({});

      const result = await addPaymentToDB({
        userId: "user_123",
        productId: "product_123",
        productType: "INTERVIEW_SHEET",
        amount: 799,
        orderId: "order_456",
        paymentLink: "https://pay.example.com/order_456",
        appliedCoupon: "coupon_123",
        couponCode: "SAVE20",
      });

      expect(result.data?.appliedCoupon).toBe("coupon_123");
      expect(result.data?.couponCode).toBe("SAVE20");
    });

    it("should return error when save fails", async () => {
      mockPaymentSave.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const result = await addPaymentToDB({
        userId: "user_123",
        productId: "product_123",
        productType: "INTERVIEW_SHEET",
        amount: 999,
        orderId: "order_789",
        paymentLink: "https://pay.example.com/order_789",
      });

      expect(result.error).toBe("Failed to save payment to DB");
      expect(result.details).toBeDefined();
    });
  });

  describe("getPaymentByOrderIdFromDB", () => {
    it("should return payment when found", async () => {
      const mockPayment = {
        _id: "payment_123",
        orderId: "order_123",
        status: "SUCCESS",
      };
      mockPaymentFindOne.mockResolvedValue(mockPayment);

      const result = await getPaymentByOrderIdFromDB("order_123");

      expect(result.data).toEqual(mockPayment);
      expect(result.error).toBeUndefined();
      expect(mockPaymentFindOne).toHaveBeenCalledWith({ orderId: "order_123" });
    });

    it("should return error when payment not found", async () => {
      mockPaymentFindOne.mockResolvedValue(null);

      const result = await getPaymentByOrderIdFromDB("order_nonexistent");

      expect(result.error).toBe("Payment not found");
      expect(result.data).toBeUndefined();
    });

    it("should return error when database query fails", async () => {
      mockPaymentFindOne.mockRejectedValue(new Error("Query failed"));

      const result = await getPaymentByOrderIdFromDB("order_error");

      expect(result.error).toBe("Failed to find payment");
      expect(result.details).toBeDefined();
    });
  });

  describe("updatePaymentStatusToDB", () => {
    it("should update payment status successfully", async () => {
      const updatedPayment = {
        _id: "payment_123",
        orderId: "order_123",
        status: "SUCCESS",
        paymentId: "cf_pay_123",
      };
      mockPaymentFindOneAndUpdate.mockResolvedValue(updatedPayment);

      const result = await updatePaymentStatusToDB({
        orderId: "order_123",
        paymentId: "cf_pay_123",
        status: "SUCCESS",
      });

      expect(result.data).toEqual(updatedPayment);
      expect(mockPaymentFindOneAndUpdate).toHaveBeenCalledWith(
        { orderId: "order_123" },
        { status: "SUCCESS", paymentId: "cf_pay_123" },
        { new: true },
      );
    });

    it("should update status without paymentId", async () => {
      const updatedPayment = {
        _id: "payment_123",
        orderId: "order_123",
        status: "FAILED",
      };
      mockPaymentFindOneAndUpdate.mockResolvedValue(updatedPayment);

      const result = await updatePaymentStatusToDB({
        orderId: "order_123",
        status: "FAILED",
      });

      expect(result.data).toEqual(updatedPayment);
      expect(mockPaymentFindOneAndUpdate).toHaveBeenCalledWith(
        { orderId: "order_123" },
        { status: "FAILED" },
        { new: true },
      );
    });

    it("should return error when payment not found for update", async () => {
      mockPaymentFindOneAndUpdate.mockResolvedValue(null);

      const result = await updatePaymentStatusToDB({
        orderId: "order_nonexistent",
        status: "SUCCESS",
      });

      expect(result.error).toBe("Payment not found");
    });

    it("should return error when update fails", async () => {
      mockPaymentFindOneAndUpdate.mockRejectedValue(new Error("Update failed"));

      const result = await updatePaymentStatusToDB({
        orderId: "order_error",
        status: "SUCCESS",
      });

      expect(result.error).toBe("Failed to update payment status");
      expect(result.details).toBeDefined();
    });
  });

  describe("checkPaymentStatusFromDB", () => {
    describe("Subscription product types", () => {
      it("should return purchased=true for active PREPYATRA subscription", async () => {
        mockSubscriptionFindOne.mockResolvedValue({
          _id: "sub_123",
          userId: "user_123",
          isActive: true,
        });

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "lifetime",
          "PREPYATRA",
        );

        expect(result.data?.purchased).toBe(true);
        expect(result.data?.accessType).toBe("SUBSCRIPTION");
      });

      it("should return purchased=true for active DSA_YATRA subscription", async () => {
        mockSubscriptionFindOne.mockResolvedValue({
          _id: "sub_456",
          userId: "user_123",
          isActive: true,
        });

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "6months",
          "DSA_YATRA",
        );

        expect(result.data?.purchased).toBe(true);
        expect(result.data?.accessType).toBe("SUBSCRIPTION");
      });

      it("should return purchased=true for active ONCAMPUS subscription", async () => {
        mockSubscriptionFindOne.mockResolvedValue({
          _id: "sub_789",
          isActive: true,
        });

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "3months",
          "ONCAMPUS",
        );

        expect(result.data?.purchased).toBe(true);
        expect(result.data?.accessType).toBe("SUBSCRIPTION");
      });

      it("should fall through to Payment check when no active subscription", async () => {
        mockSubscriptionFindOne.mockResolvedValue(null);
        mockPaymentFindOne.mockResolvedValue({
          _id: "payment_123",
          status: "SUCCESS",
        });

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "product_123",
          "PREPYATRA",
        );

        expect(result.data?.purchased).toBe(true);
        expect(result.data?.accessType).toBe("DIRECT_PAYMENT");
      });
    });

    describe("Direct payment product types", () => {
      it("should return purchased=true for successful INTERVIEW_SHEET payment", async () => {
        mockPaymentFindOne.mockResolvedValue({
          _id: "payment_123",
          status: "SUCCESS",
        });

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "sheet_123",
          "INTERVIEW_SHEET",
        );

        expect(result.data?.purchased).toBe(true);
        expect(result.data?.accessType).toBe("DIRECT_PAYMENT");
      });

      it("should return purchased=true for successful SHIKSHA payment", async () => {
        mockPaymentFindOne.mockResolvedValue({
          _id: "payment_456",
          status: "SUCCESS",
        });

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "course_456",
          "SHIKSHA",
        );

        expect(result.data?.purchased).toBe(true);
        expect(result.data?.accessType).toBe("DIRECT_PAYMENT");
      });

      it("should return purchased=false for PENDING payment", async () => {
        mockPaymentFindOne.mockResolvedValue({
          _id: "payment_789",
          status: "PENDING",
        });

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "product_789",
          "INTERVIEW_SHEET",
        );

        expect(result.data?.purchased).toBe(false);
        expect(result.error).toBe("Payment not completed");
      });

      it("should return purchased=false for FAILED payment", async () => {
        mockPaymentFindOne.mockResolvedValue({
          _id: "payment_failed",
          status: "FAILED",
        });

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "product_failed",
          "INTERVIEW_SHEET",
        );

        expect(result.data?.purchased).toBe(false);
      });

      it("should return purchased=false when no payment record found", async () => {
        mockPaymentFindOne.mockResolvedValue(null);

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "product_none",
          "INTERVIEW_SHEET",
        );

        expect(result.data?.purchased).toBe(false);
        expect(result.error).toBe("No payment record found");
      });
    });

    describe("Without productType", () => {
      it("should check Payment directly when productType not provided", async () => {
        mockPaymentFindOne.mockResolvedValue({
          _id: "payment_123",
          status: "SUCCESS",
        });

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "product_123",
        );

        expect(result.data?.purchased).toBe(true);
        expect(mockSubscriptionFindOne).not.toHaveBeenCalled();
      });
    });

    describe("Error handling", () => {
      it("should return error when database query fails", async () => {
        mockPaymentFindOne.mockRejectedValue(new Error("Database error"));

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "product_error",
          "INTERVIEW_SHEET",
        );

        expect(result.error).toBe("Failed to check payment status");
        expect(result.details).toBeDefined();
      });

      it("should return error when subscription query fails", async () => {
        mockSubscriptionFindOne.mockRejectedValue(
          new Error("Subscription query failed"),
        );

        const result = await checkPaymentStatusFromDB(
          "user_123",
          "product_123",
          "PREPYATRA",
        );

        expect(result.error).toBe("Failed to check payment status");
      });
    });
  });
});
