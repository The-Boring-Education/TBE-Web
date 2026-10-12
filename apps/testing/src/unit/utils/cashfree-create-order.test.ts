import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockLogger } = vi.hoisted(() => ({
  mockLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@tbe/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/constants")>();
  return {
    ...actual,
    getCashfreePgBaseUrl: () => "https://api.cashfree.com/pg",
    getCashfreeMode: () => "production" as const,
    paymentConfig: {
      ...actual.paymentConfig,
      CASHFREE_CLIENT_ID: "live_app_1234567890",
      CASHFREE_SECRET_KEY: "cfsk_ma_prod_super_secret",
      CASHFREE_BASE_URL: "https://api.cashfree.com/pg",
    },
  };
});

vi.mock("../../../../api/src/lib/utils/logger", () => ({
  logger: mockLogger,
}));

vi.mock("../../../../api/src/lib/constants", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("../../../../api/src/lib/constants")
  >();
  return {
    ...actual,
    envConfig: {
      ...actual.envConfig,
      PLATFORM_URL: "https://www.theboringeducation.com",
    },
  };
});

import { createCashfreeOrder } from "../../../../api/src/lib/utils/functions";

const orderPayload = {
  order_id: "order_test_1",
  order_amount: 1399,
  order_currency: "INR",
  customer_details: {
    customer_id: "user_abc",
    customer_name: "Test User",
    customer_email: "test@example.com",
    customer_phone: "0000000000",
  },
  order_meta: {
    return_url:
      "https://www.theboringeducation.com/payment/status?order_id=order_test_1",
  },
};

describe("createCashfreeOrder logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message:
            "transactions are not enabled for your payment gateway account",
          code: "request_failed",
          type: "invalid_request_error",
        }),
      }),
    );
  });

  it("logs request diagnostics and the sanitized gateway rejection", async () => {
    const result = await createCashfreeOrder(orderPayload);

    expect(result.ok).toBe(false);
    expect(result.gatewayMessage).toContain("transactions are not enabled");
    expect(result.gatewayCode).toBe("request_failed");

    expect(mockLogger.info).toHaveBeenCalledWith(
      "Cashfree create order request",
      expect.objectContaining({
        mode: "production",
        pgBaseUrl: "https://api.cashfree.com/pg",
        ordersUrl: "https://api.cashfree.com/pg/orders",
        clientIdConfigured: true,
        secretConfigured: true,
        clientIdSuffix: "…7890",
        orderId: "order_test_1",
        orderAmount: 1399,
        returnUrlProtocol: "https",
      }),
    );

    const requestMeta = mockLogger.info.mock.calls.find(
      (call) => call[0] === "Cashfree create order request",
    )?.[1] as Record<string, unknown>;
    expect(JSON.stringify(requestMeta)).not.toContain("super_secret");
    expect(JSON.stringify(requestMeta)).not.toContain("live_app_1234567890");

    expect(mockLogger.warn).toHaveBeenCalledWith(
      "Cashfree create order rejected",
      expect.objectContaining({
        httpStatus: 400,
        gatewayMessage:
          "transactions are not enabled for your payment gateway account",
        gatewayCode: "request_failed",
        gatewayType: "invalid_request_error",
        gatewayBody: expect.objectContaining({
          message:
            "transactions are not enabled for your payment gateway account",
        }),
      }),
    );
  });
});
