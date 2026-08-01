import { describe, expect, it, vi } from "vitest";

const {
  mockCaptureException,
  mockCaptureMessage,
  mockSetUser,
  mockSetTag,
  mockSetContext,
  mockAddBreadcrumb,
  mockStartSpan,
} = vi.hoisted(() => ({
  mockCaptureException: vi.fn(),
  mockCaptureMessage: vi.fn(),
  mockSetUser: vi.fn(),
  mockSetTag: vi.fn(),
  mockSetContext: vi.fn(),
  mockAddBreadcrumb: vi.fn(),
  mockStartSpan: vi.fn((_config: unknown, callback: () => any) => callback()),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
  setUser: mockSetUser,
  setTag: mockSetTag,
  setContext: mockSetContext,
  addBreadcrumb: mockAddBreadcrumb,
  startSpan: mockStartSpan,
}));

import {
  addBreadcrumb,
  captureAPIError,
  captureAuthError,
  captureDatabaseError,
  captureException,
  captureMessage,
  capturePaymentError,
  setContext,
  setTag,
  setUser,
  startSpan,
  trackPerformance,
} from "@tbe/utils/sentry";

describe("sentry utils", () => {
  it("captureException forwards context with a default error level", () => {
    const error = new Error("boom");
    captureException(error);

    expect(mockCaptureException).toHaveBeenCalledWith(error, {
      tags: undefined,
      extra: undefined,
      user: undefined,
      level: "error",
    });
  });

  it("captureException respects a custom level", () => {
    const error = new Error("boom");
    captureException(error, { level: "fatal", tags: { a: "b" } });

    expect(mockCaptureException).toHaveBeenCalledWith(error, {
      tags: { a: "b" },
      extra: undefined,
      user: undefined,
      level: "fatal",
    });
  });

  it("captureMessage defaults to info level", () => {
    captureMessage("hello");

    expect(mockCaptureMessage).toHaveBeenCalledWith("hello", {
      tags: undefined,
      extra: undefined,
      level: "info",
    });
  });

  it("setUser, setTag, setContext delegate to Sentry", () => {
    setUser({ id: "1" });
    setTag("key", "value");
    setContext("ctx", { a: 1 });

    expect(mockSetUser).toHaveBeenCalledWith({ id: "1" });
    expect(mockSetTag).toHaveBeenCalledWith("key", "value");
    expect(mockSetContext).toHaveBeenCalledWith("ctx", { a: 1 });
  });

  it("captureAPIError tags the error with API-specific metadata", () => {
    const error = new Error("api failed");
    captureAPIError(error, "/api/v1/x", "POST", 500, { foo: "bar" });

    expect(mockCaptureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        tags: expect.objectContaining({
          section: "api",
          endpoint: "/api/v1/x",
          method: "POST",
          status_code: "500",
        }),
        level: "error",
      }),
    );
  });

  it("captureDatabaseError defaults collection to unknown", () => {
    const error = new Error("db failed");
    captureDatabaseError(error, "find");

    expect(mockCaptureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        tags: expect.objectContaining({
          section: "database",
          operation: "find",
          collection: "unknown",
        }),
      }),
    );
  });

  it("captureAuthError uses a warning level", () => {
    const error = new Error("auth failed");
    captureAuthError(error, "jwt", "user-1");

    expect(mockCaptureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        tags: expect.objectContaining({
          section: "authentication",
          auth_method: "jwt",
        }),
        level: "warning",
      }),
    );
  });

  it("capturePaymentError tags the payment method", () => {
    const error = new Error("payment failed");
    capturePaymentError(error, "cashfree", 999, "user-1");

    expect(mockCaptureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        tags: expect.objectContaining({
          section: "payment",
          payment_method: "cashfree",
        }),
        extra: expect.objectContaining({ amount: 999, userId: "user-1" }),
      }),
    );
  });

  it("trackPerformance adds a breadcrumb with the measured value", () => {
    trackPerformance("render", 42);

    expect(mockAddBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Performance: render",
        data: { value: 42, unit: "ms" },
      }),
    );
  });

  it("addBreadcrumb forwards message/category/data", () => {
    addBreadcrumb("clicked", "ui", { button: "submit" });

    expect(mockAddBreadcrumb).toHaveBeenCalledWith({
      message: "clicked",
      category: "ui",
      level: "info",
      data: { button: "submit" },
    });
  });

  it("startSpan invokes the callback within a Sentry span", () => {
    const callback = vi.fn(() => "result");
    const result = startSpan("op-name", "custom", callback);

    expect(mockStartSpan).toHaveBeenCalledWith(
      { name: "op-name", op: "custom" },
      callback,
    );
    expect(result).toBe("result");
  });
});
