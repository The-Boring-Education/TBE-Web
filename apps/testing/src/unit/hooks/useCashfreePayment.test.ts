import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCashfreeMode = vi.fn();
vi.mock("@tbe/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/constants")>();
  return {
    ...actual,
    getCashfreeMode: () => mockGetCashfreeMode(),
  };
});

import useCashfreePayment from "@tbe/hooks/useCashfreePayment";

describe("useCashfreePayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCashfreeMode.mockReturnValue("sandbox");
    delete (window as any).Cashfree;
    delete (window as any).CFPaymentSDK;
  });

  afterEach(() => {
    document
      .querySelectorAll(
        'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]',
      )
      .forEach((el) => el.remove());
  });

  it("injects the Cashfree SDK script when not already loaded", () => {
    renderHook(() => useCashfreePayment());

    const script = document.querySelector(
      'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]',
    );
    expect(script).not.toBeNull();
  });

  it("marks the SDK as loaded once the script fires onload with window.Cashfree set", () => {
    const { result } = renderHook(() => useCashfreePayment());
    const script = document.querySelector(
      'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]',
    ) as HTMLScriptElement;

    (window as any).Cashfree = vi.fn();
    act(() => {
      script.onload?.(new Event("load"));
    });

    expect(result.current.isCashfreeLoaded).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("sets an error when the script loads but the SDK global is missing", () => {
    const { result } = renderHook(() => useCashfreePayment());
    const script = document.querySelector(
      'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]',
    ) as HTMLScriptElement;

    act(() => {
      script.onload?.(new Event("load"));
    });

    expect(result.current.isCashfreeLoaded).toBe(false);
    expect(result.current.error).toBe(
      "Payment gateway initialization failed. Please refresh the page.",
    );
  });

  it("sets an error when the script fails to load", () => {
    const { result } = renderHook(() => useCashfreePayment());
    const script = document.querySelector(
      'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]',
    ) as HTMLScriptElement;

    act(() => {
      script.onerror?.(new Event("error"));
    });

    expect(result.current.error).toBe(
      "Failed to load payment gateway. Please try again.",
    );
    expect(result.current.isCashfreeLoaded).toBe(false);
  });

  it("does not inject a script when the SDK is already present on window", () => {
    (window as any).Cashfree = vi.fn();

    const { result } = renderHook(() => useCashfreePayment());

    expect(result.current.isCashfreeLoaded).toBe(true);
    const script = document.querySelector(
      'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]',
    );
    expect(script).toBeNull();
  });

  it("throws when launching payment without a loaded SDK", async () => {
    const { result } = renderHook(() => useCashfreePayment());

    await expect(result.current.launchPayment("session-1")).rejects.toThrow(
      "Payment gateway is not available. Please refresh the page and try again.",
    );
  });

  it("launches checkout with the sandbox mode and provided session id", async () => {
    const checkout = vi.fn().mockResolvedValue(undefined);
    const CashfreeMock = vi.fn().mockImplementation(() => ({ checkout }));
    (window as any).Cashfree = CashfreeMock;
    mockGetCashfreeMode.mockReturnValue("sandbox");

    const { result } = renderHook(() => useCashfreePayment());

    await act(async () => {
      await result.current.launchPayment("session-123");
    });

    expect(CashfreeMock).toHaveBeenCalledWith({ mode: "sandbox" });
    expect(checkout).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentSessionId: "session-123",
        redirectTarget: "_self",
      }),
    );
  });

  it("uses production mode when getCashfreeMode returns production", async () => {
    const checkout = vi.fn().mockResolvedValue(undefined);
    const CashfreeMock = vi.fn().mockImplementation(() => ({ checkout }));
    (window as any).Cashfree = CashfreeMock;
    mockGetCashfreeMode.mockReturnValue("production");

    const { result } = renderHook(() => useCashfreePayment());

    await act(async () => {
      await result.current.launchPayment("session-456");
    });

    expect(CashfreeMock).toHaveBeenCalledWith({ mode: "production" });
  });

  it("uses production mode when the payment link is on api.cashfree.com", async () => {
    const checkout = vi.fn().mockResolvedValue(undefined);
    const CashfreeMock = vi.fn().mockImplementation(() => ({ checkout }));
    (window as any).Cashfree = CashfreeMock;
    mockGetCashfreeMode.mockReturnValue("sandbox");

    const { result } = renderHook(() => useCashfreePayment());

    await act(async () => {
      await result.current.launchPayment(
        "session-prod",
        undefined,
        undefined,
        undefined,
        "https://www.theboringeducation.com/payment/status",
        "https://api.cashfree.com/checkout?paymentSessionId=session-prod",
      );
    });

    expect(CashfreeMock).toHaveBeenCalledWith({ mode: "production" });
  });

  it("uses sandbox mode when the payment link is on sandbox.cashfree.com", async () => {
    const checkout = vi.fn().mockResolvedValue(undefined);
    const CashfreeMock = vi.fn().mockImplementation(() => ({ checkout }));
    (window as any).Cashfree = CashfreeMock;
    mockGetCashfreeMode.mockReturnValue("production");

    const { result } = renderHook(() => useCashfreePayment());

    await act(async () => {
      await result.current.launchPayment(
        "session-sbx",
        undefined,
        undefined,
        undefined,
        undefined,
        "https://sandbox.cashfree.com/checkout?paymentSessionId=session-sbx",
      );
    });

    expect(CashfreeMock).toHaveBeenCalledWith({ mode: "sandbox" });
  });
});
