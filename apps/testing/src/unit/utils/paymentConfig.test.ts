import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * paymentConfig reads env vars at module scope, so each scenario needs a
 * fresh module import after setting the env. We use vi.resetModules() +
 * dynamic import() for this.
 */

type PaymentConfigModule =
  typeof import("../../../../../packages/constants/src/paymentConfig");

const importFresh = async (): Promise<PaymentConfigModule> => {
  vi.resetModules();
  return (await import("../../../../../packages/constants/src/paymentConfig")) as PaymentConfigModule;
};

describe("paymentConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getCashfreeMode", () => {
    it("should return 'sandbox' when NEXT_PUBLIC_CASHFREE_MODE=sandbox", async () => {
      vi.stubEnv("NEXT_PUBLIC_CASHFREE_MODE", "sandbox");
      vi.stubEnv("CASHFREE_BASE_URL", "");

      const { getCashfreeMode } = await importFresh();
      expect(getCashfreeMode()).toBe("sandbox");
    });

    it("should return 'production' when NEXT_PUBLIC_CASHFREE_MODE=production", async () => {
      vi.stubEnv("NEXT_PUBLIC_CASHFREE_MODE", "production");
      vi.stubEnv("CASHFREE_BASE_URL", "https://sandbox.cashfree.com/pg");

      const { getCashfreeMode } = await importFresh();
      expect(getCashfreeMode()).toBe("production");
    });

    it("should derive 'sandbox' from CASHFREE_BASE_URL containing 'sandbox'", async () => {
      vi.stubEnv("NEXT_PUBLIC_CASHFREE_MODE", "");
      vi.stubEnv("CASHFREE_BASE_URL", "https://sandbox.cashfree.com/pg");

      const { getCashfreeMode } = await importFresh();
      expect(getCashfreeMode()).toBe("sandbox");
    });

    it("should derive 'production' from CASHFREE_BASE_URL without 'sandbox'", async () => {
      vi.stubEnv("NEXT_PUBLIC_CASHFREE_MODE", "");
      vi.stubEnv("CASHFREE_BASE_URL", "https://api.cashfree.com/pg");

      const { getCashfreeMode } = await importFresh();
      expect(getCashfreeMode()).toBe("production");
    });

    it("should default to 'sandbox' when no env vars are set", async () => {
      vi.stubEnv("NEXT_PUBLIC_CASHFREE_MODE", "");
      vi.stubEnv("CASHFREE_BASE_URL", "");

      const { getCashfreeMode } = await importFresh();
      expect(getCashfreeMode()).toBe("sandbox");
    });

    it("should prioritize NEXT_PUBLIC_CASHFREE_MODE over CASHFREE_BASE_URL", async () => {
      vi.stubEnv("NEXT_PUBLIC_CASHFREE_MODE", "sandbox");
      vi.stubEnv("CASHFREE_BASE_URL", "https://api.cashfree.com/pg");

      const { getCashfreeMode } = await importFresh();
      expect(getCashfreeMode()).toBe("sandbox");
    });
  });

  describe("isCashfreeSandbox", () => {
    it("should return true in sandbox mode", async () => {
      vi.stubEnv("NEXT_PUBLIC_CASHFREE_MODE", "sandbox");

      const { isCashfreeSandbox } = await importFresh();
      expect(isCashfreeSandbox()).toBe(true);
    });

    it("should return false in production mode", async () => {
      vi.stubEnv("NEXT_PUBLIC_CASHFREE_MODE", "production");

      const { isCashfreeSandbox } = await importFresh();
      expect(isCashfreeSandbox()).toBe(false);
    });
  });

  describe("getCashfreePgBaseUrl", () => {
    it("should append /pg when missing", async () => {
      vi.stubEnv("CASHFREE_BASE_URL", "https://sandbox.cashfree.com");

      const { getCashfreePgBaseUrl } = await importFresh();
      expect(getCashfreePgBaseUrl()).toBe("https://sandbox.cashfree.com/pg");
    });

    it("should not double-append /pg", async () => {
      vi.stubEnv("CASHFREE_BASE_URL", "https://sandbox.cashfree.com/pg");

      const { getCashfreePgBaseUrl } = await importFresh();
      expect(getCashfreePgBaseUrl()).toBe("https://sandbox.cashfree.com/pg");
    });

    it("should strip trailing slashes before appending /pg", async () => {
      vi.stubEnv("CASHFREE_BASE_URL", "https://sandbox.cashfree.com/");

      const { getCashfreePgBaseUrl } = await importFresh();
      expect(getCashfreePgBaseUrl()).toBe("https://sandbox.cashfree.com/pg");
    });

    it("should return empty string when CASHFREE_BASE_URL is not set", async () => {
      vi.stubEnv("CASHFREE_BASE_URL", "");

      const { getCashfreePgBaseUrl } = await importFresh();
      expect(getCashfreePgBaseUrl()).toBe("");
    });

    it("should work with production URL", async () => {
      vi.stubEnv("CASHFREE_BASE_URL", "https://api.cashfree.com");

      const { getCashfreePgBaseUrl } = await importFresh();
      expect(getCashfreePgBaseUrl()).toBe("https://api.cashfree.com/pg");
    });
  });

  describe("paymentConfig object", () => {
    it("should expose all Cashfree credentials", async () => {
      vi.stubEnv("CASHFREE_BASE_URL", "https://sandbox.cashfree.com/pg");
      vi.stubEnv("CASHFREE_CLIENT_ID", "test-client-id");
      vi.stubEnv("CASHFREE_SECRET_KEY", "test-secret-key");

      const { paymentConfig } = await importFresh();
      expect(paymentConfig.CASHFREE_BASE_URL).toBe(
        "https://sandbox.cashfree.com/pg",
      );
      expect(paymentConfig.CASHFREE_CLIENT_ID).toBe("test-client-id");
      expect(paymentConfig.CASHFREE_SECRET_KEY).toBe("test-secret-key");
    });

    it("should default credentials to empty string when not set", async () => {
      vi.stubEnv("CASHFREE_BASE_URL", "");
      vi.stubEnv("CASHFREE_CLIENT_ID", "");
      vi.stubEnv("CASHFREE_SECRET_KEY", "");

      const { paymentConfig } = await importFresh();
      expect(paymentConfig.CASHFREE_BASE_URL).toBe("");
      expect(paymentConfig.CASHFREE_CLIENT_ID).toBe("");
      expect(paymentConfig.CASHFREE_SECRET_KEY).toBe("");
    });
  });
});
