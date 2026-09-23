import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetCashfreePgBaseUrl,
  mockGetCashfreeMode,
  mockPaymentConfig,
} = vi.hoisted(() => ({
  mockGetCashfreePgBaseUrl: vi.fn(),
  mockGetCashfreeMode: vi.fn(),
  mockPaymentConfig: {
    CASHFREE_CLIENT_ID: "live_app_1234567890",
    CASHFREE_SECRET_KEY: "cfsk_ma_prod_super_secret",
  },
}));

vi.mock("@tbe/constants", () => ({
  getCashfreePgBaseUrl: () => mockGetCashfreePgBaseUrl(),
  getCashfreeMode: () => mockGetCashfreeMode(),
  paymentConfig: mockPaymentConfig,
}));

import {
  extractCashfreeErrorDetails,
  getCashfreeConfigSnapshot,
  maskIdentifierSuffix,
  sanitizeCashfreeGatewayBody,
} from "../../../../api/src/lib/utils/cashfreeDiagnostics";

describe("Cashfree diagnostics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCashfreePgBaseUrl.mockReturnValue("https://api.cashfree.com/pg");
    mockGetCashfreeMode.mockReturnValue("production");
    mockPaymentConfig.CASHFREE_CLIENT_ID = "live_app_1234567890";
    mockPaymentConfig.CASHFREE_SECRET_KEY = "cfsk_ma_prod_super_secret";
  });

  describe("masking identifiers", () => {
    it("keeps only the last 4 characters", () => {
      expect(maskIdentifierSuffix("live_app_1234567890")).toBe("…7890");
    });

    it("fully masks short values", () => {
      expect(maskIdentifierSuffix("ab")).toBe("**");
    });

    it("returns empty string for missing values", () => {
      expect(maskIdentifierSuffix("")).toBe("");
    });
  });

  describe("config snapshot", () => {
    it("reports production URL, mode, and masked client id without secrets", () => {
      const snapshot = getCashfreeConfigSnapshot();

      expect(snapshot).toMatchObject({
        pgBaseUrl: "https://api.cashfree.com/pg",
        ordersUrl: "https://api.cashfree.com/pg/orders",
        mode: "production",
        looksLikeSandbox: false,
        modeUrlMismatch: false,
        clientIdConfigured: true,
        secretConfigured: true,
        clientIdSuffix: "…7890",
      });
      expect(JSON.stringify(snapshot)).not.toContain("super_secret");
      expect(JSON.stringify(snapshot)).not.toContain("live_app_1234567890");
    });

    it("flags sandbox URL with production mode", () => {
      mockGetCashfreePgBaseUrl.mockReturnValue(
        "https://sandbox.cashfree.com/pg",
      );
      mockGetCashfreeMode.mockReturnValue("production");

      expect(getCashfreeConfigSnapshot().modeUrlMismatch).toBe(true);
      expect(getCashfreeConfigSnapshot().looksLikeSandbox).toBe(true);
    });

    it("flags live URL with sandbox mode", () => {
      mockGetCashfreeMode.mockReturnValue("sandbox");

      expect(getCashfreeConfigSnapshot().modeUrlMismatch).toBe(true);
    });
  });

  describe("gateway error parsing", () => {
    it("reads message, code, and type from a Cashfree 400 body", () => {
      expect(
        extractCashfreeErrorDetails({
          message: "transactions are not enabled for your payment gateway account",
          code: "request_failed",
          type: "invalid_request_error",
        }),
      ).toEqual({
        message:
          "transactions are not enabled for your payment gateway account",
        code: "request_failed",
        type: "invalid_request_error",
        help: undefined,
      });
    });

    it("reads nested error.message", () => {
      expect(
        extractCashfreeErrorDetails({
          error: { message: "customer_phone_invalid", code: "validation_error" },
        }),
      ).toMatchObject({
        message: "customer_phone_invalid",
        code: "validation_error",
      });
    });

    it("sanitizes the gateway body to a small safe subset", () => {
      expect(
        sanitizeCashfreeGatewayBody({
          message: "order_meta.return_url : url should be https",
          code: "order_meta.return_url_invalid",
          type: "invalid_request_error",
          x_client_secret: "should-not-appear",
        }),
      ).toEqual({
        message: "order_meta.return_url : url should be https",
        code: "order_meta.return_url_invalid",
        type: "invalid_request_error",
      });
    });
  });
});
